import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';

import { targetAvatar, targetPalette } from '../../cosmetic/targets';

export type ListItemData = {
    id: string
    name: string
    targetId: string
    secondary?: string
};

type Props = {
    items: ListItemData[]
    removeItem: (item: ListItemData) => void
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        listItem: {
            margin: '4px 0',
        },
        targetAvatar: {
            height: 28,
            width: 28,
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

export const ItemsList: React.FC<Props> = props => {
    const { items, removeItem } = props;
    const classes = useStyles();

    const getItemKey = React.useCallback((i: number, data: ListItemData[]) => {
        return data[i].id;
    }, []);

    const renderListItem = React.useCallback((props: ListChildComponentProps) => {
        const item = props.data[props.index] as ListItemData;
        return (
            <ListItem
                key={item.id}
                divider
                style={props.style}
                className={classes.listItem}
            >
                <ListItemAvatar>
                    <Avatar
                        className={classes.targetAvatar}
                        style={{ backgroundColor: targetPalette[item.targetId].primary }}
                    >
                        { targetAvatar[item.targetId] }
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={item.name}
                    secondary={item.secondary || undefined}
                    className={classes.listItemText}
                />
                <div className={classes.removeButtonContainer}>
                    <Tooltip arrow placement="right" title="Remove" aria-label="Remove">
                        <IconButton edge="end" size="small" onClick={() => removeItem(item)}>
                            <RemoveIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </ListItem>
        );
    }, [
        removeItem,
        classes.listItem,
        classes.targetAvatar,
        classes.listItemText,
        classes.removeButtonContainer,
    ]);

    return (
        <AutoSizer>
            {({ height, width }) => (
                <FixedSizeList
                    innerElementType={List}
                    height={height}
                    width={width}
                    itemCount={items.length}
                    itemSize={40}
                    itemData={items}
                    itemKey={getItemKey}
                >
                    {renderListItem}
                </FixedSizeList>
            )}
        </AutoSizer>
    );
};
