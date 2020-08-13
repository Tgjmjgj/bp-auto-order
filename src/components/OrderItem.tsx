import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Typography } from '@material-ui/core';
import { OrderItem as OrderItemData } from '../ConfigStateProvider';

type Props = {
    onClose: () => void
    canClose: boolean
    value: OrderItemData
    setValue: (newValue: OrderItemData) => void
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            backgroundColor: '#fcfcfc',
            width: 320,
            position: 'relative',
            overflow: 'visible',
        },
        cardContent: {
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
        },
        row: {
            display: 'flex',
            alignItems: 'flex-end',
        },
        quantityLabel: {
            margin: `0 ${theme.spacing(2)}px`,
        },
    })
);

export const OrderItem: React.FC<Props> = React.memo(({onClose, canClose, value, setValue}) => {

    const classes = useStyles();

    const changeName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue({
            ...value,
            name: e.target.value,
        });
    }, [value, setValue]);
    const changePrice = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        if (!Number.isNaN(newValue)) {
            setValue({
                ...value,
                price: newValue,
            });
        }
     }, [value, setValue]);
    const changeQuantity = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        setValue({
            ...value,
            quantity: Number.isNaN(newValue) ? 1 : newValue < 1 ? 1 : newValue,
        });
    }, [value, setValue]);

    console.log('### order item re-rendering');

    return (
        <Card variant="outlined" className={classes.card}>
            <CardContent className={classes.cardContent}>
                <Grid container>
                    <Grid item xs={8}>
                        <Input
                            value={value.name}
                            onChange={changeName}
                            placeholder="Dish name"
                            multiline={true}
                            rows="2"
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Input
                            value={value.price || ''}
                            onChange={changePrice}
                            placeholder="Price"
                        />
                    </Grid>
                    <Grid item xs={12} className={classes.row}>
                        <Typography className={classes.quantityLabel}>
                            Quantity:
                        </Typography>
                        <Input
                            value={value.quantity}
                            onChange={changeQuantity}
                        />
                    </Grid>
                </Grid>
            </CardContent>

            {canClose && (
                <div className={classes.closeIcon}>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </div>
            )}
        </Card>
    );
});
