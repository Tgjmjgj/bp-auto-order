import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

import { ItemConfigChip } from './ItemConfigChip';
import { EditItemConfigPopover } from './EditItemConfigPopover';

export type ItemConfig = {
    itemId: string
    name: string
    targetId: string
    weight: number
    minItems?: number
    maxItems?: number
};

type Props = {
    variant: 'categories' | 'items'
    title: string
    editTooltip?: string
    targetsId: string[]
    items: ItemConfig[]
    setItemConfig: (itemConfig: ItemConfig) => void
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

export const IndividualItemConfig: React.FC<Props> = props => {
    const { variant, title, editTooltip, targetsId, items, setItemConfig } = props;
    const classes = useStyles();
    const [clickedItem, setClickedItem] = React.useState<ItemConfig | null>(null);
    const [clickedItemElement, setClickedItemElement] = React.useState<Element | null>(null);

    const editItemsConfigs = React.useCallback(() => {}, []);

    console.log('@ item configs: ', items);
    
    const clickOnItem = React.useCallback((event: React.MouseEvent<HTMLLIElement, MouseEvent>, item: ItemConfig) => {
        setClickedItemElement(event.currentTarget);
        setClickedItem(item);
    }, []);

    const onCloseEditConfigPopover = React.useCallback((editedItem: ItemConfig) => {
        setClickedItemElement(null);
        setClickedItem(null);
        setItemConfig(editedItem);
    }, [setItemConfig]);

    const itemsChips = React.useMemo(() => {
        return items.map(item => (
            <ItemConfigChip
                key={item.itemId}
                item={item}
                onClick={e => clickOnItem(e, item)}
            />
        ));
    }, [items, clickOnItem]);

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
