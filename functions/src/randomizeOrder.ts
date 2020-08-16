
import { RandomOrderConfig, OrderItem } from '../../types/autoOrderConfigs';
import { Menu, MenuItem } from '../../types/autoOrderMenus';

type OrderItemWithRef = OrderItem & { ref: MenuItem };

export const randomId = () => Math.random().toString(36).substring(2);

export const randomizeOrder = (target: string, menu: Menu, conf: RandomOrderConfig): OrderItem[] | null => {
    
    const orderItems: OrderItemWithRef[] = [];
    const totalCost = 0;
    do {
        const rndItem = menu[Math.floor(Math.random() * menu.length)];
        const nextCost = totalCost + rndItem.price;
        const sameCategoryItemsNumber = orderItems.reduce((num, item) => {
            if (item.ref.category === rndItem.category) {
                num += item.quantity;
            }
            return num;
        }, 0);
        if (
            nextCost < conf.cost.max && (
                !conf.categories[rndItem.category] ||
                sameCategoryItemsNumber < conf.categories[rndItem.category].maxItems
            )
        ){
            const existingItem = orderItems.find(item => item.name === rndItem.name);
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
