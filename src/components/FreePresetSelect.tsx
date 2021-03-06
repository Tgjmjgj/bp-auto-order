import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import {randomId} from '../utils';

type FreeSelectOption = {
    key: string
    displayValue: string
};

type Props = {
    options: FreeSelectOption[]
    value: string
    onChange: (value: string) => void
    addNewItem?: (value: string) => void
    className?: string
    label?: string
};

export const FreePresetSelect: React.FC<Props> = props => {
    const { options, value, onChange, className, label, addNewItem } = props
    const [open, toggleOpen] = React.useState(false);
    const [newValue, setNewValue] = React.useState('');
    const uniqControlIdRef = React.useRef('free-select-' + randomId());
    const uniqDialogIdRef = React.useRef('free-select-dialog-' + randomId());

    const selectItems = React.useMemo(() => options.map(option => {
        return (
            <MenuItem value={option.key} key={option.key}>
                {option.displayValue}
            </MenuItem>
        );
    }), [options]);

    const onChangeSelection = React.useCallback((e: React.ChangeEvent<{name?: string | undefined; value: unknown}>) => {
        onChange(e.target.value as string);
    }, [onChange]);

    const addNew = React.useCallback((e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        setTimeout(() => toggleOpen(true));
    }, []);

    const onCloseDialog = React.useCallback(() => {
        toggleOpen(false);
        setNewValue('');
    }, []);

    const onSubmitDialog = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (addNewItem) {
            addNewItem((e.target as any).presetName.value);
        }
        onCloseDialog();
    }, [addNewItem, onCloseDialog]);

    const onChangeNewValue = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewValue(e.target.value);
    }, []);

    return (
        <>
            <FormControl variant="filled" size="small" className={className}>
                <InputLabel id={uniqControlIdRef.current}>
                    { label }
                </InputLabel>
                <Select
                    labelId={uniqControlIdRef.current}
                    value={value}
                    onChange={onChangeSelection}
                >
                    { selectItems }
                    { addNewItem && (
                        <MenuItem onClick={addNew}>
                            <em>Add new</em>
                        </MenuItem>
                    )}
                </Select>
            </FormControl>

            <Dialog open={open} onClose={onCloseDialog} aria-labelledby={uniqDialogIdRef.current}>
                <form onSubmit={onSubmitDialog}>
                    <DialogTitle id={uniqDialogIdRef.current}>
                        Add a new restaurant/service
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            name="presetName"
                            autoFocus
                            margin="dense"
                            value={newValue}
                            onChange={onChangeNewValue}
                            label={label}
                            type="text"
                            style={{ width: '100%' }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onCloseDialog} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            Add
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};
