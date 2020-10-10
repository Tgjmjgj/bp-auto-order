import React from 'react';
import { AnyMenuItem } from '../../types/autoOrderMenus';
import { MenuItem } from '../components/list/items/MenuItem';
import { ListDialogFilter } from '../components/list/ListDialog';
import { DialogsContext } from '../providers/DialogsProvider';
import { MenuContext } from '../providers/MenuProvider';

const initialFilterValue = {
    search: '',
    switches: {
        showOnlyAvailable: {
            label: 'Show only available',
            value: true,
        },
    },
};

export const useSelectTargetMenuItem = (callback: (item: AnyMenuItem | null) => void) => {
    const dialogsContext = React.useContext(DialogsContext);
    const menuContext = React.useContext(MenuContext);
    const [pendingTargetId, setPendingTargetId] = React.useState<string>('');

    const onCloseDialog = React.useCallback(() => {
        setPendingTargetId('');
        dialogsContext.closeDialog();
        callback(null);
    }, [callback, dialogsContext]);

    const items = React.useMemo(() => menuContext[pendingTargetId] || [], [menuContext, pendingTargetId]);

    const onClickItem = React.useCallback((item: AnyMenuItem) => {
        setPendingTargetId('');
        callback(item);
    }, [callback]);

    const renderItem = React.useCallback((item: AnyMenuItem) => (
        <MenuItem
            item={item}
            key={item.id}
            selected={false}
            onClick={onClickItem}
        />
    ), [onClickItem]);

    const filterItems = React.useCallback((filter: ListDialogFilter) => {
        return items
        .filter(item => (
            item.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            item.category.toLowerCase().includes(filter.search.toLowerCase())
        ))
        .filter(item => filter.switches.showOnlyAvailable.value ? item.enabled : true)
    }, [items]);

    React.useEffect(() => {
        if (pendingTargetId) {
            dialogsContext.setupDialog({
                onCloseDialog,
                title: 'Select menu item',
                renderItem,
                filter: initialFilterValue,
                filterItems,
            });
        }
    }, [dialogsContext, pendingTargetId, onCloseDialog, renderItem, filterItems]);

    return setPendingTargetId;
};
