
import { RandomOrderConfig, OrderItem } from '../../types/autoOrderConfigs';
import { Menu, MenuItem } from '../../types/autoOrderMenus';

type OrderItemWithRef = OrderItem & { ref: MenuItem };

export const randomId = () => Math.random().toString(36).substring(2);

export const randomizeOrder = (target: string, menu: Menu, conf: RandomOrderConfig): OrderItem[] | null => {
    
    const filteredMenu = menu.filter(item => {
        if ((item.category in conf.categories) && conf.categories[item.category].maxItems === 0) {
            return false;
        } else {
            return true;
        }
    });
    const orderItems: OrderItemWithRef[] = [];
    let totalCost = 0;
    do {
        const rndItem = filteredMenu[Math.floor(Math.random() * filteredMenu.length)];
        const nextCost = totalCost + rndItem.price;
        const sameCategoryItemsNumber = orderItems.reduce((num, item) => {
            return num + (item.ref.category === rndItem.category ? item.quantity : 0);
        }, 0);
        if (
            nextCost < conf.cost.max && (
                !conf.categories[rndItem.category] ||
                sameCategoryItemsNumber < conf.categories[rndItem.category].maxItems
            )
        ){
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
                    ref: rndItem,
                });
            }
        }
    } while (totalCost < conf.cost.min);
    return orderItems;
};
