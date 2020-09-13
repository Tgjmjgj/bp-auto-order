import get from 'lodash/get';

import { randomId, throwError } from './utils';
import { RandomConfigData, OrderItem } from '../../types/autoOrderConfigs';
import { Menu, TargetMenuItem } from '../../types/autoOrderMenus';

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
export const randomizeItems = (targetMenus: Record<string, Menu>, conf: RandomConfigData, items?: OrderItem[]): OrderItem[] => {

    try {
        const filteredMergedMenu = conf.selectFromTargets.reduce<TargetMenuItem[]>((all, target) => {
            targetMenus[target].forEach(item => {
                const categoryWeight = get(conf.targetsData[target].categories, `[${item.category}].weight`) as number | undefined;
                const itemWeight = get(conf.targetsData[target].items, `[${item.name}].weight`) as number | undefined;
                if (
                    get(conf.targetsData[target].categories, `[${item.category}].maxItems`) === 0 ||
                    categoryWeight === 0 ||
                    get(conf.targetsData[target].items, `[${item.name}].maxItems`) === 0 ||
                    itemWeight === 0
                ) {
                    return;
                }
                for (let i = 0; i < Math.ceil((categoryWeight || 1) * (itemWeight || 1)); ++i) {
                    all.push({ ...item, target });
                }
            });
            return all;
        }, []);
        const minCost = get(conf.total, 'cost.min') || defaultMinCost; 
        const maxCost = get(conf.total, 'cost.max') || defaultMaxCost;

        const orderItems: OrderItemWithCategory[] = !items ? [] : items.map(item => {
            const targetMenu = targetMenus[item.target];
            const refItem = targetMenu && targetMenu.find(menuItem => menuItem.id === item.ref);
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
                if (nextItem.target === orderItem.target && nextItem.category === orderItem.category) {
                    return sum + orderItem.quantity;
                }
                return sum;
            }, 0);
            const maxItemsFromThisCategory = get(conf.targetsData[nextItem.target].categories, `[${nextItem.category}].maxItems`, undefined) as number | undefined;

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
                        target: nextItem.category,
                        ref: nextItem.id,
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
        return orderItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            target: item.target,
            ref: item.ref,
        }));
    } catch (e) {
        console.log(e);
        throwError('unknown', 'Unknown error in random order generator', e);
    }
    return [];
};
