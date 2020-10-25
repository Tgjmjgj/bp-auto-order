import React from 'react';
import produce from 'immer';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { ConfigStateContext, ConfigUpdateContext } from '../../../providers/ConfigStateProvider';
import { ThreeValuesSlider } from '../../../components/ThreeValueSlider';
import { RandomOrderConfig } from '../../../../types/autoOrderConfigs';
import { useDefferedCall } from '../../../hooks/useDefferedCall';

const defferedUpdateTimeout = 2000;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        costSlider: {
            marginTop: theme.spacing(4),
            marginBottom: theme.spacing(2),
        },
    }),
);

export const CostSlider: React.FC = () => {
    const classes = useStyles();
    const configState = React.useContext(ConfigStateContext);
    const updateConfig = React.useContext(ConfigUpdateContext);
    const [costValues, setCostValues] = React.useState<[number, number, number]>([270, 300, 340]);
    const selectedConfigIndex = configState.state.randomConfigs.findIndex(cfg => cfg.id === configState.state.selectedConfig);
    const selectedConfigRef = React.useRef<RandomOrderConfig | null>(
        selectedConfigIndex !== -1 ? configState.state.randomConfigs[selectedConfigIndex] : null,
    );

    React.useEffect(() => {
        selectedConfigRef.current = selectedConfigIndex !== -1 ? configState.state.randomConfigs[selectedConfigIndex] : null;
    }, [configState, selectedConfigIndex]);

    React.useEffect(() => {
        if (!selectedConfigRef.current) {
            return;
        }
        setCostValues([
            selectedConfigRef.current.config.total.cost.min,
            selectedConfigRef.current.config.total.cost.mid,
            selectedConfigRef.current.config.total.cost.max,
        ]);
    }, [selectedConfigIndex]);

    const updateCost = React.useCallback(() => {
        updateConfig(oldState => produce(oldState, state => {
            const cfg = state.randomConfigs.find(cfg => cfg.id === state.selectedConfig);
            if (
                !cfg || (
                    cfg.config.total.cost.min === costValues[0] &&
                    cfg.config.total.cost.mid === costValues[1] &&
                    cfg.config.total.cost.max === costValues[2]
                )
            ) {
                return;
            }
            cfg.config.total.cost = {
                min: costValues[0],
                mid: costValues[1],
                max: costValues[2],
            };
        }));
    }, [costValues, updateConfig]);

    useDefferedCall(defferedUpdateTimeout, updateCost, [selectedConfigIndex]);

    return (
        <>
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
        </>
    );
};
