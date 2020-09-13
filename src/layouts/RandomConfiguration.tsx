import React, { useContext } from 'react';
import produce from 'immer';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { ConfigStateContext } from '../providers/ConfigStateProvider';
import { ThreeValuesSlider } from '../components/ThreeValueSlider';

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
        costSlider: {
            marginTop: theme.spacing(4),
            marginBottom: theme.spacing(2),
        },
    }),
);

export const RandomConfiguration: React.FC = () => {
    const classes = useStyles();
    const configState = useContext(ConfigStateContext);
    const [costValues, setCostValues] = React.useState<[number, number, number]>([270, 300, 340]);
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
            <Divider />
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
        </Grid>
    );
};
