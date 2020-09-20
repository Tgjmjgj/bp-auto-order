import React from 'react';
import cn from 'classnames';
import isEqual from 'lodash/isEqual';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { MenuContext } from '../providers/MenuProvider';
import { DialogsContext } from '../providers/DialogsProvider';
import { useDefferedCall } from '../hooks/useDefferedCall';
import { NumberTextField } from './NumberTextField';
import { FreeSelect } from './FreeSelect'
import { randomId } from '../utils';
import { OrderItem as OrderItemData, OrderTarget } from '../../types/autoOrderConfigs';

import foodPlaceholder from '../images/food-placeholder.png';

type Props = {
    item: OrderItemData
    savedTargets: OrderTarget[]
    frozen?: boolean
    editableQuantity?: boolean                                                  // to allow change quantity for FROZEN item
    onClose?: (itemId: string) => void
    changeItem?: (updatedItem: OrderItemData) => void                           // used to change item in state
    notifyNameChange?: (newName: string, itemId: string) => void                // just for notification parent component of changes
    notifyPriceChange?: (newPrice: number, itemId: string) => void              // for notification
    notifyQuantityChange?: (newQuantity: number, itemId: string) => void        // for notification
    notifyTargetIdChange?: (newTargetId: string, itemId: string) => void        // for notification
    addNewTargetAndChangeItem?: (newTarget: OrderTarget, updatedItem: OrderItemData) => void
};

const defferedUpdateTimeout = 1000;
const readonlyProps = { readOnly: true };

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
        imgWrapper: {
            position: 'relative',
            overflow: 'hidden',
        },
        unavailableImage: {
            filter: 'grayscale(1)',
        },
        badge: {
            position: 'absolute',
            top: 0,
            left: 0,
            color: '#fff',
            fontSize: '13px',
            height: '20px',
            boxShadow: '0px 0px 7px 1px #000;',
            padding: '0 32px',
            textShadow: '0px 0px 2px rgba(0,0,0,.78)',
            userSelect: 'none',
        },
        refBadge: {
            backgroundColor: '#7bb21f',
            transform: 'rotate(315deg) translate(-30px, -17px)',
            '&:hover': {
                transform: 'rotate(315deg) translate(-30px, -17px) scale(1.1)',
            },
        },
        unavailableBadge: {
            backgroundColor: '#cc0404',
            transform: 'rotate(315deg) translate(-38px, -7px)',
            '&:hover': {
                transform: 'rotate(315deg) translate(-38px, -10px) scale(1.1)',
            },
        },
    }),
);

export const OrderItemCard: React.FC<Props> = React.memo(props => {
    const {
        item,
        savedTargets,
        frozen = false,
        editableQuantity = false,
        onClose,
        changeItem,
        notifyNameChange,
        notifyPriceChange,
        notifyQuantityChange,
        notifyTargetIdChange,
        addNewTargetAndChangeItem,
    } = props;
    const classes = useStyles();
    const menuContext = React.useContext(MenuContext);
    const dialogsContext = React.useContext(DialogsContext);
    const [name, setName] = React.useState(item.name);
    const [price, setPrice] = React.useState(item.price);
    const [quantity, setQuantity] = React.useState(item.quantity);
    const [targetId, setTargetId] = React.useState(item.targetId);
    const [menuItemId, setMenuItemId] = React.useState(item.menuItemId);
    const [pendingTargetId, setPendingTargetId] = React.useState<string | null>(null);

    const itemId = item.id;
    const itemTarget = React.useMemo(() => savedTargets.find(target => target.id === targetId), [savedTargets, targetId]);
    const menu = menuContext[targetId];
    const refItem = React.useMemo(() => menu && menu.find(menuItem => menuItem.id === menuItemId), [menu, menuItemId]);

    const updateItem = React.useCallback(() => {
        if (name === item.name && price === item.price && quantity === item.quantity && targetId === item.targetId && menuItemId === item.menuItemId) {
            return;
        }
        changeItem && changeItem({
            id: item.id,
            name,
            price,
            quantity,
            targetId,
            ...( menuItemId ? { menuItemId } : undefined ),
        });
    }, [changeItem, item, name, price, quantity, targetId, menuItemId]);

    useDefferedCall(defferedUpdateTimeout, updateItem);

    const targetOptions = savedTargets.map(target => ({
        key: target.id,
        displayValue: target.displayName,
    }));

    const onChangeName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('@ frozen: ', frozen);
        console.log('@ refItem: ', refItem);
        if (!frozen && !refItem) {
            console.log('@ set name');
            setName(e.target.value);
            notifyNameChange && notifyNameChange(e.target.value, itemId);
        }
    }, [frozen, refItem, notifyNameChange, itemId]);

    const onChangePrice = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = Number(e.target.value);
        if (!frozen && !refItem && !isNaN(newPrice) && newPrice >= 0) {
            setPrice(newPrice);
            notifyPriceChange && notifyPriceChange(newPrice, itemId);
        }
    }, [frozen, refItem, notifyPriceChange, itemId]);

    const onChangeQuantity = React.useCallback((value: number) => {
        if (!frozen || editableQuantity) {
            setQuantity(value);
            notifyQuantityChange && notifyQuantityChange(value, itemId);
        }
    }, [frozen, editableQuantity, notifyQuantityChange, itemId]);

    const onChangeTargetId = React.useCallback((targetId: string) => {
        if (!frozen) {
            const foundTarget = savedTargets.find(target => target.id === targetId);
            if (foundTarget) {
                if (foundTarget.isSystem) {
                    setPendingTargetId(foundTarget.id);
                } else {
                    setTargetId(targetId);
                    notifyTargetIdChange && notifyTargetIdChange(targetId, itemId);
                }
            }
        }
    }, [frozen, savedTargets, notifyTargetIdChange, itemId]);

    const addNewTargetItem = React.useCallback((newTargetName: string) => {
        if (addNewTargetAndChangeItem && newTargetName) {
            const newTargetId = randomId();
            addNewTargetAndChangeItem(
                {
                    id: newTargetId,
                    displayName: newTargetName,
                    isSystem: false,
                },
                {
                    id: itemId,
                    name,
                    price,
                    quantity,
                    targetId: newTargetId,
                    ...( menuItemId ? { menuItemId } : undefined ),
                },
            );
            setTargetId(newTargetId);
            notifyTargetIdChange && notifyTargetIdChange(newTargetId, itemId);
        }
    }, [addNewTargetAndChangeItem, notifyTargetIdChange, itemId, name, price, quantity, menuItemId]);

    const selectTargetMenuItem = React.useCallback((targetId: string, newMenuItemId: string) => {
        const menuItem = menuContext[targetId].find(menuItem => menuItem.id === newMenuItemId);
        console.log('@ menuItem: ', menuItem);
        if (menuItem) {
            setName(menuItem.name);
            setPrice(menuItem.price);
            setQuantity(1);
            setTargetId(targetId);
            setMenuItemId(newMenuItemId);
            setPendingTargetId(null);
        }
    }, [menuContext]);

    const onCloseMenuDialog = React.useCallback(() => {
        setPendingTargetId(null);
    }, []);

    React.useEffect(() => {
        if (pendingTargetId) {
            dialogsContext.setupDialog('selectMenuItem', {
                open: pendingTargetId !== null,
                targetId: [pendingTargetId],
                onCloseDialog: onCloseMenuDialog,
                selectTargetMenuItem,
            });
        } else {
            dialogsContext.setupDialog(null, null);
        }
    }, [pendingTargetId, dialogsContext, onCloseMenuDialog, selectTargetMenuItem]);

    console.log(`### order item ${itemId} re-rendering`);

    return (
        <Card variant="outlined" className={classes.card} elevation={3}>
            <div className={classes.imgWrapper}>
                <CardMedia
                    className={cn(
                        classes.dishImage,
                        {
                            [classes.placeholder]: !(refItem && refItem.imageUrl),
                            [classes.unavailableImage]: !(refItem && refItem.enabled),
                        },
                    )}
                    image={(refItem && refItem.imageUrl) || foodPlaceholder}
                    title={name}
                />
                {refItem && itemTarget && (
                    <div className={cn(classes.badge, classes.refBadge)}>
                        {itemTarget.displayName}
                    </div>
                )}
                {refItem && !refItem.enabled && (
                    <div className={cn(classes.badge, classes.unavailableBadge)}>
                        unavailable
                    </div>
                )}
            </div>
            <CardContent className={classes.cardContent}>
                <TextField
                    label="Dish name"
                    variant="filled"
                    value={name}
                    onChange={onChangeName}
                    multiline={true}
                    size="small"
                    className={classes.input}
                    inputProps={(frozen || refItem) ? readonlyProps : undefined}
                />
                <TextField
                    label="Price, ₽"
                    variant="filled"
                    value={price || ''}
                    onChange={onChangePrice}
                    size="small"
                    className={classes.input}
                    inputProps={(frozen || refItem) ? readonlyProps : undefined}
                />
                <NumberTextField
                    label="Quantity"
                    variant="filled"
                    size="small"
                    min={1}
                    value={quantity}
                    onChange={onChangeQuantity}
                    className={classes.input}
                    inputProps={(frozen && !editableQuantity) ? readonlyProps : undefined}
                />
                {frozen
                    ? (
                        <TextField
                            label="From"
                            variant="filled"
                            value={itemTarget ? itemTarget.displayName : ''}
                            size="small"
                            className={classes.input}
                            inputProps={readonlyProps}
                        />
                    ) : (
                        <FreeSelect
                            label="From"
                            options={targetOptions}
                            value={targetId}
                            onChange={onChangeTargetId}
                            className={classes.input}
                            addNewItem={addNewTargetItem}
                        />
                    )
                }
            </CardContent>

            {onClose && (
                <div className={classes.closeIcon}>
                    <Tooltip title="Delete item" aria-label="Delete item">
                        <IconButton onClick={() => onClose(itemId)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            )}
        </Card>
    );
}, function propsAreEqual(prevProps, nextProps) {
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.editableQuantity !== nextProps.editableQuantity &&
        isEqual(prevProps.savedTargets.map(target => target.id), nextProps.savedTargets.map(target => target.id))
    );
});
