import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';
import sample from 'lodash/sample';

import { placeOrder, PlaceOrderResult } from './placeOrder';
import { randomizeOrder } from './randomizeOrder';
import { scrapKumirMenu } from './scrapKumirMenu';
import { ConfigState } from '../../types/autoOrderConfigs';
import { Menu, MenuTable } from '../../types/autoOrderMenus';

const maxMenuHistorySize = 5;

export const getUpdatedMenuData = async (target: string): Promise<Menu | null> => {
    try {
        const kumirTable = await FirebaseAdmin.firestore().collection(`auto-order-${target}-menus`).get();
        const today = (new Date()).toDateString();
        const keys = kumirTable.docs.map(doc => doc.id);
        if (keys.includes(today)) {
            const data = kumirTable.docs.find(doc => doc.id === today);
            if (data && data.exists) {
                return (data.data() as MenuTable).menu;
            }
        }
        const newMenuData = await scrapKumirMenu();
        if (keys.length >= maxMenuHistorySize) {
            keys
            .sort((key1, key2) => new Date(key1) > new Date(key2) ? 1 : -1)
            .slice(0, keys.length - maxMenuHistorySize + 1)
            .forEach(key => kumirTable.docs.find(doc => doc.id === key)!.ref.delete());
        }
        await FirebaseAdmin.firestore().collection('auto-order-kumir-menus').doc(today).set({
            target: 'kumir',
            menu: newMenuData,
        });
        return newMenuData;
    } catch (e) {
        functions.logger.error(`Can't get kumir menu data: ${e}`);
        return null;
    }
};

export const scheduledPlacement = async (context: functions.EventContext) => {
    
    const menu = await getUpdatedMenuData('kumir');
    const tableData = await FirebaseAdmin.firestore().collection('auto-order-configs').get();
    tableData.forEach(async entry => {
        const data = entry.data() as ConfigState;
        if (data.enabled) {
            functions.logger.info(`Start order placement for ${data.customName || data.systemName}...`);
            try {
                let result: PlaceOrderResult | null = null;
                if (data.mode === 'random' && menu) {
                    const items = await randomizeOrder(
                        'kumir',
                        menu,
                        {
                            cost: { min: 270, mid: 300, max: 370 },
                            categories: {},
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
