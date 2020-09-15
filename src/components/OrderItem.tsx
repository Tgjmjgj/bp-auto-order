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

import { MenuContext } from '../providers/MenuProvider';
import { NumberTextField } from './NumberTextField';
import { FreeSelect } from './FreeSelect'
import { OrderItem as OrderItemData, OrderTarget } from '../../types/autoOrderConfigs';

import foodPlaceholder from '../images/food-placeholder.png';


type Props = {
    item: OrderItemData
    savedTargets: OrderTarget[]
    onClose?: (itemId: string) => void
    addNewTarget?: (newTargetName: string, itemId: string) => void
    onChangeName?: (name: string, itemId: string) => void
    onChangePrice?: (name: number, itemId: string) => void
    onChangeQuantity?: (quantity: number, itemId: string) => void
    onChangeTarget?: (targetId: string, itemId: string) => void
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

export const OrderItem: React.FC<Props> = props => {
    const {
        item,
        savedTargets,
        onClose,
        addNewTarget,
        onChangeName,
        onChangePrice,
        onChangeQuantity,
        onChangeTarget,
    } = props;
    const classes = useStyles();
    const menuState = React.useContext(MenuContext);
    const itemTarget = savedTargets.find(target => target.id === item.target);
    const menu = menuState[item.target];
    const refItem = menu && menu.find(menuItem => menuItem.id === item.ref);

    const targetOptions = savedTargets.map(target => ({
        key: target.id,
        displayValue: target.displayName,
    }));

    const changeName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChangeName) {
            onChangeName(e.target.value, item.id);
        }
    }, [item.id, onChangeName]);

    const changePrice = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChangePrice) {
            const newValue = Number(e.target.value);
            if (!Number.isNaN(newValue)) {
                onChangePrice(newValue, item.id);
            }
        }
    }, [item.id, onChangePrice]);

    const changeQuantity = React.useCallback((value: number) => {
        if (onChangeQuantity) {
            onChangeQuantity(value, item.id);
        }
    }, [item.id, onChangeQuantity]);

    const changeTarget = React.useCallback((targetId: string) => {
        if (onChangeTarget) {
            const foundTarget = savedTargets.find(target => target.id === targetId);
            if (foundTarget) {
                onChangeTarget(foundTarget.id, item.id);
            }
        }
    }, [item.id, savedTargets, onChangeTarget]);

    const addNewTargetItem = React.useCallback((newTargetName: string) => {
        if (addNewTarget && newTargetName) {
            addNewTarget(newTargetName, item.id);
        }
    }, [item.id, addNewTarget]);

    console.log(`### order item ${item.id} re-rendering`);

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
                    title={item.name}
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
                    value={item.name}
                    onChange={changeName}
                    multiline={true}
                    size="small"
                    className={classes.input}
                    inputProps={(onChangeName && !refItem) ? undefined : { readOnly: true }}
                />
                <TextField
                    label="Price, ₽"
                    variant="filled"
                    value={item.price || ''}
                    onChange={changePrice}
                    size="small"
                    className={classes.input}
                    inputProps={(onChangePrice && !refItem) ? undefined : { readOnly: true }}
                />
                <NumberTextField
                    label="Quantity"
                    variant="filled"
                    size="small"
                    min={1}
                    value={item.quantity}
                    onChange={changeQuantity}
                    className={classes.input}
                    inputProps={onChangeQuantity ? undefined : { readOnly: true }}
                />
                {onChangeTarget
                    ? (
                        <FreeSelect
                            label="From"
                            options={targetOptions}
                            value={item.target}
                            onChange={changeTarget}
                            className={classes.input}
                            addNewItem={addNewTargetItem}
                        />
                    ) : (
                        <TextField
                            label="From"
                            variant="filled"
                            value={itemTarget ? itemTarget.displayName : ''}
                            size="small"
                            className={classes.input}
                            inputProps={{
                                readOnly: true,
                            }}
                        />
                    )
                }
            </CardContent>

            {onClose && (
                <div className={classes.closeIcon}>
                    <Tooltip title="Delete item" aria-label="Delete item">
                        <IconButton onClick={() => onClose(item.id)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            )}
        </Card>
    );
};
