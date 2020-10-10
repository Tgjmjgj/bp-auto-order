import React from 'react';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

import { ConfigStateContext } from '../../../providers/ConfigStateProvider';
import { MenuContext } from '../../../providers/MenuProvider';
import { EditItemConfigs } from '../../../components/list/EditItemConfigs';
import { ConfigItemData } from '../../../components/list/items/ConfigItem';
import { defaultMenuItemConfig } from '../../../initData';
import { useSetItemConfig } from './useSetItemConfig';
import { MenuItemConfig } from '../../../../types/autoOrderConfigs';


export const CategoriesIndividualConfig: React.FC = () => {
    const configState = React.useContext(ConfigStateContext);
    const menuState = React.useContext(MenuContext);
    const config = configState.state.randomConfigs.find(cfg => cfg.id === configState.state.selectedConfig);

    const nonDefaultCategoriesConfigs = React.useMemo(() => {
        if (!config) {
            return [];
        }
        return config.config.selectFromTargets.reduce<ConfigItemData[]>((all, targetId) => {
            const categoriesItems = config.config.targetsData[targetId].categories;
            all.push(
                ...Object.entries(categoriesItems)
                .filter(([categoryName, categoryConfig]) => !isEqual(categoryConfig, defaultMenuItemConfig))
                .map<ConfigItemData>(([categoryName, categoryConfig]) => {
                    return {
                        id: `${targetId}_${categoryName}`,
                        name: categoryName,
                        targetId,
                        ...categoryConfig,
                    };
                }),
            );
            return all;
        }, []);
    }, [config]);

    const allCategoryConfigs = React.useMemo(() => {
        if (!config) {
            return [];
        }
        return config.config.selectFromTargets.reduce<ConfigItemData[]>((all, targetId) => {
            const categoriesItems = config.config.targetsData[targetId].categories;
            const targetMenu = menuState[targetId];
            if (targetMenu && targetMenu.length) {
                all.push(
                    ...uniq(
                        targetMenu.map(menuItem => menuItem.category)
                    ).map<ConfigItemData>(categoryName => {
                        const categoryConfig = categoriesItems[categoryName] as MenuItemConfig | undefined;
                        return {
                            id: `${targetId}_${categoryName}`,
                            name: categoryName,
                            targetId,
                            ...( categoryConfig ? categoryConfig : defaultMenuItemConfig ),
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
            title="Categories individual configuration"
            editTooltip="Edit the category config"
            allItems={allCategoryConfigs}
            nonDefaultItems={nonDefaultCategoriesConfigs}
            setItemConfig={setCategoryConfig}
        />
    );
};
