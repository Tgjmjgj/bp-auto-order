import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import { ConfigStateContext } from '../ConfigStateProvider';
import { OrderItem as OrderItemData } from '../../types/autoOrderConfigs';
import { OrderItem } from './OrderItem';
import { randomId, getI } from '../utils';

type Props = {
    presetId: string
    allowDelete: boolean
    deletePreset: () => void
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
    })
);

const newOrderItem = (): OrderItemData => ({
    id: randomId(),
    name: '',
    price: 0,
    quantity: 1,
    target: '',
});

export const OrderPreset: React.FC<Props> = ({presetId, allowDelete, deletePreset}) => {
    const configState = React.useContext(ConfigStateContext);
    const classes = useStyles();
    const preset = configState.state.presets.find(preset => preset.id === presetId);
    const presetIndex = getI(configState.state.presets, presetId);
    const savedTargets = configState.state.savedTargets;

    const onChangePresetName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!preset) {
            return null;
        }
        configState.updateState({
            presets: [
                ...configState.state.presets.slice(0, presetIndex),
                {
                    ...preset,
                    name: e.target.value,
                },
                ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
            ],
        });
    }, [preset, presetIndex, configState]);

    const addOrderItem = React.useCallback(() => {
        if (!preset) {
            return null;
        }
        configState.updateState({
            presets: [
                ...configState.state.presets.slice(0, presetIndex),
                {
                    ...preset,
                    items: [
                        ...preset.items,
                        newOrderItem(),
                    ],
                },
                ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
            ],
        });
    }, [preset, presetIndex, configState]);

    const deleteOrderItem = React.useCallback((orderItemId: string) => {
        if (!preset) {
            return null;
        }
        const delIndex = getI(preset.items, orderItemId);
        if (delIndex !== -1) {
            configState.updateState({
                presets: [
                    ...configState.state.presets.slice(0, presetIndex),
                    {
                        ...preset,
                        items: [
                            ...preset.items.slice(0, delIndex),
                            ...preset.items.slice(delIndex + 1, preset.items.length),
                        ],
                    },
                    ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
                ],
            });
        }
    }, [preset, presetIndex, configState]);

    const setOrderItem = React.useCallback((updatedOrderItem: OrderItemData) => {
        if (!preset) {
            return null;
        }
        const setIndex = getI(preset.items, updatedOrderItem.id);
        if (setIndex !== -1) {
            configState.updateState({
                presets: [
                    ...configState.state.presets.slice(0, presetIndex),
                    {
                        ...preset,
                        items: [
                            ...preset.items.slice(0, setIndex),
                            updatedOrderItem,
                            ...preset.items.slice(setIndex + 1, preset.items.length),
                        ],
                    },
                    ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
                ],
            });
        }
    }, [preset, presetIndex, configState]);

    const addNewTargetAndSelectIt = React.useCallback((orderItemId: string, newTarget: string) => {
        if (!preset) {
            return null;
        }
        const setIndex = getI(preset.items, orderItemId);
        if (setIndex !== -1) {
            const newTargetId = randomId();
            configState.updateState({
                savedTargets: [
                    ...savedTargets,
                    { id: newTargetId, key: newTarget, displayName: newTarget },
                ],
                presets: [
                    ...configState.state.presets.slice(0, presetIndex),
                    {
                        ...preset,
                        items: [
                            ...preset.items.slice(0, setIndex),
                            {
                                ...preset.items[setIndex],
                                target: newTargetId,
                            },
                            ...preset.items.slice(setIndex + 1, preset.items.length),
                        ],
                    },
                    ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
                ],
            });
        }
    }, [preset, presetIndex, savedTargets, configState]);

    console.log(`## Preset ${presetId} Items: `, preset ? preset.items : '');

    const presetItemsUI = React.useMemo(() => {
        return preset && preset.items.map(item => (
            <Grid item key={item.id}>
                <OrderItem
                    canClose={preset.items.length > 1}
                    value={item}
                    savedTargets={savedTargets}
                    addNewTarget={addNewTargetAndSelectIt}
                    deleteItem={deleteOrderItem}
                    updateItem={setOrderItem}
                />
            </Grid>
        ));
    }, [preset, savedTargets, deleteOrderItem, setOrderItem, addNewTargetAndSelectIt]);

    return (
        <>
            <Grid container direction="row" className={classes.presetName}>
                <TextField
                    label="Preset name"
                    value={preset ? preset.name : ''}
                    onChange={onChangePresetName}
                />
                { allowDelete && (
                    <IconButton className={classes.deletePresetButton} onClick={deletePreset}>
                        <DeleteIcon />
                    </IconButton>
                )}
            </Grid>
            <Grid container spacing={2} direction="row" className={classes.grid}>
                { presetItemsUI }
                <Grid item className={classes.centered}>
                    <IconButton className={classes.addItemButton} onClick={addOrderItem}>
                        <AddIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </>
    );
};
