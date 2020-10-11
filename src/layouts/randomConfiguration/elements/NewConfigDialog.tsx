import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { randomId } from '../../../utils';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

export type NewConfigData = {
    name: string
    useCurrentAsTemplate: boolean
};

type Props = {
    onClose: (newConfigData: NewConfigData | null) => void
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dialogContent: {
            display: 'flex',
            flexFlow: 'column',
            alignItems: 'flex-start',
            padding: theme.spacing(0, 3),
        },
        switchLabel: {
            marginLeft: 0,
            marginTop: theme.spacing(2),
        },
    }),
);

export const NewConfigDialog: React.FC<Props> = ({ onClose }) => {
    const classes = useStyles();
    const uniqDialogIdRef = React.useRef('new-config-dialog-' + randomId());
    const [newConfigName, setNewConfigName] = React.useState('New Config');
    const [isUseCurrentAsTemplate, setUseCurrentAsTemplate] = React.useState(true);

    const onCloseDialog = React.useCallback(() => onClose(null), [onClose]);

    const onChangeNewConfigName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewConfigName(e.target.value);
    }, []);

    const onChangeUseCurrentAsTemplate = React.useCallback((e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setUseCurrentAsTemplate(checked);
    }, []);

    const onSubmitDialog = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onClose({
            name: (e.target as any).configName.value,
            useCurrentAsTemplate: (e.target as any).useCurrentAsTemplate.checked,
        });
    }, [onClose]);

    return (
        <Dialog open={true} onClose={onCloseDialog} aria-labelledby={uniqDialogIdRef.current}>
            <form onSubmit={onSubmitDialog}>
                <DialogTitle id={uniqDialogIdRef.current}>
                    New random configuration
                </DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    <TextField
                        name="configName"
                        autoFocus
                        margin="dense"
                        value={newConfigName}
                        onChange={onChangeNewConfigName}
                        label="Name"
                        type="text"
                        style={{ width: '100%' }}
                        error={!newConfigName.length}
                    />
                    <FormControlLabel
                        label="Use current config as template"
                        labelPlacement="start"
                        className={classes.switchLabel}
                        control={
                            <Switch
                                color="primary"
                                name="useCurrentAsTemplate"
                                checked={isUseCurrentAsTemplate}
                                onChange={onChangeUseCurrentAsTemplate}
                            />
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        disabled={!newConfigName.length}
                    >
                        Create
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
