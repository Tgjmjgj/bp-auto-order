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
import { OrderPreset as OrderPresetData } from '../../types/autoOrderConfigs';
import { randomId, getI } from '../utils';

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
    const [presetIdForDeletion, setPresetIdForDeletion] = React.useState<string | null>(null);  // also used to determine when to show "Delete preset" dialog
    const uniqDialogIdRef = React.useRef('delete-preset-dialog-' + randomId())
    const classes = useStyles();
    const presets = configState.state.presets;

    const getNewEmptyPreset = React.useCallback((): OrderPresetData => {
        const nameIndex = 1 + Math.max(
            0,
            ...(presets
                .map(preset => preset.name)
                .filter(name => name.match(/^New Preset \d+$/))
                .map(name => Number(name.match(/^New Preset (\d+)$/)![1])))
        );
        return {
            id: randomId(),
            name: 'New Preset ' + nameIndex,
            items: [
                { id: randomId(), name: '', quantity: 1, price: 0, target: '' },
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
        if (presetIdForDeletion !== null) {
            const delIndex = getI(configState.state.presets, presetIdForDeletion);
            if (delIndex !== -1) {
                const updatedPresets = [
                    ...configState.state.presets.slice(0, delIndex),
                    ...configState.state.presets.slice(delIndex + 1, configState.state.presets.length),
                ];
                const updatedSelectedPresets = configState.state.selectedPresets.filter(presetId => presetId !== presetIdForDeletion);
                if (!updatedSelectedPresets.length) {
                    updatedSelectedPresets.push(updatedPresets[0].id);
                }
                configState.updateState({
                    presets: updatedPresets,
                    selectedPresets: updatedSelectedPresets,
                });
            }
        }
    }, [presetIdForDeletion, configState]);

    const deletingPresetName = React.useMemo(() => {
        const preset = configState.state.presets.find(preset => preset.id === presetIdForDeletion);
        return preset ? preset.name : null;
    }, [presetIdForDeletion, configState]);

    const onCloseDialog = React.useCallback(() => setPresetIdForDeletion(null), []);

    const onSubmitDialog = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        deletePreset();
        onCloseDialog();
    }, [deletePreset, onCloseDialog]);

    const presetsUi = presets.map((preset, i) => {
        return (
            <React.Fragment key={preset.id}>
                <OrderPreset
                    presetId={preset.id}
                    deletePreset={() => setPresetIdForDeletion(preset.id)}
                    allowDelete={presets.length > 1}
                />
                {(i !== presets.length - 1) && (
                    <Divider className={classes.divider} />
                )}
            </React.Fragment>
        );
    });

    return (
        <>
            <Grid container spacing={4} direction="column">
                <Grid item>
                    <Typography variant="h5" gutterBottom align="center">
                        Order Presets
                    </Typography>
                    { presetsUi }
                    <Button
                        variant="outlined"
                        onClick={addPreset}
                        className={classes.newPresetButton}
                    >
                        New preset
                    </Button>
                </Grid>
            </Grid>

            <Dialog open={presetIdForDeletion !== null} onClose={onCloseDialog} aria-labelledby={uniqDialogIdRef.current}>
                <form onSubmit={onSubmitDialog}>
                    <DialogTitle id={uniqDialogIdRef.current}>
                        {`Delete ${deletingPresetName ? `"${deletingPresetName}"` : 'this'} preset?`}
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
