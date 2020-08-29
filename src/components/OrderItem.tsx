import React from 'react';
import cn from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { OrderItem as OrderItemData, OrderTarget } from '../../types/autoOrderConfigs';
import { FreeSelect } from './FreeSelect'
// import eq from 'fast-deep-equal';

import foodPlaceholder from '../images/food-placeholder.png';

export interface OrderItemDisplayData extends OrderItemData {
    imageUrl?: string
}

type Props = {
    value: OrderItemDisplayData
    savedTargets: OrderTarget[]
    addNewTarget: (itemId: string, newTarget: string) => void
    updateItem: (updatedOrderItem: OrderItemData) => void
    canClose?: boolean
    onClose?: (itemId: string) => void
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

export const OrderItem: React.FC<Props> = props => {
    const { canClose = false, value, savedTargets, addNewTarget, updateItem, onClose } = props;
    const classes = useStyles();

    const targetOptions = savedTargets.map(target => ({
        key: target.id,
        displayValue: target.displayName,
    }));

    const changeName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateItem({
            ...value,
            name: e.target.value,
        });
    }, [value, updateItem]);
    const changePrice = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        if (!Number.isNaN(newValue)) {
            updateItem({
                ...value,
                price: newValue,
            });
        }
     }, [value, updateItem]);
    const changeQuantity = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        updateItem({
            ...value,
            quantity: Number.isNaN(newValue) ? 1 : newValue < 1 ? 1 : newValue,
        });
    }, [value, updateItem]);
    const changeTarget = React.useCallback((targetId: string) => {
        const foundTarget = savedTargets.find(target => target.id === targetId);
        if (foundTarget) {
            updateItem({
                ...value,
                target: foundTarget.id,
            });
        }
    }, [value, savedTargets, updateItem]);
    const addNewTargetItem = React.useCallback((newTargetName: string) => {
        if (newTargetName) {
            addNewTarget(value.id, newTargetName);
        }
    }, [value, addNewTarget]);

    console.log(`### order item ${value.id} re-rendering`);

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
                    value={value.target}
                    onChange={changeTarget}
                    className={classes.input}
                    addNewItem={addNewTargetItem}
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
// }, (prevProps, nextProps) => {
//     return eq(prevProps.value, nextProps.value)
//         && eq(prevProps.savedTargets, nextProps.savedTargets)
// });
