import { ConfigState, OrderItem } from '../../types/autoOrderConfigs';
import { getAllUpdatedMenus } from './getUpdatedMenu';
import { randomizeItems } from './randomizeItems';
import { firestore } from './firebase';
import { log, throwError } from './utils';

export type GetRandomOrderResult = {
    success: boolean
    reason?: string
    items?: OrderItem[]
};

export const getRandomOrder = async (userId: string, target: string, date: string, items?: OrderItem[]): Promise<OrderItem[]> => {
    log(`#Call: getRandomOrder(userId = ${userId}, target = ${target}, date = ${date}, items = ${items})`);
    
    const userConfigTableRef = firestore.collection('auto-order-user-configs').doc(userId);
    const tableData = await userConfigTableRef.get();
    const configState = tableData.data() as ConfigState;
    const randomConfig = configState.randomConfigs.find(cfg => cfg.id === configState.selectedConfig);
    if (!randomConfig) {
        throwError('not-found', `User selected random configuration doesn't found!`);
    }
    const allMenus = await getAllUpdatedMenus(date);
    return randomizeItems(allMenus, randomConfig!.config, items);
}
