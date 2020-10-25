import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';

import { ConfigStateContext, ConfigUpdateContext } from '../providers/ConfigStateProvider';
import { OrderPreset } from '../components/OrderPreset';
import { randomId, getI } from '../utils';
import produce from 'immer';

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
    }),
);

export const PresetsScreen: React.FC = () => {
    const configState = React.useContext(ConfigStateContext);
    const updateConfig = React.useContext(ConfigUpdateContext);
    // also used to determine when to show "Delete preset" dialog
    const [presetIdForDeletion, setPresetIdForDeletion] = React.useState<string | null>(null);
    const uniqDialogIdRef = React.useRef('delete-preset-dialog-' + randomId())
    const classes = useStyles();
    const presets = configState.state.presets;

    const addPreset = React.useCallback(() => {
        updateConfig(oldState => produce(oldState, state => {
            const nameIndex = 1 + Math.max(
                0,
                ...(state.presets
                    .map(preset => preset.name)
                    .filter(name => name.match(/^New Preset \d+$/))
                    .map(name => Number(name.match(/^New Preset (\d+)$/)![1])))
            );
            const newPreset = {
                id: randomId(),
                name: 'New Preset ' + nameIndex,
                items: [
                    { id: randomId(), name: '', quantity: 1, price: 0, targetId: '' },
                ],
            }
            state.presets.push(newPreset);
        }));
    }, [updateConfig]);

    const deletePreset = React.useCallback(() => {
        if (presetIdForDeletion === null) {
            return;
        }
        updateConfig(oldState => produce(oldState, state => {
            const delIndex = getI(state.presets, presetIdForDeletion);
            if (delIndex === -1) {
                return;
            }
            state.presets.splice(delIndex, 1);
            state.selectedPresets = state.selectedPresets.filter(presetId => presetId !== presetIdForDeletion);
            if (!state.selectedPresets.length) {
                state.selectedPresets.push(state.presets[0].id);
            }
        }));
    }, [presetIdForDeletion, updateConfig]);

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
