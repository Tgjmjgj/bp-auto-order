import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

import { ItemConfigChip } from '../ItemConfigChip';
import { EditItemConfigPopover } from '../EditItemConfigPopover';
import { ConfigItem, ConfigItemData } from './items/ConfigItem';
import { DialogsContext } from '../../providers/DialogsProvider';
import { ListDialogFilter } from './ListDialog';

type Props = {
    title: string
    editTooltip?: string
    allItems: ConfigItemData[]
    nonDefaultItems: ConfigItemData[]
    setItemConfig: (itemConfig: ConfigItemData) => void
};

const initialFilterValue = {
    search: '',
    switches: {},
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
        itemsBorder: {
            borderColor: 'rgba(0, 0, 0, 0.23)',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 4,
            padding: 9,
            '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.87)',
            },
        },
        itemsContainer: {
            display: 'flex',
            flexFlow: 'row wrap',
        },
        editItemPopover: {
            minWidth: 280,
            maxWidth: 420,
        },
    }),
);

export const EditItemConfigs: React.FC<Props> = props => {
    const { title, editTooltip, allItems, nonDefaultItems, setItemConfig } = props;
    const classes = useStyles();
    const dialogsContext = React.useContext(DialogsContext);
    const [clickedItem, setClickedItem] = React.useState<ConfigItemData | null>(null);
    const [clickedItemElement, setClickedItemElement] = React.useState<Element | null>(null);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);

    const editItemsConfigs = React.useCallback(() => {
        setOpenEditDialog(true);
    }, []);

    const onCloseDialog = React.useCallback(() => {
        setOpenEditDialog(false);
        dialogsContext.closeDialog();
    }, [dialogsContext]);

    console.log('@ item configs: ', nonDefaultItems);

    const clickOnItem = React.useCallback((item: ConfigItemData, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        console.log('@clickOnItem. e.currentTarget: ', e.currentTarget, ', item: ', item);
        setClickedItemElement(e.currentTarget);
        setClickedItem(item);
    }, []);

    const renderItem = React.useCallback((item: ConfigItemData) => {
        return (
            <ConfigItem
                item={item}
                key={item.id}
                onClick={clickOnItem}
                selected={false}
            />
        );
    }, [clickOnItem]);

    const filterItems = React.useCallback((filter: ListDialogFilter) => {
        return allItems
        .filter(item => (
            item.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            (item.category && item.category.toLowerCase().includes(filter.search.toLowerCase()))
        ))
    }, [allItems]);

    React.useEffect(() => {
        if (openEditDialog) {
            dialogsContext.setupDialog<ConfigItemData>({
                onCloseDialog,
                title: 'Edit item random configurations',
                renderItem,
                filter: initialFilterValue,
                filterItems,
            });
        }
    }, [
        dialogsContext,
        openEditDialog,
        onCloseDialog,
        renderItem,
        filterItems,
    ]);

    const onCloseEditConfigPopover = React.useCallback((editedItem: ConfigItemData) => {
        setClickedItemElement(null);
        setClickedItem(null);
        setItemConfig(editedItem);
    }, [setItemConfig]);

    const itemsChips = React.useMemo(() => {
        return nonDefaultItems.map(item => (
            <ItemConfigChip
                key={item.id}
                item={item}
                onClick={e => clickOnItem(item, e)}
            />
        ));
    }, [nonDefaultItems, clickOnItem]);

    return (
        <>
            <div className={classes.row}>
                <Typography variant="h6" className={classes.listTitle}>
                    {title}
                </Typography>
                <Tooltip
                    arrow
                    placement="right"
                    title={editTooltip || ''}
                    aria-label={editTooltip}
                >
                    <IconButton onClick={editItemsConfigs}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <div className={classes.itemsBorder}>
                <div className={classes.itemsContainer}>
                    {itemsChips}
                </div>
            </div>
            {clickedItem && (
                <EditItemConfigPopover
                    open={true}
                    anchorEl={clickedItemElement}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    item={clickedItem}
                    onClose={onCloseEditConfigPopover}
                    className={classes.editItemPopover}
                />
            )}
        </>
    );
};
