import React from 'react';
import produce from 'immer';
import isEqual from 'lodash/isEqual';
import groupBy from 'lodash/groupBy';

import { ConfigStateContext } from '../../../providers/ConfigStateProvider';
import { pseudoIdPrefix } from '../../../initData';

const defaultItemConfig = {
    weight: 1,
    minItems: undefined,
    maxItems: undefined,
};

export const useSetBlackList = <T extends { id: string, name: string }>(variant: 'categories' | 'items') => {
    const configState = React.useContext(ConfigStateContext);
    const config = configState.state.randomConfigs.find(cfg => cfg.id === configState.state.selectedConfig);
    return React.useCallback((selection: T[]) => {
        if (!config) {
            return;
        }
        configState.updateState(produce(configState.state, state => {
            const selectedCfg = state.randomConfigs.find(cfg => cfg.id === state.selectedConfig);
            if (selectedCfg) {
                // remove all blacklist items
                Object.entries(selectedCfg.config.targetsData).forEach(([targetId, targetCfg]) => {
                    if (!config.config.selectFromTargets.includes(targetId)) {
                        return;
                    }
                    Object.entries(targetCfg[variant]).forEach(([key, itemsCfg]) => {
                        if (variant === 'items' && key.startsWith(pseudoIdPrefix)) {
                            return;
                        }
                        if (itemsCfg.maxItems === 0) {
                            delete itemsCfg.maxItems;
                        }
                        if (itemsCfg.weight === 0) {
                            itemsCfg.weight = defaultItemConfig.weight;
                        }
                        if (isEqual(itemsCfg, defaultItemConfig)) {
                            delete targetCfg[variant][key];
                        }
                    });
                });
                // set new blacklist items
                Object.entries(groupBy(selection, 'targetId')).forEach(([targetId, selected]) => {
                    const targetConfigs = selectedCfg.config.targetsData[targetId][variant];
                    selected.forEach(selectedItem => {
                        const key = (variant === 'categories' ? 'name' : 'id');
                        const existingCfg = targetConfigs[selectedItem[key]];
                        if (existingCfg) {
                            if (existingCfg.maxItems) {
                                existingCfg.weight = 0;
                            } else {
                                existingCfg.maxItems = 0;
                            }
                        } else {
                            targetConfigs[selectedItem[key]] = {
                                weight: 0,
                            };
                        }
                    });
                });
            }
        }));
    }, [configState, config, variant]);
};
