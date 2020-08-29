import React from 'react';
import cn from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import TextField from '@material-ui/core/TextField';

import { OrderItemDisplayData } from './OrderItem';

import foodPlaceholder from '../images/food-placeholder.png';

type Props = {
    value: OrderItemDisplayData
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
    })
);

export const OrderItemStatic: React.FC<Props> = ({value}) => {
    const classes = useStyles();

    return (
        <Card variant="outlined" className={classes.card} elevation={3}>
            <CardMedia
                className={cn(classes.dishImage, { [classes.placeholder]: !value.imageUrl })}
                image={value.imageUrl || foodPlaceholder}
                title="dish"
            />
            <CardContent className={classes.cardContent}>
                <TextField
                    label="Dish name"
                    variant="filled"
                    value={value.name}
                    multiline={true}
                    size="small"
                    className={classes.input}
                />
                <TextField
                    label="Price"
                    variant="filled"
                    value={value.price || ''}
                    size="small"
                    className={classes.input}
                />
                <TextField
                    label="Quantity"
                    variant="filled"
                    value={value.quantity}
                    size="small"
                    className={classes.input}
                />
                <TextField
                    label="From"
                    variant="filled"
                    value={value.target}
                    size="small"
                    className={classes.input}
                />
            </CardContent>
        </Card>
    );
};
