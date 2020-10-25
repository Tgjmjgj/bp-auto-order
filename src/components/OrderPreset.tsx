import React from 'react';
import produce from 'immer';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import { ConfigStateContext, ConfigUpdateContext } from '../providers/ConfigStateProvider';
import { OrderItemCard } from './OrderItemCard';
import { randomId, getI } from '../utils';
import { OrderItem as OrderItemData, OrderTarget } from '../../types/autoOrderConfigs';

type Props = {
    presetId: string
    allowDelete: boolean
    deletePreset: () => void
};

type PendingChangeTarget = {
    targetId: string
    itemId: string
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        addItemButton: {
            borderRadius: '50%',
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.54)',
            borderStyle: 'dashed',
            transition: 'color .2s ease-out, borderColor .2s ease-out, backgroundColor .2s ease-out',
            '&:hover': {
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                backgroundColor: 'rgb(22, 2, 232, .04)',
            },
        },
        centered: {
            display: 'flex',
            alignItems: 'center',
        },
        presetName: {
            marginBottom: theme.spacing(2),
        },
        grid: {
            padding: theme.spacing(2),
        },
        deletePresetButton: {
            transition: 'color .2s ease-out',
            '&:hover': {
                color: theme.palette.secondary.dark,
            },
        },
    }),
);

const newOrderItem = (): OrderItemData => ({
    id: randomId(),
    name: '',
    price: 0,
    quantity: 1,
    targetId: '',
});

export const OrderPreset: React.FC<Props> = ({presetId, allowDelete, deletePreset}) => {
    const classes = useStyles();
    const configState = React.useContext(ConfigStateContext);
    const updateConfig = React.useContext(ConfigUpdateContext);
    const preset = configState.state.presets.find(preset => preset.id === presetId);
    const presetIndex = getI(configState.state.presets, presetId);
    const savedTargets = configState.state.savedTargets;

    const onChangePresetName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value || presetIndex === -1) {
            return;
        }
        updateConfig(oldState => produce(oldState, state => {
            state.presets[presetIndex].name = e.target.value;
        }));
    }, [presetIndex, updateConfig]);

    const addOrderItem = React.useCallback(() => {
        if (presetIndex === -1) {
            return;
        }
        updateConfig(oldState => produce(oldState, state => {
            state.presets[presetIndex].items.push(newOrderItem());
        }));
    }, [presetIndex, updateConfig]);

    const deleteOrderItem = React.useCallback((orderItemId: string) => {
        if (presetIndex === -1) {
            return;
        }
        updateConfig(oldState => produce(oldState, state => {
            const presetItems = state.presets[presetIndex].items;
            const delIndex = getI(presetItems, orderItemId);
            if (delIndex === -1) {
                return;
            }
            state.presets[presetIndex].items.splice(delIndex, 1);
        }));
    }, [presetIndex, updateConfig]);

    const changeOrderItem = React.useCallback((updatedItem: OrderItemData) => {
        if (presetIndex === -1 ) {
            return;
        }
        updateConfig(oldState => produce(oldState, state => {
            const presetItems = state.presets[presetIndex].items;
            const itemIndex = getI(presetItems, updatedItem.id);
            if (itemIndex === -1) {
                return;
            }
            state.presets[presetIndex].items[itemIndex] = updatedItem;
        }));
    }, [presetIndex, updateConfig]);

    const addNewTargetAndChangeItem = React.useCallback((newTarget: OrderTarget, updatedItem: OrderItemData) => {
        if (presetIndex === -1) {
            return;
        }
        updateConfig(oldState => produce(oldState, state => {
            const presetItems = state.presets[presetIndex].items;
            const itemIndex = getI(presetItems, updatedItem.id);
            if (itemIndex === - 1) {
                return;
            }
            state.savedTargets.push(newTarget);
            state.presets[presetIndex].items[itemIndex] = updatedItem;
        }));
    }, [presetIndex, updateConfig]);

    console.log(`## Preset ${presetId} Items: `, preset ? preset.items : '');

    const presetItemsUI = React.useMemo(() => {
        return preset ? preset.items.map(item => (
            <Grid item key={item.id}>
                <OrderItemCard
                    item={item}
                    savedTargets={savedTargets}
                    changeItem={changeOrderItem}
                    addNewTargetAndChangeItem={addNewTargetAndChangeItem}
                    onClose={preset.items.length > 1 ? deleteOrderItem : undefined}
                />
            </Grid>
        )) : null;
    }, [
        preset,
        savedTargets,
        changeOrderItem,
        addNewTargetAndChangeItem,
        deleteOrderItem,
    ]);

    return (
        <>
            <Grid container direction="row" className={classes.presetName}>
                <TextField
                    label="Preset name"
                    value={preset ? preset.name : ''}
                    onChange={onChangePresetName}
                />
                { allowDelete && (
                    <Tooltip arrow title="Delete Preset" aria-label="Delete Preset">
                        <IconButton className={classes.deletePresetButton} onClick={deletePreset}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Grid>
            <Grid container spacing={2} direction="row" className={classes.grid}>
                { presetItemsUI }
                <Grid item className={classes.centered}>
                    <Tooltip arrow title="Add item" aria-label="Add item">
                        <IconButton className={classes.addItemButton} onClick={addOrderItem}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        </>
    );
};
