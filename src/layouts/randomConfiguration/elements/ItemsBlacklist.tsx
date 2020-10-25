import React from 'react';

import { ConfigStateContext } from '../../../providers/ConfigStateProvider';
import { MenuContext } from '../../../providers/MenuProvider';
import { useSetBlackList } from './useSetBlacklist';
import { pseudoIdPrefix } from '../../../initData';
import { AnyMenuItem } from '../../../../types/autoOrderMenus';
import { EditItemsList } from '../../../components/list/EditItemsList';

type Props = {
    className?: string
};

export const ItemsBlacklist: React.FC<Props> = props => {
    const { className = '' } = props;
    const configState = React.useContext(ConfigStateContext);
    const menuState = React.useContext(MenuContext);
    const config = configState.state.randomConfigs.find(cfg => cfg.id === configState.state.selectedConfig);

    const configItemsBlacklist = React.useMemo(() => {
        if (!config) {
            return [];
        }
        return config.config.selectFromTargets.reduce<AnyMenuItem[]>((all, targetId) => {
            const targetItems = config.config.targetsData[targetId].items;
            const targetMenu = menuState[targetId].menu;
            if (targetMenu && targetMenu.length) {
                all.push(
                    ...Object.entries(targetItems)
                    .filter(([itemId, itemConfig]) => {
                        return (itemConfig.maxItems === 0 || itemConfig.weight === 0) && !itemId.startsWith(pseudoIdPrefix);
                    }).reduce<AnyMenuItem[]>((arr, [itemId]) => {
                        const menuItem = targetMenu.find(item => item.id === itemId);
                        if (menuItem) {
                            arr.push(menuItem);
                        }
                        return arr;
                    }, [])
                );
            }
            return all;
        }, []);
    }, [config, menuState]);

    const setItemsBlacklist = useSetBlackList('items');

    return (
        <EditItemsList
            selectedItems={configItemsBlacklist}
            setSelectedItems={setItemsBlacklist}
            targetIds={config ? config.config.selectFromTargets : []}
            title="Items blacklist"
            className={className}
        />
    );
};
