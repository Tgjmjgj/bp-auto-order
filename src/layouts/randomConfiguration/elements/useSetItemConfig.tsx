import React from 'react';
import produce from 'immer';

import { ConfigUpdateContext } from '../../../providers/ConfigStateProvider';
import { ConfigItemData } from '../../../components/list/items/ConfigItem';
import { defaultMenuItemConfig } from '../../../initData';
import { MenuItemConfig } from '../../../../types/autoOrderConfigs';

const configsAreEqual = (itemConfig: ConfigItemData, config: MenuItemConfig) => {
    return (
        itemConfig.weight === config.weight &&
        itemConfig.minItems === config.minItems &&
        itemConfig.maxItems === config.maxItems
    );
};

export const useSetItemConfig = (variant: 'categories' | 'items') => {
    const updateConfig = React.useContext(ConfigUpdateContext);

    return React.useCallback((itemConfig: ConfigItemData) => {
        const key = (variant === 'categories' ? 'name' : 'id');
        updateConfig(oldState => produce(oldState, state => {
            const selectedCfg = state.randomConfigs.find(cfg => cfg.id === state.selectedConfig);
            if (
                !selectedCfg ||
                configsAreEqual(
                    itemConfig,
                    selectedCfg.config.targetsData[itemConfig.targetId][variant][itemConfig[key]] || defaultMenuItemConfig,
                )
            ) {
                return;
            }
            if (
                itemConfig.weight === defaultMenuItemConfig.weight &&
                itemConfig.minItems === defaultMenuItemConfig.minItems &&
                itemConfig.maxItems === defaultMenuItemConfig.maxItems
            ) {
                delete selectedCfg.config.targetsData[itemConfig.targetId][variant][itemConfig[key]];
                return;
            }
            selectedCfg.config.targetsData[itemConfig.targetId][variant][itemConfig[key]] = {
                weight: itemConfig.weight,
                ...(itemConfig.minItems === undefined ? undefined : { minItems: itemConfig.minItems }),
                ...(itemConfig.maxItems === undefined ? undefined : { maxItems: itemConfig.maxItems }),
            };
        }));
    }, [updateConfig, variant]);
};
