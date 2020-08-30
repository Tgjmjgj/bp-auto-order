import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { ConfigStateContext } from '../providers/ConfigStateProvider';
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
        label: {
            marginRight: 20,
        },
        selectedPresets: {
            minWidth: 300,
        },
    }),
);

const autoOrderModeOptions: AutoOrderOption[] = [
    { key: 'preset', displayName: 'Presets' },
    { key: 'random', displayName: 'Random' },
];

export const MainOptions: React.FC = () => {
    const configState = React.useContext(ConfigStateContext);
    const [selectedPresets, setSelectedPresets] = React.useState<PresetOption[]>(() => {
        return configState.state.selectedPresets.map(presetId => {
            const realPreset = configState.state.presets.find(preset => preset.id === presetId);
            return realPreset ? { key: presetId, value: realPreset.name } : null;
        }).filter(option => option) as PresetOption[];
    });
    const classes = useStyles();
    const customName = configState.state.customName;
    const mode = configState.state.mode;

    React.useEffect(() => {
        const realPresetIds = configState.state.presets.map(preset => preset.id);
        const goodIds = configState.state.selectedPresets.filter(presetId => realPresetIds.includes(presetId));
        if (goodIds.length < configState.state.selectedPresets.length) {
            configState.updateState({
                selectedPresets: goodIds,
            });
        }
    }, []); // eslint-disable-line

    const presetsOptions = React.useMemo<PresetOption[]>(() => configState.state.presets.map(preset => {
        return {
            value: preset.name,
            key: preset.id,
        };
    }), [configState]);

    const changeCustomName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        configState.updateState({customName: e.target.value});
    }, [configState]);

    const changeMode = React.useCallback((e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        configState.updateState({mode: e.target.value as AutoOrderMode});
    }, [configState]);

    const onSelectedPresetsChange = React.useCallback((e: React.ChangeEvent<{}>, value: PresetOption[]) => {
        if (value.length) {
            setSelectedPresets(value);
            configState.updateState({
                selectedPresets: value.map(option => option.key),
            });
        }
    }, [configState]);

    const modeOptions = React.useMemo(() => autoOrderModeOptions.map(option => {
        return (
            <MenuItem value={option.key} key={option.key}>
                {option.displayName}
            </MenuItem>
        );
    }), []);

    return (
        <Grid container spacing={4} direction="column">
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
    );
};
