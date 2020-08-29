import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';
import sample from 'lodash/sample';

import { placeOrder, PlaceOrderResult } from './placeOrder';
import { randomizeItems } from './randomizeItems';
import { getUpdatedMenu } from './getUpdatedMenu';
import { defaultRandomOrderConfig } from './defaults';

import { ConfigState } from '../../types/autoOrderConfigs';

export const scheduledPlacement = async () => {

    const randomModeTarget = 'kumir';
    const menu = await getUpdatedMenu(randomModeTarget);
    const tableData = await FirebaseAdmin.firestore().collection('auto-order-configs').get();
    tableData.forEach(async entry => {
        const data = entry.data() as ConfigState;
        if (data.enabled) {
            functions.logger.info(`Start order placement for ${data.customName || data.systemName}...`);
            try {
                let result: PlaceOrderResult | null = null;
                if (data.mode === 'random' && menu) {
                    const items = await randomizeItems(randomModeTarget, menu, defaultRandomOrderConfig);
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
