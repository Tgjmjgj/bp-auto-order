import React, { useContext } from 'react';
import cn from 'classnames';
import produce from 'immer';
import cloneDeep from 'lodash/cloneDeep';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { ConfigStateContext, ConfigUpdateContext } from '../../providers/ConfigStateProvider';
import { NumberTextField } from '../../components/NumberTextField';
import { CategoriesBlacklist } from './elements/CategoriesBlacklist';
import { ItemsBlacklist } from './elements/ItemsBlacklist';
import { CategoriesIndividualConfig } from './elements/CategoriesIndividualConfig';
import { ItemsIndividualConfig } from './elements/ItemsIndividualConfig';
import { NewConfigData, NewConfigDialog } from './elements/NewConfigDialog';
import { CostSlider } from './elements/CostSlider';

import { defaultEmptyRandomConfigData } from '../../initData';
import { getI, randomId } from '../../utils';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

type TargetOption = {
    value: string
    key: string
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        controlRow: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        gridRow: {
            display: 'flex',
            alignItems: 'flex-end',
            height: 80,
        },
        newConfigButton: {
            transition: 'color .2s ease-out, border-color .2s ease-out, background-color .2s ease-out',
            '&:hover': {
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                backgroundColor: 'rgb(22, 2, 232, .04)',
            },
        },
        deleteConfigButton: {
            marginBottom: -6,
            marginLeft: theme.spacing(2),
            transition: 'color .2s ease-out',
            '&:hover': {
                color: theme.palette.secondary.dark,
            },
        },
        sectionContainer: {
            flexFlow: 'row nowrap',
            [theme.breakpoints.down('sm')]: {
                flexFlow: 'column nowrap',
                alignItems: 'flex-start'
            },
        },
        label: {
            marginRight: 20,
        },
        selectedTargets: {
            minWidth: 300,
        },
        headerRowTitle: {
            marginRight: theme.spacing(5),
        },
        rowTextField: {
            margin: theme.spacing(0, 2),
            width: 50,
            '& input': {
                textAlign: 'center',
                paddingBottom: 2,
            },
        },
        blacklist: {
            height: 400,
            maxWidth: 600,
        },
        labelSwitch: {
            marginLeft: 0,
        },
    }),
);

export const RandomConfiguration: React.FC = () => {
    const classes = useStyles();
    const configState = useContext(ConfigStateContext);
    const updateConfig = useContext(ConfigUpdateContext);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const uniqDialogIdRef = React.useRef('random-configuration-dialog-' + randomId());

    const selectedConfigIndex = getI(configState.state.randomConfigs, configState.state.selectedConfig);
    const detectTargetAuto = selectedConfigIndex !== -1 &&
        configState.state.randomConfigs[selectedConfigIndex].config.autoDetectTarget

    const toggleDetectTargetAuto = React.useCallback(() => {
        if (selectedConfigIndex === -1) {
            return
        }
        updateConfig(oldState => produce(oldState, state => {
            state.randomConfigs[selectedConfigIndex].config.autoDetectTarget = 
                !state.randomConfigs[selectedConfigIndex].config.autoDetectTarget
        }))
    }, [selectedConfigIndex, updateConfig])

    const allowDelete = React.useMemo(() => configState.state.randomConfigs.length > 1, [configState]);

    const onNewConfigClick = React.useCallback(() => setDialogOpen(true), []);

    const onCloseNewConfigDialog = React.useCallback((newConfigData: NewConfigData | null) => {
        setDialogOpen(false);
        if (!newConfigData || selectedConfigIndex === -1) {
            return;
        }
        updateConfig(oldState => produce(oldState, state => {
            const newConfigId = randomId();
            const currentlySelectedConfig = state.randomConfigs[selectedConfigIndex]
            if (newConfigData.useCurrentAsTemplate && currentlySelectedConfig) {
                state.randomConfigs.push({
                    id: newConfigId,
                    name: newConfigData.name,
                    config: cloneDeep(currentlySelectedConfig.config),
                });
            } else {
                state.randomConfigs.push({
                    id: newConfigId,
                    name: newConfigData.name,
                    config: cloneDeep(defaultEmptyRandomConfigData),
                });
            }
            state.selectedConfig = newConfigId;
        }));
    }, [selectedConfigIndex, updateConfig]);

    const onDeleteConfigClick = React.useCallback(() => setShowDeleteDialog(true), []);

    const onCloseDeleteConfigDialog = React.useCallback(() => setShowDeleteDialog(false), []);

    const onDeleteDialogSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowDeleteDialog(false);
        if (selectedConfigIndex === -1) {
            return
        }
        updateConfig(oldConfig => produce(oldConfig, state => {
            if (state.randomConfigs.length < 2) {
                return;
            }
            state.randomConfigs.splice(selectedConfigIndex, 1);
            state.selectedConfig = state.randomConfigs[state.randomConfigs.length - 1].id;
        }));
    }, [selectedConfigIndex, updateConfig]);

    const onSelectRandomConfig = React.useCallback((e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        updateConfig(oldState => produce(oldState, state => {
            state.selectedConfig = e.target.value as string;
        }));
    }, [updateConfig]);

    const configOptions = React.useMemo(() => {
        return configState.state.randomConfigs.map(randomConfig => {
            return (
                <MenuItem value={randomConfig.id} key={randomConfig.id}>
                    {randomConfig.name}
                </MenuItem>
            );
        });
    }, [configState]);

    const targetsOptions = React.useMemo<TargetOption[]>(() => {
        return configState.state.savedTargets
        .filter(target => target.isSystem)
        .map(target => ({
            value: target.displayName,
            key: target.id,
        }));
    }, [configState]);

    const selectedTargetOptions = React.useMemo<TargetOption[]>(() => {
        if (selectedConfigIndex === -1) {
            return [];
        }
        const config = configState.state.randomConfigs[selectedConfigIndex];
        return config.config.selectFromTargets
        .map(targetId => targetsOptions.find(option => option.key === targetId)!);
    }, [configState, selectedConfigIndex, targetsOptions]);

    const onChangeTotalMinItems = React.useCallback((value: number) => {
        if (selectedConfigIndex === -1) {
            return
        }
        updateConfig(oldState => produce(oldState, state => {
            const selectedCfg = state.randomConfigs[selectedConfigIndex];
            selectedCfg.config.total.minItems = value;
        }));
    }, [selectedConfigIndex, updateConfig]);

    const onSelectedTargetsChange = React.useCallback((e: React.ChangeEvent<{}>, value: TargetOption[]) => {
        if (!value.length || selectedConfigIndex === -1) {
            return;
        }
        updateConfig(oldState => produce(oldState, state => {
            state.randomConfigs[selectedConfigIndex].config.selectFromTargets = value.map(option => option.key);
        }));
    }, [selectedConfigIndex, updateConfig]);

    const onChangeTotalMaxItems = React.useCallback((value: number) => {
        if (selectedConfigIndex === -1) {
            return
        }
        updateConfig(oldState => produce(oldState, state => {
            state.randomConfigs[selectedConfigIndex].config.total.maxItems = value;
        }));
    }, [selectedConfigIndex, updateConfig]);

    return (
        <>
            <Grid container spacing={4} direction="column">
                <Grid item className={classes.controlRow}>
                    <div className={classes.gridRow}>
                        <Typography className={classes.label}>
                            Selected Configuration:
                        </Typography>
                        <Select
                            value={configState.state.selectedConfig}
                            onChange={onSelectRandomConfig}
                        >
                            {configOptions}
                        </Select>
                    </div>
                    <div className={classes.gridRow}>
                        <Button
                            variant="outlined"
                            className={classes.newConfigButton}
                            onClick={onNewConfigClick}
                        >
                            Create new configuration preset
                        </Button>
                        { allowDelete && (
                            <Tooltip arrow title="Delete Config" aria-label="Delete Config">
                                <IconButton className={classes.deleteConfigButton} onClick={onDeleteConfigClick}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                </Grid>
                <Divider />
                {selectedConfigIndex !== -1 && (
                    <>
                        <Grid item className={classes.gridRow}>
                            <FormControlLabel
                                label="Detect target automatically: "
                                labelPlacement="start"
                                className={classes.labelSwitch}
                                control={
                                    <Switch
                                        color="primary"
                                        size="medium"
                                        checked={detectTargetAuto}
                                        onChange={toggleDetectTargetAuto}
                                    />
                                }
                            />
                            {!detectTargetAuto && (
                                <>
                                    <Typography className={classes.label}>
                                        Mix from these menus:
                                    </Typography>
                                    <Autocomplete
                                        multiple
                                        disableClearable={true}
                                        value={selectedTargetOptions}
                                        onChange={onSelectedTargetsChange}
                                        className={classes.selectedTargets}
                                        options={targetsOptions}
                                        getOptionLabel={preset => preset.value}
                                        getOptionSelected={(opt1, opt2) => opt1.key === opt2.key}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="standard"
                                                placeholder="Menus"
                                            />
                                        )}
                                        renderTags={(options, getTagProps) =>
                                            options.map((option, i) => (
                                                <Chip
                                                    label={option.value}
                                                    {...getTagProps({ index: i })}
                                                    {...(options.length > 1 ? undefined : { onDelete: undefined })}
                                                />
                                            ))
                                        }
                                    />
                                </>
                            )}
                        </Grid>
                        <Grid item>
                            <CostSlider />
                        </Grid>
                        <Grid item className={cn(classes.gridRow, classes.sectionContainer)}>
                            <div className={classes.gridRow}>
                                <Typography className={classes.headerRowTitle}>
                                    Number of dishes:
                                </Typography>
                            </div>
                            <div className={classes.gridRow}>
                                <Typography>
                                    from
                                </Typography>
                                <NumberTextField
                                    value={configState.state.randomConfigs[selectedConfigIndex].config.total.minItems}
                                    onChange={onChangeTotalMinItems}
                                    className={classes.rowTextField}
                                    size="small"
                                    placeholder="Minimal number"
                                />
                            </div>
                            <div className={classes.gridRow}>
                                <Typography>
                                    up to
                                </Typography>
                                <NumberTextField
                                    value={configState.state.randomConfigs[selectedConfigIndex].config.total.maxItems}
                                    onChange={onChangeTotalMaxItems}
                                    className={classes.rowTextField}
                                    size="small"
                                    placeholder="Maximal number"
                                />
                            </div>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item md={6} xs={12}>
                                <CategoriesBlacklist className={classes.blacklist} />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <ItemsBlacklist className={classes.blacklist} />
                            </Grid>
                        </Grid>
                        <Grid item>
                            <CategoriesIndividualConfig />
                        </Grid>
                        <Grid item>
                            <ItemsIndividualConfig />
                        </Grid>
                    </>
                )}
            </Grid>

            { dialogOpen && (
                <NewConfigDialog
                    onClose={onCloseNewConfigDialog}
                />
            )}
            
            { selectedConfigIndex !== -1 && (
                <Dialog open={showDeleteDialog} onClose={onCloseDeleteConfigDialog} aria-labelledby={uniqDialogIdRef.current}>
                    <form onSubmit={onDeleteDialogSubmit}>
                        <DialogTitle id={uniqDialogIdRef.current}>
                            {`Delete "${configState.state.randomConfigs[selectedConfigIndex].name}" random config?`}
                        </DialogTitle>
                        <DialogActions>
                            <Button onClick={onCloseDeleteConfigDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" color="secondary">
                                Delete
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            )}
        </>
    );
};
