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
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ConfigStateContext } from '../providers/ConfigStateProvider';
import { MenuContext } from '../providers/MenuProvider';
import { getRandomOrder } from '../service/functions';
import { OrderItemStatic } from '../components/OrderItemStatic';
import { RandomOrderOptionsTargetKey, randomOrderOptionsTargetKeys } from '../constants';
import { randomId } from '../utils';
import { OrderItem as OrderItemData } from '../../types/autoOrderConfigs';
import { OrderItemDisplayData } from '../components/OrderItem';

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
            marginRight: theme.spacing(6),
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
        itemsLoader: {
            marginTop: theme.spacing(16),
            marginLeft: theme.spacing(30),
        },
        totalRow: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        totalCost: {
            fontWeight: 700,
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(1),
        },
    }),
);

type PresetLabelText = 'Choose from preset' | 'Preset';

export const ManualOrder: React.FC = () => {

    const configState = React.useContext(ConfigStateContext);
    const menuState = React.useContext(MenuContext);
    const [selectedPreset, setSelectedPreset] = React.useState('');
    const [items, setItems] = React.useState<OrderItemData[]>([]);
    const [loading, setLoading] = React.useState(false);
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

    const targetsForRandom = React.useMemo(() => {
        return configState.state.savedTargets.filter(target =>
            (randomOrderOptionsTargetKeys as unknown as string[]).includes(target.key),
        );
    }, [configState]);

    const [targetKeyForRandom, setTargetKeyForRandom] = React.useState(targetsForRandom[0].key)

    const targetOptionsForRandom = React.useMemo(() =>
        targetsForRandom.map(target => (
            <MenuItem value={target.key} key={target.id}>
                {target.displayName}
            </MenuItem>
        ),
    ), [targetsForRandom]);

    const onTargetForRandomChange = React.useCallback((e: React.ChangeEvent<{name?: string | undefined; value: unknown}>) => {
        setTargetKeyForRandom(e.target.value as string);
    }, []);

    const onSelectedPresetChange = React.useCallback((e: React.ChangeEvent<{name?: string | undefined; value: unknown}>) => {
        setSelectedPreset(e.target.value as string);
    }, []);

    React.useEffect(() => {
        const preset = configState.state.presets.find(preset => preset.id === selectedPreset);
        setItems(preset ? preset.items : []);
    }, [configState, selectedPreset]);

    const randomize = React.useCallback(async () => {
        setSelectedPreset('');
        setItems([]);
        try {
            setLoading(true);
            const {data} = await getRandomOrder(targetKeyForRandom);
            if (data) {
                console.log('@Items: ', data);
                setItems(data);
                setLoading(false);
            }
        } catch (e) {
            console.error(`Error: getRandomOrder > ${e}`);
            setLoading(false);
        }
    }, [targetKeyForRandom]);

    React.useEffect(() => {
        setPresetLabel(selectedPreset ? 'Preset' : 'Choose from preset');
    }, [selectedPreset]);

    const onPresetSelectOpen = React.useCallback(() => setPresetLabel('Preset'), []);

    const onPresetSelectBlur = React.useCallback(() => {
        setPresetLabel(selectedPreset ? 'Preset' : 'Choose from preset');
    }, [selectedPreset]);

    const displayItems = React.useMemo<OrderItemDisplayData[]>(() => items.map(item => {
        const target = configState.state.savedTargets.find(({id, key}) => [id, key].includes(item.target));
        const targetMenu = target && menuState[target.key as RandomOrderOptionsTargetKey];
        const menuItem = item.ref && targetMenu && targetMenu.find(menuItem => menuItem.id === item.ref);
        return {
            ...item,
            target: target ? target.displayName : item.id,
            imageUrl: menuItem && menuItem.imageUrl ? menuItem.imageUrl : undefined,
        };
    }), [items, configState, menuState]);

    const totalCost = React.useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);

    const itemsUI = React.useMemo(() => {
        console.log('@displayItems: ', displayItems);
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
                                disabled={loading}
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
                            disabled={loading}
                        >
                            Randomize
                        </Button>
                        <Typography className={classes.fromText}>
                            from
                        </Typography>
                        <Select
                            value={targetKeyForRandom}
                            onChange={onTargetForRandomChange}
                            disabled={loading}
                        >
                            {targetOptionsForRandom}
                        </Select>
                    </Box>
                </Grid>
                <Divider />
                <Grid container spacing={2} direction="row" className={classes.grid}>
                    {itemsUI}
                </Grid>
                { !!items.length && (
                    <>
                        <Divider />
                        <Grid item className={classes.totalRow}>
                            <Box display='flex'>
                                <Typography>
                                    Total cost:
                                </Typography>
                                <Typography className={classes.totalCost}>
                                    {totalCost}
                                </Typography>
                                <Typography>
                                    ₽
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={loading}
                            >
                                Place this order
                            </Button>
                        </Grid>
                    </>
                )}
                { loading && (
                    <Grid className={classes.itemsLoader}>
                        <CircularProgress color="inherit" />
                    </Grid>
                )}
            </Grid>
        </>
    );
};
