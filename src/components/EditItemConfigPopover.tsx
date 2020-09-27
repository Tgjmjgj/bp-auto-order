import React from 'react';
import cn from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Popover, { PopoverProps } from '@material-ui/core/Popover';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';

import { ItemConfig } from './IndividualItemConfig';
import { NumberTextField } from './NumberTextField';

interface Props extends Omit<PopoverProps, 'onClose'> {
    item: ItemConfig
    onClose: (itemConfig: ItemConfig) => void
};

const fpRegexp = /^(\d+(?:\.\d*)?)?$/;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        popover: {
            padding: theme.spacing(1),
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'center',
        },
        header: {
            padding: theme.spacing(0, 2, 0.5, 2),
        },
        divider: {
            width: '100%',
        },
        contentGrid: {
            displat: 'flex',
            flexFlow: 'column nowrap',
            padding: theme.spacing(1, 2, 0, 2),
        },
        row: {
            display: 'flex',
            flexFlow: 'row nowrap',
            margin: '2px 0',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        weightLabel: {
            marginRight: theme.spacing(2),
            marginLeft: theme.spacing(6),
        },
        disabledField: {
            backgroundColor: 'rgba(0,0,0,.09)',
        },
        formField: {
            maxWidth: 60,
        },
    }),
);

export const EditItemConfigPopover: React.FC<Props> = props => {
    const { item, className, onClose, ...rest } = props;
    const classes = useStyles();
    const [weight, setWeight] = React.useState<string>(String(item.weight));
    const [enableMinItems, setEnableMinItems] = React.useState<boolean>(item.minItems !== undefined);
    const [enableMaxItems, setEnableMaxItems] = React.useState<boolean>(item.maxItems !== undefined);
    const [minItems, setMinItems] = React.useState<number>(item.minItems === undefined ? 0 : item.minItems);
    const [maxItems, setMaxItems] = React.useState<number>(item.maxItems === undefined ? 5 : item.maxItems);

    const changeWeight = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (fpRegexp.test(event.target.value)) {
            setWeight(event.target.value);
        }
    }, []);

    const toggleMinItems = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => setEnableMinItems(event.target.checked), []);
    const toggleMaxItems = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => setEnableMaxItems(event.target.checked), []);

    const changeMinItems = React.useCallback((value: number) => setMinItems(value), []);
    const changeMaxItems = React.useCallback((value: number) => setMaxItems(value), []);

    const handleClose = React.useCallback(() => {
        let weightNum = Number(weight === '' ? undefined : weight[weight.length - 1] === '.' ? weight + '0' : weight);
        onClose({
            itemId: item.itemId,
            name: item.name,
            targetId: item.targetId,
            weight: isNaN(weightNum) ? item.weight : weightNum,
            minItems: enableMinItems ? minItems : undefined,
            maxItems: enableMaxItems ? maxItems : undefined,
        });
    }, [onClose, item, weight, minItems, maxItems, enableMinItems, enableMaxItems]);

    return (
        <Popover
            onClose={handleClose}
            {...rest}
        >
            <div className={cn(classes.popover, className)}>
                <Typography align="center" className={classes.header}>
                    {item.name}
                </Typography>
                <Divider className={classes.divider} />
                <Grid container className={classes.contentGrid}>
                    <Grid item className={classes.row}>
                        <Typography className={classes.weightLabel}>
                            Weight:
                        </Typography>
                        <TextField
                            size="small"
                            value={weight}
                            onChange={changeWeight}
                            className={classes.formField}
                        />
                    </Grid>
                    <Grid item className={classes.row}>
                        <FormControlLabel
                            label="Minimum:"
                            labelPlacement="end"
                            control={
                                <Switch
                                    color="primary"
                                    checked={enableMinItems}
                                    onChange={toggleMinItems}
                                />
                            }
                        />
                        <NumberTextField
                            size="small"
                            value={minItems}
                            onChange={changeMinItems}
                            disabled={!enableMinItems}
                            className={cn(
                                classes.formField,
                                { [classes.disabledField]: !enableMinItems },
                            )}
                        />
                    </Grid>
                    <Grid item className={classes.row}>
                        <FormControlLabel
                            label="Maximum:"
                            labelPlacement="end"
                            control={
                                <Switch
                                    color="primary"
                                    checked={enableMaxItems}
                                    onChange={toggleMaxItems}
                                />
                            }
                        />
                        <NumberTextField
                            size="small"
                            value={maxItems}
                            onChange={changeMaxItems}
                            disabled={!enableMaxItems}
                            className={cn(
                                classes.formField,
                                { [classes.disabledField]: !enableMaxItems },
                            )}
                        />
                    </Grid>
                </Grid>
                <Tooltip
                    arrow
                    title="Ok"
                    aria-label="Ok"
                    placement="right"
                >
                    <IconButton
                        size="small"
                        onClick={handleClose}
                    >
                        <CheckIcon />
                    </IconButton>
                </Tooltip>
            </div>
        </Popover>
    );
};
