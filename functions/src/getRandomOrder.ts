import { OrderItem } from '../../types/autoOrderConfigs';
import { defaultRandomConfigData } from './defaults';
import { getAllUpdatedMenus } from './getUpdatedMenu';
import { randomizeItems } from './randomizeItems';
import { log } from './utils';

export type GetRandomOrderResult = {
    success: boolean
    reason?: string
    items?: OrderItem[]
};

export const getRandomOrder = async (target: string, date: string, items?: OrderItem[]): Promise<OrderItem[]> => {
    log(`#Call: getRandomOrder(target = ${target}, date = ${date}, items = ${items})`);
    const allMenus = await getAllUpdatedMenus(date);
    return randomizeItems(allMenus, defaultRandomConfigData, items);
}
