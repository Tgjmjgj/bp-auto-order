import React from 'react';
import cn from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';
import EditIcon from '@material-ui/icons/Edit';

import { DialogsContext } from '../providers/DialogsProvider';
import { isEqual } from 'lodash';

export type SelectedMenuItem = {
    id: string
    name: string
    targetId: string
    secondary?: string
}

type Props = {
    variant: 'categories' | 'items'
    targetsId: string[]
    title: string
    selectedItems: SelectedMenuItem[]
    className?: string
    setSelectedItems: (newSelectedItems: SelectedMenuItem[]) => void
};

const targetAvatar: Record<string, string> = {
    'kumir': 'K',
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
        listItem: {
            margin: '4px 0',
        },
        targetAvatar: {
            height: 28,
            width: 28,
        },
        kumir: {
            backgroundColor: '#7bb21f',
            color: '#fff',
        },
        listItemText: {
            whiteSpace: 'nowrap',
            marginRight: theme.spacing(5),
            '& > span': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
        },
        removeButtonContainer: {
            top: '50%',
            right: theme.spacing(2),
            position: 'absolute',
            transform: 'translateY(-50%)',
            '& button:hover svg': {
                fill: theme.palette.secondary.dark,
            },
        },
    }),
);

export const ItemsSubsetList: React.FC<Props> = props => {
    const { variant, targetsId, title, selectedItems, className = '', setSelectedItems } = props;
    const classes = useStyles();
    const dialogsContext = React.useContext(DialogsContext);
    const [openSelectDialog, setOpenSelectDialog] = React.useState(false);

    const onCloseMenuDialog = React.useCallback((selection: SelectedMenuItem[]) => {
        setOpenSelectDialog(false);
        setSelectedItems(selection);
    }, [setSelectedItems]);

    console.log('selectedItem: ', selectedItems);

    React.useEffect(() => {
        if (openSelectDialog) {
            dialogsContext.setupDialog('selectMenuItem', {
                open: openSelectDialog,
                variant,
                targetsId,
                selectedItems,
                onCloseDialog: onCloseMenuDialog,
            });
        } else {
            dialogsContext.setupDialog(null, null);
        }
    }, [openSelectDialog, dialogsContext, variant, targetsId, selectedItems, onCloseMenuDialog]);

    const editList = React.useCallback(() => {
        setOpenSelectDialog(true);
    }, []);

    const removeItem = React.useCallback((item: SelectedMenuItem) => {
        const delIndex = selectedItems.findIndex(sItem => isEqual(sItem, item));
        if (delIndex !== -1) {
            setSelectedItems([
                ...selectedItems.slice(0, delIndex),
                ...selectedItems.slice(delIndex + 1, selectedItems.length),
            ]);
        }
    }, [selectedItems, setSelectedItems]);

    const getItemKey = React.useCallback((i: number, data: SelectedMenuItem[]) => {
        return data[i].id;
    }, []);

    const targetClasses = React.useMemo<Record<string, string>>(() => ({
        'kumir': classes.kumir,
    }), [classes.kumir]);

    const renderListItem = React.useCallback((props: ListChildComponentProps) => {
        const item = props.data[props.index] as SelectedMenuItem;
        return (
            <ListItem
                key={item.id}
                divider
                style={props.style}
                className={classes.listItem}
            >
                <ListItemAvatar>
                    <Avatar
                        className={cn(classes.targetAvatar, targetClasses[item.targetId])}
                    >
                        {targetAvatar[item.targetId]}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={item.name}
                    secondary={item.secondary || undefined}
                    className={classes.listItemText}
                />
                <div className={classes.removeButtonContainer}>
                    <Tooltip title="Remove" aria-label="Remove">
                        <IconButton edge="end" size="small" onClick={() => removeItem(item)}>
                            <RemoveIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </ListItem>
        );
    }, [
        targetClasses,
        removeItem,
        classes.listItem,
        classes.targetAvatar,
        classes.listItemText,
        classes.removeButtonContainer,
    ]);

    return (
        <>
            <div className={classes.row}>
                <Typography variant="h6" className={classes.listTitle}>
                    {title}
                </Typography>
                <Tooltip placement="right" title="Edit blacklist" aria-label="Edit blacklist">
                    <IconButton onClick={editList}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <div className={className}>
                <AutoSizer>
                    {({ height, width }) => (
                        <FixedSizeList
                            innerElementType={List}
                            height={height}
                            width={width}
                            itemCount={selectedItems.length}
                            itemSize={40}
                            itemData={selectedItems}
                            itemKey={getItemKey}
                        >
                            {renderListItem}
                        </FixedSizeList>
                    )}
                </AutoSizer>
            </div>
        </>
    );
};
