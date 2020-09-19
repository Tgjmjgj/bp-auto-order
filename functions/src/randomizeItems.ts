import get from 'lodash/get';

import { randomId, log, throwError } from './utils';
import { RandomConfigData, OrderItem } from '../../types/autoOrderConfigs';
import { AnyMenuItem } from '../../types/autoOrderMenus';

const defaultMinCost = 250;
const defaultMaxCost = 320;

const maxLoopIterations = 1000;

interface OrderItemWithCategory extends OrderItem {
    category: string
}

/**
 * 
 * @param target The restourant
 * @param menu Source list of menu items
 * @param conf Random algorithm configuration
 * @param items If there are items - function will add only 1 new item to them
 */
export const randomizeItems = (targetMenus: Record<string, AnyMenuItem[]>, conf: RandomConfigData, items?: OrderItem[]): OrderItem[] => {
    log(`#Call: randomizeItems(targetMenus, conf, items = ${JSON.stringify(items)})`);
    try {
        const filteredMergedMenu = conf.selectFromTargets.reduce<AnyMenuItem[]>((all, target) => {
            targetMenus[target].forEach(item => {
                const categoryWeight = get(conf.targetsData[target].categories, `[${item.category}].weight`) as unknown as number | undefined;
                const itemWeight = get(conf.targetsData[target].items, `[${item.name}].weight`) as unknown as number | undefined;
                const categoryMaxItems = get(conf.targetsData[target].categories, `[${item.category}].maxItems`) as unknown as number | undefined;
                const itemMaxItems = get(conf.targetsData[target].items, `[${item.name}].maxItems`) as unknown as number | undefined;
                if (
                    !item.enabled ||
                    categoryMaxItems === 0 ||
                    categoryWeight === 0 ||
                    itemMaxItems === 0 ||
                    itemWeight === 0
                ) {
                    return;
                }
                for (let j = 0; j < Math.ceil((categoryWeight || 1) * (itemWeight || 1)); ++j) {
                    all.push(item);
                }
            });
            return all;
        }, []);
        const minCost = get(conf.total, 'cost.min') || defaultMinCost; 
        const maxCost = get(conf.total, 'cost.max') || defaultMaxCost;

        const orderItems: OrderItemWithCategory[] = !items ? [] : items.map(item => {
            const targetMenu = targetMenus[item.targetId];
            const refItem = targetMenu && targetMenu.find(menuItem => menuItem.id === item.menuItemId);
            const itemCategory = (refItem && refItem.category) || '';
            return {
                ...item,
                category: itemCategory,
            };
        });
        let totalCost = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
        let i = 0;
        do {
            i++;
            const nextItem = filteredMergedMenu[Math.floor(Math.random() * filteredMergedMenu.length)];
            const nextCost = totalCost + nextItem.price;
            const sameCategoryItemsNumber = orderItems.reduce((sum, orderItem) => {
                if (nextItem.targetId === orderItem.targetId && nextItem.category === orderItem.category) {
                    return sum + orderItem.quantity;
                }
                return sum;
            }, 0);
            const maxItemsFromThisCategory = get(conf.targetsData[nextItem.targetId].categories, `[${nextItem.category}].maxItems`, undefined) as number | undefined;

            if (nextCost < maxCost && (maxItemsFromThisCategory === undefined || sameCategoryItemsNumber < maxItemsFromThisCategory)) {
                const existingItem = orderItems.find(item => item.name === nextItem.name);
                totalCost += nextItem.price;
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    orderItems.push({
                        id: randomId(),
                        name: nextItem.name,
                        price: nextItem.price,
                        quantity: 1,
                        targetId: nextItem.targetId,
                        menuItemId: nextItem.id,
                        category: nextItem.category,
                    });
                }
            }
            if (items && orderItems.length > items.length) {
                break;
            }
        } while (totalCost < minCost && i < maxLoopIterations);

        if (i === maxLoopIterations) {
            throwError('deadline-exceeded', 'Random order generator exceeded the maximum iteration number!');
        }
        log(`@randomizeItems: ${i} iterations`);
        return orderItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            targetId: item.targetId,
            menuItemId: item.menuItemId,
        }));
    } catch (e) {
        console.log(e);
        throwError('unknown', 'Unknown error in random order generator', e);
    }
    return [];
};
