import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import { ConfigItemData } from './list/items/ConfigItem';

type Props = {
    item: ConfigItemData
    onClick?: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void
};

const targetAvatar: Record<string, string> = {
    'kumir': 'K',
    'namnym': 'H',
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        item: {
            height: 24,
            margin: 4,
            padding: 0,
            borderRadius: 16,
            width: 'auto',
            position: 'relative',
            display: 'inline-flex',
            boxSizing: 'border-box',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
        },
        targetAvatarWrapper: {
            margin: '0 -4px 0 4px',
            minWidth: 'unset',
        },
        targetAvatar: {
            fontSize: '0.625rem',
            height: 18,
            width: 18,
        },
        itemAvatar: {
            backgroundColor: '#fff',
        },
        chipContent: {
            display: 'flex',
            flexFlow: 'row nowrap',
            padding: theme.spacing(0, 1),
        },
        confPreview: {
            display: 'flex',
            flexFlow: 'row nowrap',
        },
        confDivider: {
            margin: theme.spacing(0, 1),
        },
        hoverBg: {
            position: 'absolute',
            borderRadius: 16,
            height: '100%',
            width: '100%',
            '&:hover': {
                backgroundColor: 'rgba(0,0,0,.11)',
            },
        },
    }),
);

type TargetColors = Record<string, {
    background: string
    divider: string
}>;

const targetColors: TargetColors = {
    'kumir': {
        background: '#7bb21f',
        divider: '#dacbcb',
    },
    'namnym': {
        background: '#ffad01',
        divider: '#dacbcb',
    },
};

export const ItemConfigChip: React.FC<Props> = React.memo(({ item, onClick }) => {
    const classes = useStyles();

    return (
        <ListItem
            key={item.id}
            className={classes.item}
            style={{backgroundColor: targetColors[item.targetId].background}}
            onClick={onClick}
        >
            <ListItemAvatar className={classes.targetAvatarWrapper}>
                <Avatar className={classes.targetAvatar}>
                    {targetAvatar[item.targetId]}
                </Avatar>
            </ListItemAvatar>
            <div className={classes.chipContent}>
                <Typography variant="body2">
                    {item.name}
                </Typography>
                <div className={classes.confPreview}>
                    <Divider orientation="vertical" className={classes.confDivider} />
                    <Typography variant="body2">
                        {item.weight}
                    </Typography>
                    <Divider orientation="vertical" className={classes.confDivider} />
                    <Typography variant="body2">
                        {item.minItems === undefined ? '-' : item.minItems}
                    </Typography>
                    <Divider orientation="vertical" className={classes.confDivider} />
                    <Typography variant="body2">
                        {item.maxItems === undefined ? '-' : item.maxItems}
                    </Typography>
                </div>
            </div>
            <Tooltip
                arrow
                title="Edit"
                aria-label="Edit"
                placement="top"
            >
                <div className={classes.hoverBg} />
            </Tooltip>
        </ListItem>
    );
}, function isPropsTheSame(prevProps, nextProps) {
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.weight === nextProps.item.weight &&
        prevProps.item.minItems === nextProps.item.minItems &&
        prevProps.item.maxItems === nextProps.item.maxItems
    );
});
