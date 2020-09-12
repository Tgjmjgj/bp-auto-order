import React from 'react';
import cn from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CloseIcon from '@material-ui/icons/Close';

import { OrderItemDisplayData } from './OrderItem';

import foodPlaceholder from '../images/food-placeholder.png';

type Props = {
    value: OrderItemDisplayData
    canClose?: boolean
    onClose?: (itemId: string) => void
    onQuantityChange?: (quantity: number, itemId: string) => void
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            backgroundColor: '#f9f9f9',
            width: 220,
            position: 'relative',
            overflow: 'visible',
        },
        cardContent: {
            backgroundColor: '#fff',
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            padding: '0 !important',
        },
        closeIcon: {
            position: 'absolute',
            top: 0,
            right: 0,
            borderRadius: '50%',
            border: '1px solid black',
            transformOrigin: 'center',
            transform: 'translate(50%, -50%) scale(.5)',
            backgroundColor: '#fcfcfc',
            transition: 'background-color .2s ease-out',
            '&:hover': {
                backgroundColor: theme.palette.secondary.light,
            },
        },
        row: {
            display: 'flex',
            alignItems: 'flex-end',
        },
        quantityLabel: {
            margin: `0 ${theme.spacing(2)}px`,
        },
        dishImage: {
            paddingTop: '56.25%',
        },
        placeholder: {
            margin: '0 50px',
        },
        input: {
            width: '100%',
        },
        imgWrapper: {
            position: 'relative',
            overflow: 'hidden',
        },
        refBadge: {
            position: 'absolute',
            top: 0,
            left: 0,
            color: '#fff',
            backgroundColor: '#7bb21f',
            fontSize: '13px',
            height: '20px',
            boxShadow: '0px 0px 7px 1px #000;',
            transform: 'rotate(315deg) translate(-30px, -17px)',
            padding: '0 32px',
            textShadow: '0px 0px 2px rgba(0,0,0,.78)',
            userSelect: 'none',
            transition: 'ease-out .1s transform',
            '&:hover': {
                transform: 'rotate(315deg) translate(-30px, -17px) scale(1.1)',
            },
        },
    })
);

export const OrderItemStatic: React.FC<Props> = props => {
    const { value, canClose = false, onClose, onQuantityChange } = props;
    const classes = useStyles();

    const quantityChangeHandler = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        if (onQuantityChange) {
            onQuantityChange(Number.isNaN(newValue) ? 1 : newValue < 1 ? 1 : newValue, value.id);
        }
    }, [value, onQuantityChange]);

    return (
        <Card variant="outlined" className={classes.card} elevation={3}>
            <div className={classes.imgWrapper}>
                <CardMedia
                    className={cn(classes.dishImage, { [classes.placeholder]: !value.imageUrl })}
                    image={value.imageUrl || foodPlaceholder}
                    title="dish"
                >
                    {value.ref && value.target && (
                        <div className={classes.refBadge}>
                            {value.target}
                        </div>
                    )}
                </CardMedia>
            </div>
            <CardContent className={classes.cardContent}>
                <TextField
                    label="Dish name"
                    variant="filled"
                    value={value.name}
                    multiline={true}
                    size="small"
                    className={classes.input}
                    inputProps={{
                        readOnly: true,
                    }}
                />
                <TextField
                    label="Price"
                    variant="filled"
                    value={value.price || ''}
                    size="small"
                    className={classes.input}
                    inputProps={{
                        readOnly: true,
                    }}
                />
                <TextField
                    label="Quantity"
                    variant="filled"
                    value={value.quantity}
                    onChange={quantityChangeHandler}
                    size="small"
                    className={classes.input}
                />
                <TextField
                    label="From"
                    variant="filled"
                    value={value.target}
                    size="small"
                    className={classes.input}
                    inputProps={{
                        readOnly: true,
                    }}
                />
            </CardContent>

            {canClose && onClose && (
                <div className={classes.closeIcon}>
                    <Tooltip title="Delete item" aria-label="Delete item">
                        <IconButton onClick={() => onClose(value.id)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            )}
        </Card>
    );
};
