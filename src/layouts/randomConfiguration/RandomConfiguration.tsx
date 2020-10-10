import React, { useContext } from 'react';
import cn from 'classnames';
import produce from 'immer';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { ConfigStateContext } from '../../providers/ConfigStateProvider';
import { ThreeValuesSlider } from '../../components/ThreeValueSlider';
import { NumberTextField } from '../../components/NumberTextField';
import { CategoriesBlacklist } from './elements/CategoriesBlacklist';
import { ItemsBlacklist } from './elements/ItemsBlacklist';
import { CategoriesIndividualConfig } from './elements/CategoriesIndividualConfig';
import { ItemsIndividualConfig } from './elements/ItemsIndividualConfig';
import { getI } from '../../utils';

type TargetOption = {
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
        costSlider: {
            marginTop: theme.spacing(4),
            marginBottom: theme.spacing(2),
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
    }),
);

export const RandomConfiguration: React.FC = () => {
    const classes = useStyles();
    const configState = useContext(ConfigStateContext);
    const config = configState.state.randomConfigs.find(cfg => cfg.id === configState.state.selectedConfig);
    const [costValues, setCostValues] = React.useState<[number, number, number]>([270, 300, 340]);

    const onSelectRandomConfig = React.useCallback((e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        configState.updateState(produce(configState.state, state => {
            state.selectedConfig = e.target.value as string;
        }));
    }, [configState]);

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
        if (!config) {
            return [];
        }
        return config.config.selectFromTargets
        .map(targetId => targetsOptions.find(option => option.key === targetId)!);
    }, [config, targetsOptions]);

    const onChangeTotalMinItems = React.useCallback((value: number) => {
        if (!config) {
            return;
        }
        configState.updateState(produce(configState.state, state => {
            const selectedCfg = state.randomConfigs.find(cfg => cfg.id === state.selectedConfig)!;
            selectedCfg.config.total.minItems = value;
        }));
    }, [configState, config]);

    const onSelectedTargetsChange = React.useCallback((e: React.ChangeEvent<{}>, value: TargetOption[]) => {
        if (!value.length) {
            return;
        }
        const configIndex = getI(configState.state.randomConfigs, configState.state.selectedConfig);
        if (configIndex !== -1) {
            configState.updateState(produce(configState.state, state => {
                state.randomConfigs[configIndex].config.selectFromTargets = value.map(option => option.key);
            }));
        }
    }, [configState]);

    const onChangeTotalMaxItems = React.useCallback((value: number) => {
        if (!config) {
            return;
        }
        configState.updateState(produce(configState.state, state => {
            const selectedCfg = state.randomConfigs.find(cfg => cfg.id === state.selectedConfig)!;
            selectedCfg.config.total.maxItems = value;
        }));
    }, [configState, config]);

    return (
        <Grid container spacing={4} direction="column">
            <Grid item className={classes.gridRow}>
                <Typography className={classes.label}>
                    Selected Configuration:
                </Typography>
                <Select
                    value={configState.state.selectedConfig}
                    onChange={onSelectRandomConfig}
                >
                    {configOptions}
                </Select>
            </Grid>
            <Divider />
            {config && (
                <>
                    <Grid item className={classes.gridRow}>
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
                    </Grid>
                    <Grid item>
                        <ThreeValuesSlider
                            className={classes.costSlider}
                            values={costValues}
                            setValues={setCostValues}
                            start={0}
                            end={500}
                        />
                        <Typography align="center">
                            Acceptable cost
                        </Typography>
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
                                value={config.config.total.minItems}
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
                                value={config.config.total.maxItems}
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
    );
};
