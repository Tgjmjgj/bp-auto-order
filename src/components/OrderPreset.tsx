import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import { ConfigStateContext } from '../ConfigStateProvider';
import { OrderItem as OrderItemData } from '../ConfigStateProvider';
import { OrderItem } from './OrderItem';

type Props = {
    presetIndex: number
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
    name: '',
    price: 0,
    quantity: 1,
    target: '',
});

export const OrderPreset: React.FC<Props> = ({presetIndex, deletePreset}) => {
    const configState = React.useContext(ConfigStateContext);
    const classes = useStyles();
    const preset = configState.state.presets[presetIndex];
    const savedTargets = configState.state.savedTargets;

    const onChangePresetName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        configState.updateState({
            presets: [
                ...configState.state.presets.slice(0, presetIndex),
                {
                    name: e.target.value,
                    items: preset.items,
                },
                ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
            ],
        });
    }, [preset, presetIndex, configState]);

    const addOrderItem = React.useCallback(() => {
        configState.updateState({
            presets: [
                ...configState.state.presets.slice(0, presetIndex),
                {
                    name: preset.name,
                    items: [
                        ...preset.items,
                        newOrderItem(),
                    ],
                },
                ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
            ],
        });
    }, [preset, presetIndex, configState]);

    const deleteOrderItem = React.useCallback((index: number) => {
        configState.updateState({
            presets: [
                ...configState.state.presets.slice(0, presetIndex),
                {
                    name: preset.name,
                    items: [
                        ...preset.items.slice(0, index),
                        ...preset.items.slice(index + 1, preset.items.length),
                    ],
                },
                ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
            ],
        });
    }, [preset, presetIndex, configState]);

    const setOrderItem = React.useCallback((index: number, newValue: OrderItemData) => {
        configState.updateState({
            presets: [
                ...configState.state.presets.slice(0, presetIndex),
                {
                    name: preset.name,
                    items: [
                        ...preset.items.slice(0, index),
                        newValue,
                        ...preset.items.slice(index + 1, preset.items.length),
                    ],
                },
                ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
            ],
        });
    }, [preset, presetIndex, configState]);

    const addNewTargetAndSelectIt = React.useCallback((index: number, value: string) => {
        configState.updateState({
            savedTargets: [
                ...savedTargets,
                { key: value, displayName: value },
            ],
            presets: [
                ...configState.state.presets.slice(0, presetIndex),
                {
                    name: preset.name,
                    items: [
                        ...preset.items.slice(0, index),
                        {
                            ...preset.items[index],
                            target: value,
                        },
                        ...preset.items.slice(index + 1, preset.items.length),
                    ],
                },
                ...configState.state.presets.slice(presetIndex + 1, configState.state.presets.length),
            ],
        });
    }, [preset, presetIndex, savedTargets, configState]);

    console.log(`## Preset ${presetIndex} Items: ${preset.items}`);

    const presetItemsUI = React.useMemo(() => preset.items.map((item, i) => {
        return (
            <Grid item key={i}>
                <OrderItem
                    onClose={() => deleteOrderItem(i)}
                    canClose={preset.items.length > 1}
                    value={item}
                    setValue={newValue => setOrderItem(i, newValue)}
                    savedTargets={savedTargets}
                    addNewTarget={value => addNewTargetAndSelectIt(i, value)}
                />
            </Grid>
        );
    }), [preset.items, savedTargets, deleteOrderItem, setOrderItem, addNewTargetAndSelectIt]);

    return (
        <>
            <Grid container direction="row" className={classes.presetName}>
                <TextField
                    label="Preset name"
                    value={preset.name}
                    onChange={onChangePresetName}
                />
                <IconButton className={classes.deletePresetButton} onClick={deletePreset}>
                    <DeleteIcon />
                </IconButton>
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
