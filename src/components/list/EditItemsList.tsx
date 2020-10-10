import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

import { DialogsContext } from '../../providers/DialogsProvider';
import { MenuContext } from '../../providers/MenuProvider';
import { ItemsList, ListItemData } from './ItemsList';
import { MenuItem } from './items/MenuItem';
import { ListDialogFilter } from './ListDialog';
import { AnyMenuItem } from '../../../types/autoOrderMenus';

type Props = {
    title: string
    className?: string
    targetIds: string[]
    selectedItems: AnyMenuItem[]
    setSelectedItems: (categories: AnyMenuItem[]) => void
};

const initialFilterValue = {
    search: '',
    switches: {
        showOnlyAvailable: {
            label: 'Show only available',
            value: true,
        },
    },
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        row: {
            display: 'flex',
            alignItems: 'center',
        },
        listTitle: {
            margin: theme.spacing(4, 0, 2),
        },
    }),
);

export const EditItemsList: React.FC<Props> = props => {
    const {
        title,
        targetIds,
        selectedItems,
        setSelectedItems,
        className = '',
    } = props;
    const classes = useStyles();
    const dialogsContext = React.useContext(DialogsContext);
    const menuContext = React.useContext(MenuContext);
    const [openSelectDialog, setOpenSelectDialog] = React.useState(false);

    const onCloseDialog = React.useCallback(() => {
        setOpenSelectDialog(false);
        dialogsContext.closeDialog();
    }, [dialogsContext]);

    console.log('selectedItem: ', selectedItems);

    const allItems = React.useMemo(() => {
        return targetIds.flatMap(targetId => {
            return menuContext[targetId] || [];
        });
    }, [targetIds, menuContext]);

    const onClickItem = React.useCallback((item: AnyMenuItem) => {
        const delIndex = selectedItems.findIndex(mItem => mItem.id === item.id);
        if (delIndex !== -1) {
            setSelectedItems([
                ...selectedItems.slice(0, delIndex),
                ...selectedItems.slice(delIndex + 1, selectedItems.length),
            ]);
        } else {
            setSelectedItems([
                ...selectedItems,
                item,
            ]);
        }
    }, [selectedItems, setSelectedItems]);

    const renderItem = React.useCallback((item: AnyMenuItem) => {
        const selected = !!selectedItems.find(mItem => mItem.id === item.id);
        return (
            <MenuItem
                item={item}
                key={item.id}
                selected={selected}
                onClick={onClickItem}
            />
        );
    }, [selectedItems, onClickItem]);

    const filterItems = React.useCallback((filter: ListDialogFilter) => {
        return allItems
        .filter(item => (
            item.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            item.category.toLowerCase().includes(filter.search.toLowerCase())
        ))
        .filter(item => filter.switches.showOnlyAvailable.value ? item.enabled : true);
    }, [allItems]);

    React.useEffect(() => () => console.log('#### EditItemsList UNMOUNT'), []);

    React.useEffect(() => {
        if (openSelectDialog) {
            dialogsContext.setupDialog<AnyMenuItem>({
                onCloseDialog,
                title: 'Select menu item',
                renderItem,
                filter: initialFilterValue,
                filterItems,
            });
        }
    }, [
        dialogsContext,
        openSelectDialog,
        onCloseDialog,
        renderItem,
        filterItems,
    ]);

    const editList = React.useCallback(() => {
        setOpenSelectDialog(true);
    }, []);

    const listItems = React.useMemo(() => {
        return selectedItems.map<ListItemData>(item => ({
            id: item.id,
            name: item.name,
            targetId: item.targetId,
            // secondary: item.category,
        }));
    }, [selectedItems]);

    const removeItem = React.useCallback((item: ListItemData) => {
        const delIndex = selectedItems.findIndex(mItem => mItem.id === item.id);
        if (delIndex === -1 ) {
            return;
        }
        setSelectedItems([
            ...selectedItems.slice(0, delIndex),
            ...selectedItems.slice(delIndex + 1, selectedItems.length),
        ]);
    }, [selectedItems, setSelectedItems]);

    return (
        <>
            <div className={classes.row}>
                <Typography variant="h6" className={classes.listTitle}>
                    {title}
                </Typography>
                <Tooltip
                    arrow
                    placement="right"
                    title="Edit"
                    aria-label="Edit"
                >
                    <IconButton onClick={editList}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <div className={className}>
                <ItemsList
                    items={listItems}
                    removeItem={removeItem}
                />
            </div>
        </>
    );
};
