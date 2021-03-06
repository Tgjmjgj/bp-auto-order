import * as functions from 'firebase-functions';
import sample from 'lodash/sample';
import { DateTime } from 'luxon';

import { firestore } from './firebase';
import { placeOrder } from './spreadsheets/placeOrder';
import { randomizeItems } from './randomizeItems';
import { getAllUpdatedMenus } from './getUpdatedMenu';
import { customDateFormat, log } from './utils';

import { ConfigState, SpreadsheetData } from '../../types/autoOrderConfigs';
import { autoDetectTarget } from './spreadsheets/autoDetectTarget';

const spreadsheetCache: Record<string, string | null> = {};

const getSpreadsheetTarget = async (spreadsheet: SpreadsheetData) => {
    if (spreadsheetCache[spreadsheet.id]) {
        return spreadsheetCache[spreadsheet.id];
    }
    const target = await autoDetectTarget(spreadsheet);
    spreadsheetCache[spreadsheet.id] = target;
    return target;
};

export const scheduledPlacement = async () => {
    log(`#Call: scheduledPlacement()`);
    const tomorrow = DateTime.local().plus({ day: 1 }).setZone('Europe/Moscow').toFormat(customDateFormat);
    const [allMenu, allUserConfigs] = await Promise.all([
        getAllUpdatedMenus(tomorrow),
        firestore.collection('auto-order-user-configs').get(),
    ]);
    const operations: Array<() => Promise<void>> = [];
    allUserConfigs.forEach(entry => {
        operations.push(async () => {
            const data = entry.data() as ConfigState;
            if (data.enabled) {
                functions.logger.info(`Start order placement for ${data.customName || data.systemName}...`);
                let result: number | null = null;
                if (data.mode === 'random') {
                    try {
                        const userRndConfig = data.randomConfigs.find(cfg => cfg.id === data.selectedConfig);
                        if (userRndConfig) {

                            let foundTarget: string | null = null;
                            if (userRndConfig.config.autoDetectTarget) {
                                foundTarget = await getSpreadsheetTarget(data.spreadsheet);
                            }
                            const selectFromTargets = foundTarget ? [ foundTarget ] : userRndConfig.config.selectFromTargets;
                            const items = await randomizeItems(allMenu, userRndConfig.config, selectFromTargets);
                            if (items) {
                                result = await placeOrder(entry.id, {
                                    spreadsheet: data.spreadsheet,
                                    forDate: tomorrow,
                                    systemName: data.systemName,
                                    customName: data.customName,
                                    targets: data.savedTargets,
                                    overwrite: data.overwriteAlways,
                                    allowMultiple: data.allowMultipleOrders,
                                    items,
                                });
                            }
                        } else {
                            console.error(`User ${entry.id} has no selected random config!`);
                        }
                    } catch { }
                }
                if (data.mode === 'preset' || !result) {
                    try {
                        const presetId = sample(data.selectedPresets);
                        const chosenPreset = data.presets.find(preset => preset.id === presetId)!;
                        result = await placeOrder(entry.id, {
                            spreadsheet: data.spreadsheet,
                            forDate: tomorrow,
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
        return chain.then(next);
    }, Promise.resolve());
};
