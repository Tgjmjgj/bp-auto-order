import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import { ConfigStateContext } from '../ConfigStateProvider';
import { Divider } from '@material-ui/core';

import { OrderItem } from '../components/OrderItem';
import { OrderItem as OrderItemData } from '../ConfigStateProvider';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gridRow: {
            display: 'flex',
            alignItems: 'flex-end',
        },
        label: {
            marginRight: '20px',
        },
        iconGroup: {
            margin: theme.spacing(1),
        },
        divider: {
            marginBottom: theme.spacing(2),
        },
        addIcon: {
            borderRadius: '50%',
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.54)',
            borderStyle: 'dashed',
        },
        centered: {
            display: 'flex',
            alignItems: 'center',
        },
    })
);

const newOrderItem = (): OrderItemData => ({
    name: '',
    price: 0,
    quantity: 1,
});


export const AutoOrderOptions: React.FC = () => {
    const configState = React.useContext(ConfigStateContext);
    const classes = useStyles();
    const customName = configState.state.customName;
    const orderItems = configState.state.defaultOrder;

    const changeCustomName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        configState.updateState({customName: e.target.value})
    }, []);

    const addOrderItem = React.useCallback(() => {
        configState.updateState({
            defaultOrder: [
                ...orderItems,
                newOrderItem(),
            ],
        });
    }, [orderItems]);
    const deleteOrderItem = React.useCallback((index: number) => {
        configState.updateState({
            defaultOrder: [
                ...orderItems.slice(0, index),
                ...orderItems.slice(index + 1, orderItems.length),
            ],
        })
    }, [orderItems]);
    const setOrderItem = React.useCallback((index: number, newValue: OrderItemData) => {
        configState.updateState({
            defaultOrder: [
                ...orderItems.slice(0, index),
                newValue,
                ...orderItems.slice(index + 1, orderItems.length),
            ],
        });
    }, [orderItems]);

    console.log('## Order Items: ', orderItems);
    console.log('## Config State: ', configState);

    const orderItemsUI = React.useMemo(() => orderItems.map((item, i) => {

        return (
            <Grid item key={i}>
                <OrderItem
                    onClose={() => deleteOrderItem(i)}
                    canClose={orderItems.length > 1}
                    value={item}
                    setValue={newValue => setOrderItem(i, newValue)}
                />
            </Grid>
        );
    }), [orderItems, deleteOrderItem, setOrderItem]);

    return (
        <Grid container spacing={4} direction="column">
            <Grid item className={classes.gridRow}>
                <Typography className={classes.label}>
                    Custom display name:
                </Typography>
                <TextField
                    label="Display name"
                    value={customName || ''}
                    onChange={changeCustomName}
                />
            </Grid>
            <Grid item>
                <Divider className={classes.divider} />
                <Typography variant="h5" gutterBottom>
                    Predefined order:
                </Typography>
                <Grid container spacing={2} direction="row">
                    { orderItemsUI }
                    <Grid item className={classes.centered}>
                        <IconButton className={classes.addIcon} onClick={addOrderItem}>
                            <AddIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};
