import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import { targetAvatar, targetPalette } from '../../../cosmetic/targets';
import { ItemProps } from './ItemProps';
import { highlightSearch } from './common';

export type ConfigItemData = {
    id: string
    name: string
    targetId: string
    category?: string
    weight: number
    minItems?: number
    maxItems?: number
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        listItem: {
            height: '100%',
            padding: '0 10px',
        },
        listItemContent: {
            display: 'flex',
            flex: '1 1 auto',
            overflow: 'hidden',
            height: '100%',

            '&>div:first-child': {
                flexGrow: 1,
                overflow: 'hidden',
                display: 'flex',
                flexFlow: 'column',
                justifyContent: 'center',
                '&>p': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                },
            },
            '&>div:last-child': {
                flexShrink: 0,
                width: 154,
            },
        },
        targetAvatar: {
            height: 28,
            width: 28,
        },
        listItemTextPrimaryUnavailable: {
            color: '#6d6d6d',
        },
        listItemCategory: {
            display: 'inline-block',
            color: 'rgba(0,0,0,.54)',
        },
        listItemConfig: {
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        confValue: {
            width: 50,
            textAlign: 'center',
        },
    }),
);

export const ConfigItem: React.FC<ItemProps<ConfigItemData>> = (props) => {
    const { item, selected, searchText, onClick } = props;
    const classes = useStyles();

    const onClickHandler = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => onClick(item, e), [onClick, item]);
    const itemName = React.useMemo(() => highlightSearch(item.name, searchText), [item.name, searchText]);
    const categoryName = React.useMemo(() => highlightSearch(item.category || '', searchText), [item.category, searchText]);

    return (
        <ListItem
            key={item.id}
            button
            divider
            className={classes.listItem}
            selected={selected}
            onClick={onClickHandler}
        >
            <ListItemAvatar>
                <Avatar
                    className={classes.targetAvatar}
                    style={{ backgroundColor: targetPalette[item.targetId].primary }}
                >
                    {targetAvatar[item.targetId]}
                </Avatar>
            </ListItemAvatar>
            <div className={classes.listItemContent}>
                <div>
                    <Typography>
                        {itemName}
                    </Typography>
                    { !!categoryName && (
                        <div>
                            <Typography
                                variant="body2"
                                className={classes.listItemCategory}
                            >
                                {categoryName}
                            </Typography>
                        </div>
                    )}
                </div>
                <div
                    className={classes.listItemConfig}
                >
                    <Divider orientation="vertical" />
                    <Typography variant="body2" className={classes.confValue}>
                        {item.weight}
                    </Typography>
                    <Divider orientation="vertical" />
                    <Typography variant="body2" className={classes.confValue}>
                        {item.minItems === undefined ? '-' : item.minItems}
                    </Typography>
                    <Divider orientation="vertical" />
                    <Typography variant="body2" className={classes.confValue}>
                        {item.maxItems === undefined ? '-' : item.maxItems}
                    </Typography>
                    <Divider orientation="vertical" />
                </div>
            </div>
        </ListItem>
    );
};