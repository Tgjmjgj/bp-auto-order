import get from 'lodash/get';

import { randomId } from './utils';
import { RandomOrderConfig, OrderItem } from '../../types/autoOrderConfigs';
import { Menu } from '../../types/autoOrderMenus';

const defaultMinCost = 250;
const defaultMaxCost = 320;

export const randomizeOrder = (target: string, menu: Menu, conf: RandomOrderConfig): OrderItem[] | null => {
    
    const filteredMenu = menu.filter(item => {
        if (
            get(conf.categories, `[${item.category}].maxItems`) === 0 ||
            get(conf.categories, `[${item.category}].weight`) === 0 ||
            get(conf.items, `[${item.id}].maxItems`) === 0 ||
            get(conf.items, `[${item.id}].weight`) === 0
        ) {
            return false;
        } else {
            return true;
        }
    });
    const minCost = get(conf.total, 'cost.min') || defaultMinCost; 
    const maxCost = get(conf.total, 'cost.max') || defaultMaxCost;

    const orderItems: OrderItem[] = [];
    let totalCost = 0;
    do {
        const rndItem = filteredMenu[Math.floor(Math.random() * filteredMenu.length)];
        const nextCost = totalCost + rndItem.price;
        const sameCategoryItemsNumber = orderItems.reduce((num, orderItem) => {
            const refMenuItem = filteredMenu.find(menuItem => menuItem.id === orderItem.ref)!;
            return num + (refMenuItem.category === rndItem.category ? orderItem.quantity : 0);
        }, 0);
        if (
            nextCost < maxCost && (
                get(conf.categories, `[${rndItem.category}].maxItems`, undefined) === undefined ||
                sameCategoryItemsNumber < conf.categories[rndItem.category].maxItems!
            )
        ) {
            const existingItem = orderItems.find(item => item.name === rndItem.name);
            totalCost += rndItem.price;
            if (existingItem) {
                existingItem.quantity++;
            } else {
                orderItems.push({
                    id: randomId(),
                    name: rndItem.name,
                    price: rndItem.price,
                    quantity: 1,
                    target,
                    ref: rndItem.id,
                });
            }
        }
    } while (totalCost < minCost);

    return orderItems;
};
