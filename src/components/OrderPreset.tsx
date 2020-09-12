import React from 'react';
import produce from 'immer';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';

import { ConfigStateContext } from '../providers/ConfigStateProvider';
import { MenuContext } from '../providers/MenuProvider';
import { OrderItem } from './OrderItem';
import { randomId, getI } from '../utils';
import { OrderItem as OrderItemData } from '../../types/autoOrderConfigs';
import { MenuItemSelector } from './MenuItemSelector';

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
        menuDialog: {
            '& .MuiDialog-paperWidthSm': {
                maxWidth: 800,
                width: 800,
            },
        },
        dialogTitle: {
            margin: 0,
            marginLeft: theme.spacing(2),
            padding: theme.spacing(2),
        },
        dialogTitleText: {
            fontSize: '1.3rem',
        },
        closeDialogButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
    }),
);

const newOrderItem = (): OrderItemData => ({
    id: randomId(),
    name: '',
    price: 0,
    quantity: 1,
    target: '',
});

export const OrderPreset: React.FC<Props> = ({presetId, allowDelete, deletePreset}) => {
    const classes = useStyles();
    const configState = React.useContext(ConfigStateContext);
    const menuState = React.useContext(MenuContext);
    const [pendingChangeTarget, setPendingChangeTarget] = React.useState<PendingChangeTarget | null>(null);

    const preset = configState.state.presets.find(preset => preset.id === presetId);
    const presetIndex = getI(configState.state.presets, presetId);
    const savedTargets = configState.state.savedTargets;
    const menuItems = pendingChangeTarget ? menuState[pendingChangeTarget.targetId] : [];

    const onChangePresetName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) {
            return null;
        }
        configState.updateState(produce(configState.state, state => {
            if (presetIndex !== -1) {
                state.presets[presetIndex].name = e.target.value;
            }
        }));
    }, [presetIndex, configState]);

    const addOrderItem = React.useCallback(() => {
        if (presetIndex !== -1) {
            configState.updateState(produce(configState.state, state => {
                state.presets[presetIndex].items.push(newOrderItem());
            }));
        }
    }, [presetIndex, configState]);

    const deleteOrderItem = React.useCallback((orderItemId: string) => {
        if (presetIndex !== -1) {
            const presetItems = configState.state.presets[presetIndex].items;
            const delIndex = getI(presetItems, orderItemId);
            if (delIndex !== -1) {
                configState.updateState(produce(configState.state, state => {
                    state.presets[presetIndex].items.splice(delIndex, 1);
                }));
            }
        }
    }, [presetIndex, configState]);

    const changeOrderItemName = React.useCallback((newName: string, orderItemId: string) => {
        if (presetIndex !== -1 && newName) {
            configState.updateState(produce(configState.state, state => {
                const presetItems = state.presets[presetIndex].items;
                const item = presetItems.find(item => item.id === orderItemId);
                if (item) {
                    item.name = newName;
                }
            }));
        }
    }, [presetIndex, configState]);

    const changeOrderItemPrice = React.useCallback((newPrice: number, orderItemId: string) => {
        if (presetIndex !== -1 && !isNaN(newPrice) && newPrice >= 0) {
            configState.updateState(produce(configState.state, state => {
                const presetItems = state.presets[presetIndex].items;
                const item = presetItems.find(item => item.id === orderItemId);
                if (item) {
                    item.price = newPrice;
                }
            }));
        }
    }, [presetIndex, configState]);

    const changeOrderItemQuantity = React.useCallback((newQuantity: number, orderItemId: string) => {
        if (presetIndex !== -1 && !isNaN(newQuantity) && newQuantity > 0) {
            configState.updateState(produce(configState.state, state => {
                const presetItems = state.presets[presetIndex].items;
                const item = presetItems.find(item => item.id === orderItemId);
                if (item) {
                    item.quantity = newQuantity;
                }
            }));
        }
    }, [presetIndex, configState]);

    const changeOrderItemTarget = React.useCallback((targetId: string, orderItemId: string) => {
        const newTarget = configState.state.savedTargets.find(target => target.id === targetId);
        if (presetIndex !== -1 && newTarget) {
            if (newTarget.isSystem) {
                setPendingChangeTarget({
                    itemId: orderItemId,
                    targetId,
                });
            } else {
                configState.updateState(produce(configState.state, state => {
                    const presetItems = state.presets[presetIndex].items;
                    const item = presetItems.find(item => item.id === orderItemId);
                    if (item) {
                        item.target = targetId;
                    }
                }));
            }
        }
    }, [presetIndex, configState]);

    const addNewTargetAndSelectIt = React.useCallback((orderItemId: string, newTarget: string) => {
        if (presetIndex !== -1) {
            configState.updateState(produce(configState.state, state => {
                const presetItems = state.presets[presetIndex].items;
                const item = presetItems.find(item => item.id === orderItemId);
                if (item) {
                    const newTargetId = randomId();
                    state.savedTargets.push({
                        id: newTargetId,
                        displayName: newTarget,
                        isSystem: false,
                    });
                    item.target = newTargetId;
                }
            }));
        }
    }, [presetIndex, configState]);

    const onCloseMenuDialog = React.useCallback(() => {
        setPendingChangeTarget(null);
    }, []);

    const selectTargetMenuItem = React.useCallback((menuItemId: string) => {
        const menuItem = menuState[pendingChangeTarget!.targetId].find(menuItem => menuItem.id === menuItemId);
        const itemIndex = getI(configState.state.presets[presetIndex].items, pendingChangeTarget!.itemId);
        if (presetIndex !== -1 && menuItem && itemIndex !== -1) {
            configState.updateState(produce(configState.state, state => {
                const itemData = state.presets[presetIndex].items[itemIndex];
                state.presets[presetIndex].items[itemIndex] = {
                    id: itemData.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: 1,
                    target: pendingChangeTarget!.targetId,
                    ref: menuItem.id,
                };
            }));
        }
        setPendingChangeTarget(null);
    }, [presetIndex, configState, menuState, pendingChangeTarget]);

    console.log(`## Preset ${presetId} Items: `, preset ? preset.items : '');

    const presetItemsUI = React.useMemo(() => {
        return preset ? preset.items.map(item => (
            <Grid item key={item.id}>
                <OrderItem
                    item={item}
                    savedTargets={savedTargets}
                    onChangeName={changeOrderItemName}
                    onChangePrice={changeOrderItemPrice}
                    onChangeQuantity={changeOrderItemQuantity}
                    onChangeTarget={changeOrderItemTarget}
                    addNewTarget={addNewTargetAndSelectIt}
                    onClose={preset.items.length > 1 ? deleteOrderItem : undefined}
                />
            </Grid>
        )) : null;
    }, [
        preset,
        savedTargets,
        changeOrderItemName,
        changeOrderItemPrice,
        changeOrderItemQuantity,
        changeOrderItemTarget,
        addNewTargetAndSelectIt,
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
                    <Tooltip title="Delete Preset" aria-label="Delete Preset">
                        <IconButton className={classes.deletePresetButton} onClick={deletePreset}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Grid>
            <Grid container spacing={2} direction="row" className={classes.grid}>
                { presetItemsUI }
                <Grid item className={classes.centered}>
                    <Tooltip title="Add item" aria-label="Add item">
                        <IconButton className={classes.addItemButton} onClick={addOrderItem}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>

            
            <Dialog
                open={pendingChangeTarget !== null}
                onClose={onCloseMenuDialog}
                disableBackdropClick
                className={classes.menuDialog}
            >
                <DialogTitle disableTypography className={classes.dialogTitle}>
                    <Typography className={classes.dialogTitleText}>
                        Select menu item
                    </Typography>
                    <IconButton
                        aria-label="Close"
                        className={classes.closeDialogButton}
                        onClick={onCloseMenuDialog}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <MenuItemSelector
                        items={menuItems}
                        selectItem={selectTargetMenuItem}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
