import React from 'react';
import produce from 'immer';
import get from 'lodash/get';
import cn from 'classnames';

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
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

import { ConfigStateContext, ConfigUpdateContext } from '../providers/ConfigStateProvider';
import { DateForContext } from '../providers/DateForProvider';
import { getRandomOrder, placeOrder as placeOrderCall } from '../service/functions';
import { OrderItemCard } from '../components/OrderItemCard';
import { getI, randomId } from '../utils';
import { OrderItem as OrderItemData } from '../../types/autoOrderConfigs';

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
            minHeight: 300,
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
        leftMargin: {
            marginLeft: 60,
        },
        greenButton: {
            color: theme.palette.success.dark,
            borderColor: theme.palette.success.dark,
            '&:hover': {
                backgroundColor: `${theme.palette.success.dark}0a`,
            },
        },
        actionsToolbar: {
            marginTop: theme.spacing(2),
        },
        greyButton: {
            '&:hover': {
                borderColor: '#000',
            },
        },
        presetName: {
            minWidth: 300,
        },
        placeOrderDialog: {
            minWidth: 400,
        },
        placeOrderLoader: {
            width: '100%',
            marginTop: 4,
            marginBottom: 16,
        },
    }),
);

type PresetLabelText = 'Choose from preset' | 'Preset';

const placeOrderSteps = [
    'none',
    'loading',
    'error',
    'success',
    'already-exists',
] as const;

type PlaceOrderStep = typeof placeOrderSteps[number];

export const ManualOrder: React.FC = () => {

    const configState = React.useContext(ConfigStateContext);
    const updateConfig = React.useContext(ConfigUpdateContext);
    const { dateFor } = React.useContext(DateForContext);
    const [selectedPreset, setSelectedPreset] = React.useState('');
    const [items, setItems] = React.useState<OrderItemData[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [itemLoading, setItemLoading] = React.useState(false);
    const [placeOrderStep, setPlaceOrderStep] = React.useState<PlaceOrderStep>('none');
    const [presetLabel, setPresetLabel] = React.useState<PresetLabelText>('Choose from preset');
    const [showPresetDialog, setShowPresetDialog] = React.useState(false);
    const [presetName, setPresetName] = React.useState('');
    const [placeOrderError, setPlaceOrderError] = React.useState('');
    const uniqControlIdRef = React.useRef('manual-order-preset-' + randomId());
    const uniqDialogIdRef = React.useRef('manual-order-dialog-' + randomId());
    const uniqDialog2IdRef = React.useRef('manual-order-dialog-2-' + randomId());
    const uniqDialog3IdRef = React.useRef('manual-order-dialog-3-' + randomId());
    const classes = useStyles();

    const presetOptions = React.useMemo(() =>
        configState.state.presets.map(preset => (
            <MenuItem value={preset.id} key={preset.id}>
                {preset.name}
            </MenuItem>
        ),
    ), [configState]);

    const targetsForRandom = React.useMemo(() => {
        return configState.state.savedTargets.filter(target => target.isSystem);
    }, [configState]);

    const [targetKeyForRandom, setTargetKeyForRandom] = React.useState(targetsForRandom[0].id)

    const targetOptionsForRandom = React.useMemo(() =>
        targetsForRandom.map(target => (
            <MenuItem value={target.id} key={target.id}>
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

    const randomizeAllItems = React.useCallback(async () => {
        setSelectedPreset('');
        setItems([]);
        try {
            setLoading(true);
            const {data} = await getRandomOrder(targetKeyForRandom, dateFor);
            if (data) {
                console.log('@Items: ', data);
                setItems(data);
            }
            setLoading(false);
        } catch (e) {
            console.error('Error: getRandomOrder: ', e);
            setLoading(false);
        }
    }, [targetKeyForRandom, dateFor]);

    const randomizeOneItem = React.useCallback(async () => {
        setSelectedPreset('');
        try {
            setItemLoading(true);
            const {data} = await getRandomOrder(targetKeyForRandom, dateFor, items);
            if (data) {
                console.log('@Items: ', data);
                setItems(data);
            }
            setItemLoading(false);
        } catch (e) {
            console.error('Error: getRandomOrder with items: ', e);
            setItemLoading(false);
        }
    }, [targetKeyForRandom, items, dateFor]);

    React.useEffect(() => {
        setPresetLabel(selectedPreset ? 'Preset' : 'Choose from preset');
    }, [selectedPreset]);

    const onPresetSelectOpen = React.useCallback(() => setPresetLabel('Preset'), []);

    const onPresetSelectBlur = React.useCallback(() => {
        setPresetLabel(selectedPreset ? 'Preset' : 'Choose from preset');
    }, [selectedPreset]);

    const totalCost = React.useMemo(() => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [items]);

    const deleteItem = React.useCallback((itemId: string) => {
        const delIndex = getI(items, itemId);
        if (delIndex !== -1) {
            const newItems = produce(items, state => {
                state.splice(delIndex, 1);
            });
            setItems(newItems);
        }
    }, [items]);

    const changeQuantity = React.useCallback((newQuantity: number, itemId: string) => {
        const itemIndex = getI(items, itemId);
        if (itemIndex !== -1 && items[itemIndex].quantity !== newQuantity) {
            setItems(produce(items, state => {
                state[itemIndex].quantity = newQuantity;
            }));
        }
    }, [items]);

    const onClosePresetDialog = React.useCallback(() => setShowPresetDialog(false), []);

    const onSubmitPresetDialog = React.useCallback(e => {
        e.preventDefault();
        const name = get(e, 'target.elements.presetName.value');
        if (name) {
            const id = randomId();
            updateConfig(oldState => produce(oldState, state => {
                state.presets.push({ id, name, items });
            }));
            setSelectedPreset(id);
        }
        setShowPresetDialog(false);
    }, [items, updateConfig]);

    const onPresetNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPresetName(e.target.value);
    }, []);

    const placeOrder = React.useCallback(async (overwrite = false) => {
        try {
            setPlaceOrderStep('loading');
            await placeOrderCall({
                items,
                forDate: dateFor,
                spreadsheetId: configState.state.spreadsheetId,
                targets: configState.state.savedTargets,
                customName: configState.state.customName,
                systemName: configState.state.systemName,
                allowMultiple: configState.state.allowMultipleOrders,
                overwrite,
            });
            setPlaceOrderStep('success');
        } catch (e) {
            if (e.code === 'already-exists') {
                setPlaceOrderStep('already-exists');
            } else {
                setPlaceOrderStep('error');
                setPlaceOrderError(e.message || 'Unknown Error. Please, contact the developer');
            }
        }
    }, [items, configState, dateFor]);

    const itemsUI = React.useMemo(() => {
        console.log('@displayItems: ', items);
        return items.map(item => (
            <Grid item key={item.id}>
                <OrderItemCard
                    frozen
                    item={item}
                    savedTargets={configState.state.savedTargets}
                    notifyQuantityChange={selectedPreset ? undefined : changeQuantity}
                    editableQuantity={selectedPreset ? false : true}
                    onClose={selectedPreset ? undefined : deleteItem}
                />
            </Grid>
        ));
    }, [items, configState, selectedPreset, deleteItem, changeQuantity]);

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
                                disabled={loading || itemLoading}
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
                            color="default"
                            className={classes.greyButton}
                            onClick={randomizeAllItems}
                            disabled={loading || itemLoading}
                        >
                            Randomize
                        </Button>
                        <Typography className={classes.fromText}>
                            from
                        </Typography>
                        <Select
                            value={targetKeyForRandom}
                            onChange={onTargetForRandomChange}
                            disabled={loading || itemLoading}
                        >
                            {targetOptionsForRandom}
                        </Select>
                    </Box>
                </Grid>
                <Divider  />
                { !selectedPreset && !!items.length && (
                    <Grid container justify="flex-start" className={classes.actionsToolbar}>
                        <Button
                            variant="outlined"
                            className={classes.greenButton}
                            onClick={() => setShowPresetDialog(true)}
                            disabled={loading || itemLoading}
                        >
                            Save as new Preset
                        </Button>
                    </Grid>
                )}
                <Grid container spacing={2} direction="row" className={classes.grid}>
                    {itemsUI}
                    { !selectedPreset && !loading && (
                        <Grid item className={classes.centered}>
                            <Tooltip arrow title="Add one random item" aria-label="Add one randome item">
                                <IconButton
                                    className={cn(classes.addItemButton, { [classes.leftMargin]: !items.length })}
                                    onClick={randomizeOneItem}
                                    disabled={itemLoading}
                                >
                                    { itemLoading
                                        ? <CircularProgress size={24} color="inherit" />
                                        : <AddIcon />
                                    }
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    )}
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
                                disabled={loading || itemLoading}
                                onClick={() => placeOrder()}
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

                <Dialog open={showPresetDialog} onClose={onClosePresetDialog} aria-labelledby={uniqDialogIdRef.current}>
                    <form onSubmit={onSubmitPresetDialog}>
                        <DialogTitle id={uniqDialogIdRef.current}>
                            Save new preset
                        </DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                name="presetName"
                                label="Preset name"
                                className={classes.presetName}
                                autoComplete="off"
                                value={presetName}
                                onChange={onPresetNameChange}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClosePresetDialog}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                color="secondary"
                                disabled={!presetName}
                            >
                                Confirm
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Grid>

            <Dialog
                open={placeOrderStep !== 'none'}
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby={uniqDialog2IdRef.current}
                aria-describedby={uniqDialog3IdRef.current}
            >
                { placeOrderStep === 'loading' && (
                    <DialogContent className={classes.placeOrderDialog}>
                        <LinearProgress variant="indeterminate" className={classes.placeOrderLoader} />
                    </DialogContent>
                )}
                { placeOrderStep === 'already-exists' && (
                    <>
                        <DialogTitle id={uniqDialog2IdRef.current}>
                            Warning
                        </DialogTitle>
                        <DialogContent className={classes.placeOrderDialog}>
                            <DialogContentText id={uniqDialog3IdRef.current}>
                                Your order already exists. Do you really want to overwrite it?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                color="primary"
                                onClick={() => setPlaceOrderStep('none')}
                                autoFocus
                            >
                                No
                            </Button>
                            <Tooltip
                                arrow
                                placement="top"
                                title="You privious order will be lost"
                                aria-label="Your previous order will be lost"
                            >
                                <Button color="secondary" onClick={() => placeOrder(true)}>
                                    Yes
                                </Button>
                            </Tooltip>
                        </DialogActions>
                    </>
                )}
                { placeOrderStep === 'success' && (
                    <>
                        <DialogTitle id={uniqDialog2IdRef.current}>
                            Success
                        </DialogTitle>
                        <DialogContent className={classes.placeOrderDialog}>
                            <DialogContentText id={uniqDialog3IdRef.current}>
                                Your order has been successfully placed to the spreadsheet!
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                color="primary"
                                onClick={() => setPlaceOrderStep('none')}
                                autoFocus
                            >
                                Wonderful
                            </Button>
                        </DialogActions>
                    </>
                )}
                { placeOrderStep === 'error' && (
                    <>
                        <DialogTitle id={uniqDialog2IdRef.current}>
                            Error
                        </DialogTitle>
                        <DialogContent className={classes.placeOrderDialog}>
                            <DialogContentText id={uniqDialog3IdRef.current}>
                                {placeOrderError}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setPlaceOrderStep('none')} autoFocus>
                                Sadness
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};
