import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';

import { ConfigStateContext } from '../ConfigStateProvider';
import { OrderPreset } from '../components/OrderPreset';
import { OrderPreset as OrderPresetData } from '../ConfigStateProvider';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        iconGroup: {
            margin: theme.spacing(1),
        },
        divider: {
            marginBottom: theme.spacing(2),
        },
        newPresetButton: {
            marginTop: theme.spacing(4),
            transition: 'color .2s ease-out, border-color .2s ease-out, background-color .2s ease-out',
            '&:hover': {
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                backgroundColor: 'rgb(22, 2, 232, .04)',
            },
        },
    })
);

export const PresetsScreen: React.FC = () => {
    const configState = React.useContext(ConfigStateContext);
    const [open, toggleOpen] = React.useState<number | null>(null);
    const uniqDialogIdRef = React.useRef('delete-preset-dialog-' + btoa(Math.random().toString()).substring(0, 12))
    const classes = useStyles();
    const presets = configState.state.presets;

    const getNewEmptyPreset = React.useCallback((): OrderPresetData => {
        const nameIndex = Math.max(
            1,
            ...(presets
                .map(preset => preset.name)
                .filter(name => name.match(/^New Preset \d+$/))
                .map(name => Number(name.match(/^New Preset (\d+)$/)![1])))
        );
        return {
            name: 'New Preset ' + nameIndex,
            items: [
                { name: '', quantity: 1, price: 0, target: '' },
            ],
        };
    }, [presets]);

    const addPreset = React.useCallback(() => {
        configState.updateState({
            presets: [
                ...presets,
                getNewEmptyPreset(),
            ],
        });
    }, [presets, getNewEmptyPreset, configState]);

    const deletePreset = React.useCallback(() => {
        if (open !== null) {
            configState.updateState({
                presets: [
                    ...configState.state.presets.slice(0, open),
                    ...configState.state.presets.slice(open + 1, configState.state.presets.length),
                ],
            });
        }
    }, [open, configState]);

    const onCloseDialog = React.useCallback(() => toggleOpen(null), []);

    const onSubmitDialog = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        deletePreset();
        onCloseDialog();
    }, [deletePreset, onCloseDialog]);

    const presetsUi = React.useMemo(() => presets.map((preset, i) => {
        return (
            <React.Fragment key={i}>
                <OrderPreset
                    presetIndex={i}
                    deletePreset={() => toggleOpen(i)}
                />
                {(i !== presets.length - 1) && (
                    <Divider className={classes.divider} />
                )}
            </React.Fragment>
        );
    }), [presets, classes.divider]);

    return (
        <>
            <Grid container spacing={4} direction="column">
                <Grid item>
                    <Divider className={classes.divider} />
                    <Typography variant="h5" gutterBottom align="center">
                        Order Presets
                    </Typography>
                    {presetsUi}
                    <Button
                        variant="outlined"
                        onClick={addPreset}
                        className={classes.newPresetButton}
                    >
                        New preset
                    </Button>
                </Grid>
            </Grid>

            <Dialog open={open !== null} onClose={onCloseDialog} aria-labelledby={uniqDialogIdRef.current}>
                <form onSubmit={onSubmitDialog}>
                    <DialogTitle id={uniqDialogIdRef.current}>
                        {`Delete "${presets[open!] ? presets[open!].name : ''}" preset?`}
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={onCloseDialog}>
                            Cancel
                        </Button>
                        <Button type="submit" color="secondary">
                            Delete
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};
