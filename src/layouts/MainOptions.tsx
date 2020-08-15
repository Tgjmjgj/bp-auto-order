import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';

import { ConfigStateContext } from '../ConfigStateProvider';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gridRow: {
            display: 'flex',
            alignItems: 'flex-end',
        },
        label: {
            marginRight: '20px',
        },
        iconGroup: {
            margin: theme.spacing(1),
        },
        divider: {
            marginBottom: theme.spacing(2),
        },
        newPresetButton: {
            marginTop: theme.spacing(4),
            transition: 'color .2s ease-out, border-color .2s ease-out, background-color .2s ease-out',
            '&:hover': {
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                backgroundColor: 'rgb(22, 2, 232, .04)',
            },
        },
    })
);

export const MainOptions: React.FC = () => {
    const configState = React.useContext(ConfigStateContext);
    const classes = useStyles();
    const customName = configState.state.customName;

    const changeCustomName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        configState.updateState({customName: e.target.value})
    }, [configState]);

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
            <Grid item>
                <Divider className={classes.divider} />
            </Grid>
        </Grid>
    );
};
