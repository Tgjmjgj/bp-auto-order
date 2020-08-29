import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box/Box';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

import { ConfigStateContext } from '../ConfigStateProvider';
import { OrderItemStatic } from '../components/OrderItemStatic';
import { OrderItem as OrderItemData } from '../../types/autoOrderConfigs';
import { randomOrderOptionsTargetKeys } from '../constants';
import { randomId } from '../utils';
import { Divider } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        row: {
            display: 'flex',
            alignItems: 'center',
            [theme.breakpoints.down('sm')]: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
            },
        },
        innerRow: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: theme.spacing(3),
            marginRight: theme.spacing(3),
            marginBottom: theme.spacing(2),
        },
        presetSelect: {
            minWidth: 200,
        },
        fromText: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
        grid: {
            padding: theme.spacing(2),
        },
    }),
);

type PresetLabelText = 'Choose from preset' | 'Preset';

export const ManualOrder: React.FC = () => {

    const configState = React.useContext(ConfigStateContext);
    const [selectedPreset, setSelectedPreset] = React.useState('');
    const [items, setItems] = React.useState<OrderItemData[]>([]);
    const [presetLabel, setPresetLabel] = React.useState<PresetLabelText>('Choose from preset');
    const uniqControlIdRef = React.useRef('manual-order-preset' + randomId());
    const classes = useStyles();

    const presetOptions = React.useMemo(() =>
        configState.state.presets.map(preset => (
            <MenuItem value={preset.id} key={preset.id}>
                {preset.name}
            </MenuItem>
        ),
    ), [configState]);

    const targetsForRandom = React.useMemo(
        () => configState.state.savedTargets.filter(target => randomOrderOptionsTargetKeys.includes(target.key)),
        [configState],
    );

    const [targetForRandom, setTargetForRandom] = React.useState(targetsForRandom[0].id)

    const targetOptionsForRandom = React.useMemo(() =>
        targetsForRandom.map(target => (
            <MenuItem value={target.id} key={target.id}>
                {target.displayName}
            </MenuItem>
        ),
    ), [targetsForRandom]);

    const onTargetForRandomChange = React.useCallback((e: React.ChangeEvent<{name?: string | undefined; value: unknown}>) => {
        setTargetForRandom(e.target.value as string);
    }, []);

    const onSelectedPresetChange = React.useCallback((e: React.ChangeEvent<{name?: string | undefined; value: unknown}>) => {
        setSelectedPreset(e.target.value as string);
    }, []);

    React.useEffect(() => {
        const preset = configState.state.presets.find(preset => preset.id === selectedPreset);
        setItems(preset ? preset.items : []);
    }, [configState, selectedPreset]);

    const randomize = React.useCallback(() => {
        setSelectedPreset('');
    }, []);

    React.useEffect(() => {
        setPresetLabel(selectedPreset ? 'Preset' : 'Choose from preset');
    }, [selectedPreset]);

    const onPresetSelectOpen = React.useCallback(() => setPresetLabel('Preset'), []);
    
    const onPresetSelectBlur = React.useCallback(() => {
        setPresetLabel(selectedPreset ? 'Preset' : 'Choose from preset');
    }, [selectedPreset]);

    const displayItems = React.useMemo(() => items.map(item => {
        const target = configState.state.savedTargets.find(target => target.id === item.target);
        return {
            ...item,
            target: target ? target.displayName : item.id,
        };
    }), [items, configState]);

    const itemsUI = React.useMemo(() => {
        return displayItems.map(item => (
            <Grid item key={item.id}>
                <OrderItemStatic value={item} />
            </Grid>
        ));
    }, [displayItems]);

    return (
        <>
            <Grid container spacing={4} direction="column">
                <Grid item>
                    <Typography variant="h5" gutterBottom align="center">
                        Manual Order placement
                    </Typography>
                </Grid>
                <Grid item className={classes.row}>
                    <Box className={classes.innerRow}>
                        <FormControl variant="outlined" size="small">
                            <InputLabel id={uniqControlIdRef.current}>
                                {presetLabel}
                            </InputLabel>
                            <Select
                                labelId={uniqControlIdRef.current}
                                className={classes.presetSelect}
                                displayEmpty
                                label={presetLabel}
                                value={selectedPreset}
                                onChange={onSelectedPresetChange}
                                onOpen={onPresetSelectOpen}
                                onBlur={onPresetSelectBlur}
                            >
                                {presetOptions}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box className={classes.innerRow}>
                        <Typography>
                            OR
                        </Typography>
                    </Box>
                    <Box className={classes.innerRow}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={randomize}
                        >
                            Randomize
                        </Button>
                        <Typography className={classes.fromText}>
                            from
                        </Typography>
                        <Select
                            value={targetForRandom}
                            onChange={onTargetForRandomChange}
                        >
                            {targetOptionsForRandom}
                        </Select>
                    </Box>
                </Grid>
                <Divider/>
                <Grid container spacing={2} direction="row" className={classes.grid}>
                    {itemsUI}
                </Grid>
                { !!items.length && (
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                        >
                            Place this order
                        </Button>
                    </Grid>
                )}
            </Grid>
        </>
    );
};