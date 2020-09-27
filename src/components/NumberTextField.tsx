import React from 'react'

import TextField, {StandardTextFieldProps, FilledTextFieldProps, OutlinedTextFieldProps} from '@material-ui/core/TextField'

interface StandardNumberTextFieldProps extends Omit<StandardTextFieldProps, 'value' | 'onChange'> {
    value: number
    onChange: (value: number) => void
    min?: number
}
interface FilledNumberTextFieldProps extends Omit<FilledTextFieldProps, 'value' | 'onChange'> {
    value: number
    onChange: (value: number) => void
    min?: number
}
interface OutlinedNumberTextFieldProps extends Omit<OutlinedTextFieldProps, 'value' | 'onChange'> {
    value: number
    onChange: (value: number) => void
    min?: number
}
type NumberTextFieldProps = StandardNumberTextFieldProps | FilledNumberTextFieldProps | OutlinedNumberTextFieldProps

export const NumberTextField: React.FC<NumberTextFieldProps> = (props) => {
    const {value, onChange, min = 0, disabled = false, ...other} = props
    const [localValue, setLocalValue] = React.useState<string>(value.toString());

    const onChangeTextFieldValue = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        if (!isNaN(newValue) && (newValue >= min || e.target.value === '')) {
            setLocalValue(e.target.value);
            if (e.target.value !== '') {
                onChange(newValue)
            }
        }
    }, [onChange, min]);

    const onNumberFieldKeyDown = React.useCallback((e: any) => {
        if (e.key === '+' || e.key === '-') {
            e.preventDefault();
        }
    }, []);

    return (
        <TextField
            type="number"
            value={disabled ? '' : localValue}
            onChange={onChangeTextFieldValue}
            onKeyDown={onNumberFieldKeyDown}
            disabled={disabled}
            {...other}
        />
    );
};
