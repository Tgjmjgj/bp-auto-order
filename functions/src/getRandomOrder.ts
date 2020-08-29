import * as functions from 'firebase-functions';

import { OrderItem } from '../../types/autoOrderConfigs';
import { defaultRandomOrderConfig } from './defaults';
import { getUpdatedMenu } from './getUpdatedMenu';
import { randomizeItems } from './randomizeItems';

export type GetRandomOrderResult = {
    success: boolean
    reason?: string
    items?: OrderItem[]
};

export const getRandomOrder = async (target: string, items?: OrderItem[]): Promise<OrderItem[]> => {
    functions.logger.info(`#Call: getRandomOrder(target = ${target}, items = ${items})`);
    const menu = await getUpdatedMenu(target);
    return randomizeItems(target, menu, defaultRandomOrderConfig, items);
}
