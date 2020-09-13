import React, { useContext } from 'react';
import produce from 'immer';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { ConfigStateContext } from '../providers/ConfigStateProvider';

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
    }),
);

export const RandomConfiguration: React.FC = () => {
    const classes = useStyles();
    const configState = useContext(ConfigStateContext);
    const config = configState.state.randomConfigs.find(cfg => cfg.id === configState.state.selectedConfig);

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
            <Grid item className={classes.gridRow}>

            </Grid>
        </Grid>
    );
};
