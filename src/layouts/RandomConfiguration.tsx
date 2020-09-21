import React, { useContext } from 'react';
import cn from 'classnames';
import produce from 'immer';
import groupBy from 'lodash/groupBy';
import isEqual from 'lodash/isEqual';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { ConfigStateContext, pseudoIdPrefix } from '../providers/ConfigStateProvider';
import { MenuContext } from '../providers/MenuProvider';
import { ThreeValuesSlider } from '../components/ThreeValueSlider';
import { NumberTextField } from '../components/NumberTextField';
import { ItemsSubsetList, SelectedMenuItem } from '../components/ItemsSubsetList';
import { getI } from '../utils';

type TargetOption = {
    value: string
    key: string
};

const defaultItemConfig = {
    weight: 1,
    minItems: undefined,
    maxItems: undefined,
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
    const menuState = useContext(MenuContext);
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
        if (config) {
            configState.updateState(produce(configState.state, state => {
                const selectedCfg = state.randomConfigs.find(cfg => cfg.id === state.selectedConfig)!;
                selectedCfg.config.total.minItems = value;
            }));
        }
    }, [configState, config]);

    const onSelectedTargetsChange = React.useCallback((e: React.ChangeEvent<{}>, value: TargetOption[]) => {
        if (value.length) {
            const configIndex = getI(configState.state.randomConfigs, configState.state.selectedConfig);
            if (configIndex !== -1) {
                configState.updateState(produce(configState.state, state => {
                    state.randomConfigs[configIndex].config.selectFromTargets = value.map(option => option.key);
                }));
            }
        }
    }, [configState]);

    const onChangeTotalMaxItems = React.useCallback((value: number) => {
        if (config) {
            configState.updateState(produce(configState.state, state => {
                const selectedCfg = state.randomConfigs.find(cfg => cfg.id === state.selectedConfig)!;
                selectedCfg.config.total.maxItems = value;
            }));
        }
    }, [configState, config]);

    const configCategoriesBlacklist = React.useMemo(() => {
        if (config) {
            return config.config.selectFromTargets.reduce<SelectedMenuItem[]>((all, targetId) => {
                const targetCategories = config.config.targetsData[targetId].categories;
                all.push(
                    ...Object.entries(targetCategories)
                    .filter(([categoryName, categoryConfig]) => {
                        return categoryConfig.maxItems === 0 || categoryConfig.weight === 0;
                    }).map<SelectedMenuItem>(([categoryName]) => ({
                        id: `${targetId}_${categoryName}`,
                        name: categoryName,
                        targetId,
                    })),
                );
                return all;
            }, []);
        }
        return [];
    }, [config]);

    const configItemsBlacklist = React.useMemo(() => {
        if (config) {
            return config.config.selectFromTargets.reduce<SelectedMenuItem[]>((all, targetId) => {
                const targetItems = config.config.targetsData[targetId].items;
                const targetMenu = menuState[targetId];
                if (targetMenu && targetMenu.length) {
                    all.push(
                        ...Object.entries(targetItems)
                        .filter(([itemId, itemConfig]) => {
                            return (itemConfig.maxItems === 0 || itemConfig.weight === 0) && !itemId.startsWith(pseudoIdPrefix);
                        }).map<SelectedMenuItem>(([itemId]) => {
                            const menuItem = targetMenu.find(item => item.id === itemId);
                            return {
                                id: itemId,
                                name: menuItem ? menuItem.name : '',
                                // secondary: menuItem ? menuItem.category : '',
                                targetId,
                            };
                        }),
                    );
                }
                return all;
            }, []);
        }
        return [];
    }, [config, menuState]);

    const blacklistSetterBuilder = React.useCallback((variant: 'categories' | 'items') => {
        return (selection: SelectedMenuItem[]) => {
            if (config) {
                configState.updateState(produce(configState.state, state => {
                    const selectedCfg = state.randomConfigs.find(cfg => cfg.id === state.selectedConfig);
                    if (selectedCfg) {
                        // remove all blacklist items
                        Object.entries(selectedCfg.config.targetsData).forEach(([targetId, targetCfg]) => {
                            if (!config.config.selectFromTargets.includes(targetId)) {
                                return;
                            }
                            Object.entries(targetCfg[variant]).forEach(([key, itemsCfg]) => {
                                if (variant === 'items' && key.startsWith(pseudoIdPrefix)) {
                                    return;
                                }
                                if (itemsCfg.maxItems === 0) {
                                    delete itemsCfg.maxItems;
                                }
                                if (itemsCfg.weight === 0) {
                                    itemsCfg.weight = defaultItemConfig.weight;
                                }
                                if (isEqual(itemsCfg, defaultItemConfig)) {
                                    delete targetCfg[variant][key];
                                }
                            });
                        });
                        // set new blacklist items
                        Object.entries(groupBy(selection, 'targetId')).forEach(([targetId, selected]) => {
                            const targetConfigs = selectedCfg.config.targetsData[targetId][variant];
                            selected.forEach(selectedItem => {
                                const key = (variant === 'categories' ? 'name' : 'id');
                                const existingCfg = targetConfigs[selectedItem[key]];
                                if (existingCfg) {
                                    if (existingCfg.maxItems) {
                                        existingCfg.weight = 0;
                                    } else {
                                        existingCfg.maxItems = 0;
                                    }
                                } else {
                                    targetConfigs[selectedItem[key]] = {
                                        weight: 0,
                                    };
                                }
                            });
                        });
                    }
                }));
            }
        };
    }, [config, configState]);

    const setCategoriesBlacklist = React.useMemo(() => blacklistSetterBuilder('categories'), [blacklistSetterBuilder]);
    const setItemsBlacklist = React.useMemo(() => blacklistSetterBuilder('items'), [blacklistSetterBuilder]);

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
                            <ItemsSubsetList
                                className={classes.blacklist}
                                title="Categories blacklist"
                                selectedItems={configCategoriesBlacklist}
                                setSelectedItems={setCategoriesBlacklist}
                                targetsId={config ? config.config.selectFromTargets : []}
                                variant="categories"
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <ItemsSubsetList
                                className={classes.blacklist}
                                title="Items blacklist"
                                selectedItems={configItemsBlacklist}
                                setSelectedItems={setItemsBlacklist}
                                targetsId={config ? config.config.selectFromTargets : []}
                                variant="items"
                            />
                        </Grid>
                    </Grid>
                </>
            )}
        </Grid>
    );
};
