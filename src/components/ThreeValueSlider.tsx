import React from 'react';
import cn from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

type Props = {
    setValues: (values: [number, number, number]) => void
    values: [number, number, number]
    start: number
    end: number
    className?: string
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sliderRoot: {
            '& .MuiSlider-rail': {
                height: 8,
            },
            '& .MuiSlider-track': {
                height: 0,
                color: 'transparent',
                border: '4px solid #2d3f9e',
                // transform: 'skewX(45deg)',
            },
            '& .MuiSlider-mark': {
                height: 8,
            },
            '& .MuiSlider-thumb': {
                height: 18,
                width: 18,
                marginTop: -5,
            },
        },
    }),
);

export type CustomLabelProps = {
    children: React.ReactElement
    open: boolean
    value: number
};

const CustomLabel = (props: CustomLabelProps) => {
    const { children, open, value } = props;
    return (
        <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
            {children}
        </Tooltip>
    );
};

const useThumbStyles = makeStyles((theme: Theme) =>
    createStyles({
        customThumb: {
            borderRadius: 0,
            width: '8px !important',
            height: '24px !important',
            marginLeft: 0,
            marginTop: '-8px !important',
            borderTop: '3px solid #3f51b5',
            borderRight: '1px solid #3f51b5',
            borderBottom: '3px solid #3f51b5',
            borderLeft: '1px solid #3f51b5',
            position: 'absolute',
            boxSizing: 'border-box',
            backgroundColor: '#fff',
            zIndex: 5,
            outline: 0,
            '&:hover': {
                transform: 'scale(1.2)',
            },
        },
    }),
);
const CustomThumb = React.forwardRef((props: any, ref: React.Ref<any>) => {
    const classes = useThumbStyles();
    const i = props['data-index'];
    if (i === 0 || i === 2) {
        return (
            <span {...props} ref={ref} className={classes.customThumb} />
        );
    } else {
        return (
            <span {...props} ref={ref} />
        );
    }
});

const minSpanVariation = 10;

export const ThreeValuesSlider: React.FC<Props> = props => {
    const { values, start, end, setValues, className } = props;
    const classes = useStyles();
    const leftDiffRef = React.useRef(values[1] - values[0]);
    const rightDiffRef = React.useRef(values[2] - values[1]);

    const marks = React.useMemo(() => {
        const marks = [
            { value: start, label: `${start} ₽` },
            { value: values[1], label: values[1] },
            { value: end, label: `${end} ₽` },
        ];
        if (values[0] !== start) {
            marks.push({ value: values[0], label: values[0] });
        }
        if (values[2] !== end) {
            marks.push({ value: values[2], label: values[2] });
        }
        return marks;
    }, [start, end, values]);

    const onChangeValues = React.useCallback((e: React.ChangeEvent<{}>, value: number | number[]) => {
        const newValues = value as [number, number, number];
        if (newValues[0] === values[0] && newValues[1] === values[1] && newValues[2] === values[2]) {
            return;
        }
        if (newValues[1] !== values[1]) {
            let newValue0 = newValues[1] - leftDiffRef.current;
            if (newValue0 < start) {
                newValue0 = start
            } else {
                newValue0 = Math.min(newValue0, newValues[1] - minSpanVariation);
            }
            let newValue2 = newValues[1] + rightDiffRef.current;
            if (newValue2 > end) {
                newValue2 = end;
            } else {
                newValue2 = Math.max(newValue2, newValues[1] + minSpanVariation);
            }
            if (newValue0 < values[1] && values[1] < newValue2) {
                setValues([newValue0, newValues[1], newValue2]);
            }
        } else {
            if (newValues[0] < values[1] && values[1] < newValues[2]) {
                setValues([
                    Math.min(newValues[0], newValues[1] - minSpanVariation),
                    newValues[1],
                    Math.max(newValues[2], newValues[1] + minSpanVariation),
                ]);
                leftDiffRef.current = newValues[1] - newValues[0];
                rightDiffRef.current = newValues[2] - newValues[1];
            }
        }
    }, [setValues, values, start, end]);

    const formatValueLabel = React.useCallback((value: number, index: number) => {
        switch (index) {
            case 0:
                return <span>min</span>;
            case 1:
                return <span>mid</span>;
            case 2:
                return <span>max</span>;
        }
    }, []);

    return (
        <Slider
            marks={marks}
            value={values}
            min={start}
            max={end}
            className={cn(classes.sliderRoot, className)}
            onChange={onChangeValues}
            valueLabelDisplay="on"
            ValueLabelComponent={CustomLabel}
            valueLabelFormat={formatValueLabel}
            ThumbComponent={CustomThumb as any}
        />
    );
};
