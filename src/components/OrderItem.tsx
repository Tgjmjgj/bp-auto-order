import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { OrderItem as OrderItemData, OrderTarget } from '../ConfigStateProvider';
import {FreeSelect} from './FreeSelect'

import foodPlaceholder from '../images/food-placeholder.png';

type Props = {
    onClose: () => void
    canClose: boolean
    value: OrderItemData
    setValue: (newValue: OrderItemData) => void
    savedTargets: OrderTarget[]
    addNewTarget: (value: string) => void
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
            margin: '0 50px',
        },
        input: {
            width: '100%',
        },
    })
);

export const OrderItem: React.FC<Props> = props => {
    const { onClose, canClose, value, setValue, savedTargets, addNewTarget } = props;
    const classes = useStyles();
    const targetOptions = savedTargets.map(target => target.displayName);
    const target = savedTargets.find(target => target.key === value.target)
    const selectedTargetName = target ? target.displayName : ''

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
    const changeTarget = React.useCallback((targetName: string) => {
        const foundTarget = savedTargets.find(target => target.displayName === targetName)
        if (foundTarget) {
            setValue({
                ...value,
                target: foundTarget.key,
            });
        }
    }, [value, savedTargets, setValue]);
    const addNewTargetItem = React.useCallback((targetName: string) => {
        if (targetName) {
            addNewTarget(targetName);
        }
    }, [addNewTarget]);

    console.log('### order item re-rendering');

    return (
        <Card variant="outlined" className={classes.card} elevation={3}>
            <CardMedia
                className={classes.dishImage}
                image={foodPlaceholder}
                title="dish"
            />
            <CardContent className={classes.cardContent}>
                <TextField
                    label="Dish name"
                    variant="filled"
                    value={value.name}
                    onChange={changeName}
                    multiline={true}
                    size="small"
                    className={classes.input}
                />
                <TextField
                    label="Price"
                    variant="filled"
                    value={value.price || ''}
                    onChange={changePrice}
                    size="small"
                    className={classes.input}
                />
                <TextField
                    label="Quantity"
                    type="number"
                    variant="filled"
                    value={value.quantity}
                    onChange={changeQuantity}
                    size="small"
                    className={classes.input}
                />
                <FreeSelect
                    label="From"
                    options={targetOptions}
                    value={selectedTargetName}
                    onChange={changeTarget}
                    className={classes.input}
                    addNewItem={addNewTargetItem}
                />
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
};
