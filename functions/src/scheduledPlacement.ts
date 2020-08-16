import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';
import sample from 'lodash/sample';
import { ConfigState } from '../../types/autoOrderConfigs';
import { placeOrder } from './placeOrder';

export const scheduledPlacement = async (context: functions.EventContext) => {
    
    const tableData = await FirebaseAdmin.firestore().collection('auto-order-configs').get();
    tableData.forEach(async entry => {
        const data = entry.data() as ConfigState;
        if (data.enabled) {
            functions.logger.info(`Start order placement for ${data.customName || data.systemName}...`);
            try {
                if (data.mode === 'preset') {
                    const presetId = sample(data.selectedPresets);
                    const chosenPreset = data.presets.find(preset => preset.id === presetId)!;
                    const result = await placeOrder({
                        spreadsheetId: data.spreadsheetId,
                        systemName: data.systemName,
                        customName: data.customName,
                        items: chosenPreset.items.map(item => ({
                            ...item,
                            target: data.savedTargets.find(target => target.id === item.id)!.key,
                        })),
                    });
                    functions.logger.info(result);
                }
            } catch (e) {
                functions.logger.error(`Unable to place order for ${data.customName || data.systemName}.`);
            }
        } else {
            functions.logger.info(`Skip order placement for ${data.customName || data.systemName}...`);
        }
    });
};
