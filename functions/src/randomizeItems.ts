import * as functions from 'firebase-functions';
import get from 'lodash/get';

import { randomId, throwError } from './utils';
import { RandomOrderConfig, OrderItem } from '../../types/autoOrderConfigs';
import { Menu } from '../../types/autoOrderMenus';

const defaultMinCost = 250;
const defaultMaxCost = 320;

const maxLoopIterations = 1000;

/**
 * 
 * @param target The restourant
 * @param menu Source list of menu items
 * @param conf Random algorithm configuration
 * @param items If there are items - function will add only 1 new item to them
 */
export const randomizeItems = (target: string, menu: Menu, conf: RandomOrderConfig, items?: OrderItem[]): OrderItem[] => {

    try {
        const filteredMenu = menu.filter(item => {
            if (
                get(conf.categories, `[${item.category}].maxItems`) === 0 ||
                get(conf.categories, `[${item.category}].weight`) === 0 ||
                get(conf.items, `[${item.name}].maxItems`) === 0 ||
                get(conf.items, `[${item.name}].weight`) === 0
            ) {
                return false;
            } else {
                return true;
            }
        });
        const minCost = get(conf.total, 'cost.min') || defaultMinCost; 
        const maxCost = get(conf.total, 'cost.max') || defaultMaxCost;

        const orderItems: OrderItem[] = items ? [...items] : [];
        let totalCost = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
        let i = 0;
        do {
            i++;
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
            if (items && orderItems.length > items.length) {
                break;
            }
        } while (totalCost < minCost && i < maxLoopIterations);

        if (i === maxLoopIterations) {
            throwError('deadline-exceeded', 'Random order generator exceeded the maximum iteration number!');
        }
        return orderItems;
    } catch (e) {
        console.log(e);
        if (e instanceof functions.https.HttpsError) {
            throw e;
        }
        throwError('unknown', 'Unknown error in random order generator', e);
    }
    return [];
};
