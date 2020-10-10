import React from 'react';
import cn from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';

import { targetAvatar, targetPalette } from '../../../cosmetic/targets';
import { AnyMenuItem } from '../../../../types/autoOrderMenus';
import { ItemProps } from './ItemProps';
import { highlightSearch } from './common';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        listItem: {
            height: '100%',
            padding: '0 10px',
        },
        unavailable: {
        },
        listItemContent: {
            display: 'flex',
            flex: '1 1 auto',
            overflow: 'hidden',

            '&>div:first-child': {
                flexGrow: 1,
                overflow: 'hidden',
                '&>p': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                },
            },
            '&>div:last-child': {
                flexShrink: 0,
                width: 100,
            },
        },
        targetAvatar: {
            height: 28,
            width: 28,
            '$unavailable &': {
                backgroundColor: '#a6a7a6 !important',
            }
        },
        unavailableChip: {
            display: 'inline-block',
            marginLeft: theme.spacing(2),
            height: 16,
        },
        listItemTextPrimaryUnavailable: {
            color: '#6d6d6d',
        },
        listItemCategory: {
            display: 'inline-block',
            color: 'rgba(0,0,0,.54)',
            '$unavailable &': {
                color: 'rgba(0,0,0,.32)',
            },
        },
        listItemPrice: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            '$unavailable &': {
                color: '#6d6d6d',
            },
        },
    }),
);

export const MenuItem: React.FC<ItemProps<AnyMenuItem>> = (props) => {
    const { item, selected, searchText, onClick } = props;
    const classes = useStyles();

    const onClickHandler = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => onClick(item, e), [onClick, item]);
    const itemName = React.useMemo(() => highlightSearch(item.name, searchText), [item.name, searchText]);
    const categoryName = React.useMemo(() => highlightSearch(item.category, searchText), [item.category, searchText]);

    return (
        <ListItem
            key={item.id}
            button
            divider
            className={cn(
                classes.listItem,
                { [classes.unavailable]: !item.enabled }
            )}
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
                    <Typography className={cn({
                        [classes.listItemTextPrimaryUnavailable]: !item.enabled,
                    })}>
                        {itemName}
                    </Typography>
                    <div>
                        <Typography
                            variant="body2"
                            className={classes.listItemCategory}
                        >
                            {categoryName}
                        </Typography>
                        {!item.enabled && (
                            <Chip
                                color="secondary"
                                label="unavailable"
                                className={classes.unavailableChip}
                            />
                        )}
                    </div>
                </div>
                <div
                    className={classes.listItemPrice}
                >
                    {`${item.price} руб`}
                </div>
            </div>
        </ListItem>
    );
};
