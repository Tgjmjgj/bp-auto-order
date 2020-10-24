import get from 'lodash/get';
import maxBy from 'lodash/maxBy';
import partition from 'lodash/partition';

import { randomId, log, throwError } from './utils';
import { RandomConfigData, OrderItem } from '../../types/autoOrderConfigs';
import { AnyMenuItem } from '../../types/autoOrderMenus';

type SelectionStep = 'init' | 'minItem' | 'minCategory' | 'regular';

interface TechnicalOrderItem extends OrderItem {
    category: string
    selectionStep: SelectionStep[]
}

type OrderItemsMap = {
    [menuItemId: string]: number
};

type OrderCategoriesMap = {
    [targetId: string]: {
        [menuCategoryName: string]: number
    }
};

type RandomizeItemsAttempt = {
    items: TechnicalOrderItem[]
    cost: number
};

const prepareResult = (orderItems: TechnicalOrderItem[]): OrderItem[] => {
    log('@randomizeItems: result: ', orderItems);
    return orderItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        targetId: item.targetId,
        menuItemId: item.menuItemId,
    }));
};

const incrementOrderItemsMap = (orderItemsMap: OrderItemsMap, itemId: string) => {
    if (!orderItemsMap[itemId]) {
        orderItemsMap[itemId] = 0;
    }
    orderItemsMap[itemId]++;
};

const incrementOrderCategoriesMap = (orderCategoriesMap: OrderCategoriesMap, targetId: string, category: string) => {
    if (!orderCategoriesMap[targetId]) {
        orderCategoriesMap[targetId] = {};
    }
    if (!orderCategoriesMap[targetId][category]) {
        orderCategoriesMap[targetId][category] = 0;
    }
    orderCategoriesMap[targetId][category]++;
};

const addItem = (
    orderItems: TechnicalOrderItem[],
    orderItemsMap: OrderItemsMap,
    orderCategoriesMap: OrderCategoriesMap,
    newItem: AnyMenuItem,
    selectionStep: SelectionStep,
) => {
    incrementOrderItemsMap(orderItemsMap, newItem.id);
    incrementOrderCategoriesMap(orderCategoriesMap, newItem.targetId, newItem.category);
    const foundItem = orderItems.find(item => item.name === newItem.name);
    if (foundItem) {
        foundItem.quantity++;
        foundItem.selectionStep.push(selectionStep);
    } else {
        orderItems.push({
            id: randomId(),
            name: newItem.name,
            price: newItem.price,
            quantity: 1,
            targetId: newItem.targetId,
            menuItemId: newItem.id,
            category: newItem.category,
            selectionStep: [ selectionStep ],
        });
    }
};

const buildRequiredCategoriesMap = (conf: RandomConfigData): OrderCategoriesMap => {
    return conf.selectFromTargets.reduce<OrderCategoriesMap>((obj, targetId) => {
        obj[targetId] = {};
        Object.entries(conf.targetsData[targetId].categories).forEach(([categoryName, categoryConf]) => {
            if (
                categoryConf.weight !== 0 &&
                categoryConf.maxItems !== 0 &&
                categoryConf.minItems !== undefined &&
                categoryConf.minItems > 0
            ) {
                obj[targetId][categoryName] = (categoryConf.maxItems !== undefined && categoryConf.maxItems < categoryConf.minItems)
                    ? categoryConf.maxItems
                    : categoryConf.minItems;
            }
        });
        return obj;
    }, {});
};

const buildRequiredItemsMap = (conf: RandomConfigData): OrderItemsMap => {
    return conf.selectFromTargets.reduce<OrderItemsMap>((obj, targetId) => {
        Object.entries(conf.targetsData[targetId].items).forEach(([menuItemId, itemConf]) => {
            if (
                itemConf.weight !== 0 &&
                itemConf.maxItems !== 0 &&
                itemConf.minItems !== undefined &&
                itemConf.minItems > 0
            ) {
                obj[menuItemId] = (itemConf.maxItems !== undefined && itemConf.maxItems < itemConf.minItems)
                    ? itemConf.maxItems
                    : itemConf.minItems;
            }
        });
        return obj;
    }, {});
};

/**
 * 
 * @param targetMenus Source list of menu items grouped by catering target id
 * @param conf Random algorithm configuration
 * @param items If there are items - function will add only 1 new item to them
 */
export const randomizeItems = (targetMenus: Record<string, AnyMenuItem[]>, conf: RandomConfigData, initialItems?: OrderItem[]): OrderItem[] => {
    log(`#Call: randomizeItems(targetMenus, conf, items = ${JSON.stringify(initialItems)})`);
    try {
        const minCost = conf.total.cost.min;
        const midCost = conf.total.cost.mid;
        const maxCost = conf.total.cost.max;
        let totalCost = initialItems ? initialItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

        const orderItems = !initialItems ? [] : initialItems.map<TechnicalOrderItem>(item => {
            const targetMenu = targetMenus[item.targetId];
            const refItem = targetMenu && targetMenu.find(menuItem => menuItem.id === item.menuItemId);
            const itemCategory = (refItem && refItem.category) || '';
            return {
                ...item,
                category: itemCategory,
                selectionStep: ['init'],
            };
        });
        log('@1');
        const orderItemsMap: OrderItemsMap = {};
        orderItems.forEach(item => incrementOrderItemsMap(orderItemsMap, item.id));

        const orderCategoriesMap: OrderCategoriesMap = {};
        orderItems.forEach(item => incrementOrderCategoriesMap(orderCategoriesMap, item.targetId, item.category));

        const requiredCategoriesMap = buildRequiredCategoriesMap(conf);
        const requiredItemsMap = buildRequiredItemsMap(conf);

        const requiredItemsPool = conf.selectFromTargets.reduce<AnyMenuItem[]>((all, targetId) => {
            targetMenus[targetId].forEach(item => {
                const needMoreOfThisItem = (requiredItemsMap[item.id] || 0) - (orderItemsMap[item.id] || 0);
                if (
                    item.enabled &&
                    needMoreOfThisItem &&
                    totalCost + item.price <= maxCost
                ) {
                    for (let i = 0; i < needMoreOfThisItem; ++i) {
                        all.push(item);
                    }
                }
            });
            return all;
        }, []);

        log('@2');
        const priorityItemGroups = partition(requiredItemsPool, item => (
            requiredCategoriesMap[item.targetId][item.category]
        ));

        log('@3');
        // Required - Step 1. Choose from required items within required categories
        // Required - Step 2. Choose from all left required items not within required category

        for (let items of priorityItemGroups) {
            while (items.length && totalCost <= midCost) {
                const nextItemIndex = Math.floor(Math.random() * items.length);
                const nextItem = items[nextItemIndex];
                const nextCost = totalCost + nextItem.price;
    
                const nextItems = items.filter((item, index) => (
                    nextCost + item.price < maxCost && index !== nextItemIndex
                ));
                
                addItem(orderItems, orderItemsMap, orderCategoriesMap, nextItem, 'minItem');
                if (initialItems) {
                    return prepareResult(orderItems);
                }
                totalCost = nextCost
                items = nextItems;
            }
        }

        log('@4');
        // Required - Step 3. Choose items for left required categories

        let requiredCategoriesItemsPool = conf.selectFromTargets.reduce<AnyMenuItem[]>((all, targetId) => {
            targetMenus[targetId].forEach(item => {
                const itemWeight = get(conf.targetsData[targetId].items[item.id], 'weight') as number | undefined;
                const itemMaxItems = get(conf.targetsData[targetId].items[item.id], 'maxItems') as number | undefined;
                const sameItemsInOrder = orderItemsMap[item.id] || 0;
                const sameCategoriesInOrder = get(orderCategoriesMap[item.targetId], `[${item.category}]`, 0);
                const needMoreOfThisCategory = (requiredCategoriesMap[targetId][item.category] || 0) - sameCategoriesInOrder;
                if (
                    item.enabled &&
                    itemWeight !== 0 &&
                    (itemMaxItems === undefined || itemMaxItems >= sameItemsInOrder) &&
                    needMoreOfThisCategory &&
                    (totalCost + item.price) <= maxCost
                ) {
                    all.push(item);
                }
            });
            return all;
        }, []);

        log('@5');
        while (requiredCategoriesItemsPool.length && totalCost <= midCost) {
            const itemIndex = Math.floor(Math.random() * requiredCategoriesItemsPool.length);
            const nextItem = requiredCategoriesItemsPool[itemIndex];
            const nextCost = totalCost + nextItem.price;

            const nextItemsPool = requiredCategoriesItemsPool.filter(item => {
                if (item.category === nextItem.category) {
                    const sameCategoriesInOrder = get(orderCategoriesMap[item.targetId], `[${item.category}]`, 0) + 1;
                    const wouldNeedMoreOfThisCategory = (requiredCategoriesMap[item.targetId][item.category] || 0) - sameCategoriesInOrder;
                    return nextCost + item.price < maxCost && wouldNeedMoreOfThisCategory;
                }
                return true;
            });

            addItem(orderItems, orderItemsMap, orderCategoriesMap, nextItem, 'minCategory');
            if (initialItems) {
                return prepareResult(orderItems);
            }
            totalCost = nextCost
            requiredCategoriesItemsPool = nextItemsPool;
        }

        log('@6');
        const initialRandomItemsPool = conf.selectFromTargets.reduce<AnyMenuItem[]>((all, targetId) => {
            targetMenus[targetId].forEach(item => {
                const categoryWeight = get(conf.targetsData[targetId].categories[item.category], 'weight') as number | undefined;
                const itemWeight = get(conf.targetsData[targetId].items[item.id], 'weight') as number | undefined;
                const categoryMaxItems = get(conf.targetsData[targetId].categories[item.category], 'maxItems') as number | undefined;
                const itemMaxItems = get(conf.targetsData[targetId].items[item.id], 'maxItems') as number | undefined;
                const sameCategoriesInOrder = get(orderCategoriesMap[item.targetId], `[${item.category}]`, 0);
                const sameItemsInOrder = orderItemsMap[item.id] || 0;
                if (
                    item.enabled &&
                    (categoryMaxItems === undefined || categoryMaxItems > sameCategoriesInOrder) &&
                    categoryWeight !== 0 &&
                    (itemMaxItems === undefined || itemMaxItems >= sameItemsInOrder) &&
                    itemWeight !== 0 &&
                    (totalCost + item.price) <= maxCost
                ) {
                    for (let j = 0; j < Math.ceil((categoryWeight || 1) * (itemWeight || 1)); ++j) {
                        all.push(item);
                    }
                }
            });
            return all;
        }, []);

        log('@7');
        if (!initialRandomItemsPool.length) {
            return prepareResult(orderItems);
        }

        const attempts: RandomizeItemsAttempt[] = [];
        let attemptItemsPool = initialRandomItemsPool;
        let attemptOrderItems = orderItems;
        let attemptOrderItemsMap = orderItemsMap;
        let attemptOrderCategoriesMap = orderCategoriesMap;
        let attemptTotalCost = totalCost;

        while (attemptItemsPool.length && attemptTotalCost < midCost) {
            const nextItem = attemptItemsPool[Math.floor(Math.random() * attemptItemsPool.length)];
            const nextCost = attemptTotalCost + nextItem.price;

            const nextAttemptItemsPool = attemptItemsPool.filter(item => {
                const categoryMaxItems = get(conf.targetsData[item.targetId].categories[item.category], 'maxItems') as number | undefined;
                const itemMaxItems = get(conf.targetsData[item.targetId].items[item.id], 'maxItems') as number | undefined;
                const sameCategoryInOrder = get(orderCategoriesMap[item.targetId], `[${item.category}]`, 0) +
                    ((item.targetId === nextItem.targetId && item.category === nextItem.category) ? 1 : 0);
                const sameItemInOrder = (attemptOrderItemsMap[item.id] || 0) + (item.id === nextItem.id ? 1 : 0);
                return (
                    nextCost + item.price < maxCost &&
                    (categoryMaxItems === undefined || sameCategoryInOrder < categoryMaxItems) &&
                    (itemMaxItems === undefined || sameItemInOrder < itemMaxItems)
                );
            });

            addItem(attemptOrderItems, attemptOrderItemsMap, attemptOrderCategoriesMap, nextItem, 'regular');
            attemptTotalCost = nextCost
            attemptItemsPool = nextAttemptItemsPool;

            if (!attemptItemsPool.length && attemptTotalCost < midCost) {
                if (!initialItems && attemptTotalCost < minCost) {
                    attempts.push({
                        items: attemptOrderItems,
                        cost: attemptTotalCost,
                    });
                    if (attempts.length === 3) {
                        attemptOrderItems = maxBy(attempts, attempt => attempt.cost)!.items;
                        break;
                    } else {
                        attemptItemsPool = initialRandomItemsPool;
                        attemptOrderItems = orderItems;
                        attemptOrderItemsMap = orderItemsMap;
                        attemptOrderCategoriesMap = orderCategoriesMap;
                        attemptTotalCost = totalCost;
                    }
                }
            }
            if (initialItems && attemptOrderItems.length > initialItems.length) {
                return prepareResult(attemptOrderItems);
            }
        }

        if (attempts.length) {
            console.log('@randomizeItems: ATTEMPTS: ', attempts);
        }
        return prepareResult(attemptOrderItems);

    } catch (e) {
        console.log(e);
        throwError('unknown', 'Unknown error in random order generator', e);
    }
    return [];
};
