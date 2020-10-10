import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';

import { targetAvatar, targetPalette } from '../../../cosmetic/targets';
import { ItemProps } from './ItemProps';

export type CategoryItemData = {
    id: string
    name: string
    targetId: string
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        listItem: {
            height: '100%',
            padding: '0 10px',
        },
        targetAvatar: {
            height: 28,
            width: 28,
        },
    }),
);

export const CategoryItem: React.FC<ItemProps<CategoryItemData>> = (props) => {
    const { item, selected, onClick } = props;
    const classes = useStyles();

    const onClickHandler = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => onClick(item, e), [item, onClick]);

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
            <ListItemText
                primary={item.name}
            />
        </ListItem>
    );
};
