import React from 'react';
import isEqual from 'lodash/isEqual';

import { ConfigStateContext } from '../../../providers/ConfigStateProvider';
import { MenuContext } from '../../../providers/MenuProvider';
import { EditItemConfigs } from '../../../components/list/EditItemConfigs';
import { ConfigItemData } from '../../../components/list/items/ConfigItem';
import { defaultMenuItemConfig } from '../../../initData';
import { useSetItemConfig } from './useSetItemConfig';
import { MenuItemConfig } from '../../../../types/autoOrderConfigs';


export const ItemsIndividualConfig: React.FC = () => {
    const configState = React.useContext(ConfigStateContext);
    const menuState = React.useContext(MenuContext);
    const config = configState.state.randomConfigs.find(cfg => cfg.id === configState.state.selectedConfig);

    const nonDefaultItemsConfigs = React.useMemo(() => {
        if (!config) {
            return [];
        }
        return config.config.selectFromTargets.reduce<ConfigItemData[]>((all, targetId) => {
            const itemConfigs = config.config.targetsData[targetId].items;
            const targetMenu = menuState[targetId];
            if (targetMenu && targetMenu.length) {
                all.push(
                    ...Object.entries(itemConfigs)
                    .filter(([itemId, itemConfig]) => !isEqual(itemConfig, defaultMenuItemConfig))
                    .reduce<ConfigItemData[]>((arr, [itemId, itemConfig]) => {
                        const menuItem = targetMenu.find(item => item.id === itemId);
                        if (menuItem) {
                            arr.push({
                                id: itemId,
                                name: menuItem.name,
                                targetId,
                                category: menuItem.category,
                                ...itemConfig,
                            });
                        }
                        return arr;
                    }, []),
                );
            }
            return all;
        }, []);
    }, [config, menuState]);

    const allItemsConfigs = React.useMemo(() => {
        if (!config) {
            return [];
        }
        return config.config.selectFromTargets.reduce<ConfigItemData[]>((all, targetId) => {
            const itemConfigs = config.config.targetsData[targetId].items;
            const targetMenu = menuState[targetId];
            if (targetMenu && targetMenu.length) {
                all.push(
                    ...targetMenu
                    .map<ConfigItemData>(menuItem => {
                        const itemConfig = itemConfigs[menuItem.id] as MenuItemConfig | undefined;
                        return {
                            id: menuItem.id,
                            name: menuItem.name,
                            targetId,
                            category: menuItem.category,
                            ...( itemConfig ? itemConfig : defaultMenuItemConfig ),
                        };
                    }),
                );
            }
            return all;
        }, []);
    }, [config, menuState]);

    const setCategoryConfig = useSetItemConfig('categories');

    return (
        <EditItemConfigs
            title="Items individual configuration"
            editTooltip="Edit the item config"
            allItems={allItemsConfigs}
            nonDefaultItems={nonDefaultItemsConfigs}
            setItemConfig={setCategoryConfig}
        />
    );
};
