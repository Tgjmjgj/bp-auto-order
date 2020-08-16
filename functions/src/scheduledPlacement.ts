import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';
import sample from 'lodash/sample';

import { placeOrder, PlaceOrderResult } from './placeOrder';
import { randomizeOrder } from './randomizeOrder';
import { scrapKumirMenu } from './scrapKumirMenu';
import { randomId } from './utils';
import { ConfigState } from '../../types/autoOrderConfigs';
import { Menu, MenuTable } from '../../types/autoOrderMenus';

export const getUpdatedMenuData = async (target: string): Promise<Menu | null> => {
    try {
        const docRef = FirebaseAdmin.firestore().collection(`auto-order-menus`).doc(target);
        const data = await docRef.get();
        const today = (new Date()).toDateString();
        if (data.exists) {
            const menuData = data.data() as MenuTable;
            if (menuData.updateDate === today) {
                return menuData.menu;
            }

            const todayMenuData = await scrapKumirMenu();
            todayMenuData.forEach(item => {
                const sameNameItem = menuData.menu.find(oldItem => oldItem.name === item.name);
                if (sameNameItem) {
                    sameNameItem.price = item.price;
                    sameNameItem.category = item.category;
                    sameNameItem.imageUrl = item.imageUrl;
                } else {
                    menuData.menu.push({
                        id: randomId(),
                        enabled: true,
                        ...item,
                    });
                }
            });
            const updatedMenu = menuData.menu.map(item => {
                const enabled = todayMenuData.find(todayItem => todayItem.name === item.name);
                return { ...item, enabled: !!enabled };
            });
            await docRef.set({
                updateData: today,
                menu: updatedMenu,
            });
            return updatedMenu;
        }

        const firstMenuData = await scrapKumirMenu();
        const preparedMenu = firstMenuData.map(item => ({
            id: randomId(),
            enabled: true,
            ...item,
        }));
        await docRef.set({
            updateData: today,
            menu: preparedMenu,
        });
        return preparedMenu;

    } catch (e) {
        functions.logger.error(`Can't get kumir menu data: ${e}`);
        return null;
    }
};

export const scheduledPlacement = async (context: functions.EventContext) => {
    
    const randomModeTarget = 'kumir';
    const menu = await getUpdatedMenuData(randomModeTarget);
    const tableData = await FirebaseAdmin.firestore().collection('auto-order-configs').get();
    tableData.forEach(async entry => {
        const data = entry.data() as ConfigState;
        if (data.enabled) {
            functions.logger.info(`Start order placement for ${data.customName || data.systemName}...`);
            try {
                let result: PlaceOrderResult | null = null;
                if (data.mode === 'random' && menu) {
                    const items = await randomizeOrder(
                        randomModeTarget,
                        menu,
                        {
                            total: {
                                cost: { min: 270, mid: 300, max: 370 },
                            },
                            categories: {},
                            items: {},
                        },
                    );
                    if (items) {
                        result = await placeOrder({
                            spreadsheetId: data.spreadsheetId,
                            systemName: data.systemName,
                            customName: data.customName,
                            items,
                        });
                    }
                }
                if (data.mode === 'preset' || !result) {
                    const presetId = sample(data.selectedPresets);
                    const chosenPreset = data.presets.find(preset => preset.id === presetId)!;
                    result = await placeOrder({
                        spreadsheetId: data.spreadsheetId,
                        systemName: data.systemName,
                        customName: data.customName,
                        items: chosenPreset.items.map(item => ({
                            ...item,
                            target: data.savedTargets.find(target => target.id === item.target)!.key,
                        })),
                    });
                }
                functions.logger.info(result);
            } catch (e) {
                functions.logger.error(`Unable to place order for ${data.customName || data.systemName}.`);
            }
        } else {
            functions.logger.info(`Skip order placement for ${data.customName || data.systemName}...`);
        }
    });
};
