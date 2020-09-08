import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';
import sample from 'lodash/sample';

import { placeOrder } from './placeOrder';
import { randomizeItems } from './randomizeItems';
import { getUpdatedMenu } from './getUpdatedMenu';
import { defaultRandomOrderConfig } from './defaults';

import { ConfigState } from '../../types/autoOrderConfigs';

export const scheduledPlacement = async () => {

    const randomModeTarget = 'kumir';
    const menu = await getUpdatedMenu(randomModeTarget);
    const tableData = await FirebaseAdmin.firestore().collection('auto-order-configs').get();
    const operations: Array<() => Promise<void>> = []
    tableData.forEach(entry => {
        operations.push(async () => {
            const data = entry.data() as ConfigState;
            if (data.enabled) {
                functions.logger.info(`Start order placement for ${data.customName || data.systemName}...`);
                let result: number | null = null;
                if (data.mode === 'random' && menu) {
                    try {
                        const items = await randomizeItems(randomModeTarget, menu, defaultRandomOrderConfig);
                        if (items) {
                            result = await placeOrder({
                                spreadsheetId: data.spreadsheetId,
                                systemName: data.systemName,
                                customName: data.customName,
                                targets: data.savedTargets,
                                overwrite: data.overwriteAlways,
                                allowMultiple: data.allowMultipleOrders,
                                items,
                            });
                        }
                    } catch { }
                }
                if (data.mode === 'preset' || !result) {
                    try {
                        const presetId = sample(data.selectedPresets);
                        const chosenPreset = data.presets.find(preset => preset.id === presetId)!;
                        result = await placeOrder({
                            spreadsheetId: data.spreadsheetId,
                            systemName: data.systemName,
                            customName: data.customName,
                            targets: data.savedTargets,
                            overwrite: data.overwriteAlways,
                            allowMultiple: data.allowMultipleOrders,
                            items: chosenPreset.items,
                        });
                    } catch { }
                }
                functions.logger.info(result ? `Order was placed on the row ${result}` : 'Placement fails');
            } else {
                functions.logger.info(`Skip order placement for ${data.customName || data.systemName}...`);
            }
        });
    });

    await operations.reduce((chain: Promise<void>, next: () => Promise<void>) => {
        return chain.then(next)
    }, Promise.resolve())
};
