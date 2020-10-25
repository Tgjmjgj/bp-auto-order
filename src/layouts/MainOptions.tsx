import React from 'react';
import cn from 'classnames';
import produce from 'immer';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { ConfigStateContext, ConfigUpdateContext } from '../providers/ConfigStateProvider';
import { NotificationContext } from '../providers/NotificationProvider';
import { TimeUntilNextOrder } from '../components/TimeUntilNextOrder';
import { AutoOrderMode } from '../../types/autoOrderConfigs';

type AutoOrderOption = {
    key: AutoOrderMode
    displayName: string
};

type PresetOption = {
    value: string
    key: string
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gridRow: {
            display: 'flex',
            alignItems: 'flex-end',
            height: 80,
        },
        gridRowSwitch: {
            paddingBottom: '4px !important',
        },
        label: {
            marginRight: 20,
        },
        labelSwitch: {
            marginLeft: 0,
        },
        selectedPresets: {
            minWidth: 300,
        },
        timeUponLabel: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(3),
        },
        mainSwitch: {
            '& .MuiIconButton-label': {
                color: '#FB5E5E',
            },
            '& .Mui-checked .MuiIconButton-label': {
                color: '#009FFF',
            },
        },
    }),
);

const autoOrderModeOptions: AutoOrderOption[] = [
    { key: 'preset', displayName: 'Presets' },
    { key: 'random', displayName: 'Random' },
];

export const MainOptions: React.FC = () => {
    const classes = useStyles();
    const configState = React.useContext(ConfigStateContext);
    const updateConfig = React.useContext(ConfigUpdateContext);
    const { pushNotification } = React.useContext(NotificationContext);
    const [selectedPresets, setSelectedPresets] = React.useState<PresetOption[]>(() => {
        return configState.state.selectedPresets.map(presetId => {
            const realPreset = configState.state.presets.find(preset => preset.id === presetId);
            return realPreset ? { key: presetId, value: realPreset.name } : null;
        }).filter(option => option) as PresetOption[];
    });
    const customName = configState.state.customName;
    const mode = configState.state.mode;
    const enabled = configState.state.enabled;

    React.useEffect(() => {
        pushNotification({
            children: (
                <>
                    <span className={classes.timeUponLabel}>
                        Time until the next order:
                    </span>
                    {enabled
                        ? <TimeUntilNextOrder />
                        : <span>--------</span>
                    }
                </>
            ),
            icon: <div />,
            severity: 'info',
        });
        return () => pushNotification(null);
    }, [pushNotification, enabled, classes.timeUponLabel]);

    const toggleEnabled = React.useCallback(() => {
        updateConfig({ enabled: !enabled });
    }, [updateConfig, enabled]);

    React.useEffect(() => {
        updateConfig(oldState => produce(oldState, state => {
            const realPresetIds = state.presets.map(preset => preset.id);
            const goodIds = state.selectedPresets.filter(presetId => realPresetIds.includes(presetId));
            if (goodIds.length === state.selectedPresets.length) {
                return;
            }
            state.selectedPresets = goodIds;
        }));
    }, [updateConfig]);

    const presetsOptions = React.useMemo<PresetOption[]>(() => configState.state.presets.map(preset => {
        return {
            value: preset.name,
            key: preset.id,
        };
    }), [configState]);

    const changeCustomName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateConfig({ customName: e.target.value });
    }, [updateConfig]);

    const changeMode = React.useCallback((e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        updateConfig({ mode: e.target.value as AutoOrderMode });
    }, [updateConfig]);

    const onSelectedPresetsChange = React.useCallback((e: React.ChangeEvent<{}>, value: PresetOption[]) => {
        if (value.length) {
            setSelectedPresets(value);
            updateConfig({
                selectedPresets: value.map(option => option.key),
            });
        }
    }, [updateConfig]);

    const modeOptions = React.useMemo(() => autoOrderModeOptions.map(option => {
        return (
            <MenuItem value={option.key} key={option.key}>
                {option.displayName}
            </MenuItem>
        );
    }), []);

    return (
        <>
            <Grid container spacing={4} direction="column">
                <Grid item className={cn(classes.gridRow, classes.gridRowSwitch)}>
                    <FormControlLabel
                        label="Auto ordering: "
                        labelPlacement="start"
                        className={classes.labelSwitch}
                        control={
                            <Switch
                                className={classes.mainSwitch}
                                color="primary"
                                size="medium"
                                checked={enabled}
                                onChange={toggleEnabled}
                            />
                        }
                    />
                </Grid>
                <Grid item className={classes.gridRow}>
                    <Typography className={classes.label}>
                        Custom display name:
                    </Typography>
                    <TextField
                        value={customName || ''}
                        onChange={changeCustomName}
                    />
                </Grid>
                <Grid item className={classes.gridRow}>
                    <Typography className={classes.label}>
                        Mode:
                    </Typography>
                    <Select
                        value={mode}
                        onChange={changeMode}
                    >
                        { modeOptions }
                    </Select>
                </Grid>
                { mode === 'preset' && (
                    <Grid item className={classes.gridRow}>
                        <Typography className={classes.label}>
                            Random selection from these presets:
                        </Typography>
                        <Autocomplete
                            multiple
                            disableClearable={true}
                            value={selectedPresets}
                            onChange={onSelectedPresetsChange}
                            className={classes.selectedPresets}
                            options={presetsOptions}
                            getOptionLabel={preset => preset.value}
                            getOptionSelected={(opt1, opt2) => opt1.key === opt2.key}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    placeholder="Presets"
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
                    </Grid>
                )}
            </Grid>
        </>
    );
};
