import React from 'react';
import shuffle from 'lodash/shuffle';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

import { ConfigStateContext, ConfigUpdateContext } from '../providers/ConfigStateProvider';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gridRow: {
            display: 'flex',
            alignItems: 'center',
        },
        wrapRow: {
            display: 'flex',
            flexFlow: 'row wrap',
            marginTop: -theme.spacing(2),
            '& > *': {
                marginTop: theme.spacing(2),
            },
        },
        label: {
            marginRight: '20px',
        },
        iconGroup: {
            margin: theme.spacing(1),
        },
        switchRowControl: {
            marginLeft: 0,
            '&>span:last-child': {
                minWidth: 200,
            },
        },
        infoMessage: {
            padding: theme.spacing(2),
            backgroundColor: '#f5f5cb',
        },
    }),
);

export const DeveloperSettings: React.FC = () => {
    const rightOrderRef = React.useRef(shuffle([0, 1, 2]));
    const [correctClicks, setCorrectClicks] = React.useState(0);
    const [sheetIdDisabled, setSheetIdDisabled] = React.useState(true);
    const configState = React.useContext(ConfigStateContext);
    const updateConfig = React.useContext(ConfigUpdateContext);
    const classes = useStyles();
    const spreadsheetId = configState.state.spreadsheet.id;
    const spreadsheetTab = configState.state.spreadsheet.tabHeading;
    const alwaysOverwrite = configState.state.overwriteAlways;
    const allowMultipleOrders = configState.state.allowMultipleOrders;

    const changeSpreadsheetId = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateConfig(state => ({
            ...state,
            spreadsheet: {
                ...state.spreadsheet,
                id: e.target.value,
            },
        }));
    }, [updateConfig]);

    const changeSpreadsheetTab = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateConfig(state => ({
            ...state,
            spreadsheet: {
                ...state.spreadsheet,
                tabHeading: e.target.value || undefined,
            },
        }));
    }, [updateConfig]);

    const onLockClick = React.useCallback((num: number) => {
        const nextCorrectClicks = correctClicks < rightOrderRef.current.length && num === rightOrderRef.current[correctClicks] ? correctClicks + 1 : 0;
        setCorrectClicks(nextCorrectClicks);
        setSheetIdDisabled(nextCorrectClicks !== 3);
    }, [rightOrderRef, correctClicks]);

    const lockPuzzle = (
        <div className={classes.iconGroup}>
            {[0, 1, 2].map(num => 
                <IconButton onClick={() => onLockClick(num)} key={num}>
                    {rightOrderRef.current.slice(0, correctClicks).includes(num) ? <LockOpenIcon /> : <LockIcon />}
                </IconButton>
            )}
        </div>
    );

    const onChangeOverwrite = React.useCallback(() => {
        updateConfig({ overwriteAlways: !alwaysOverwrite });
    }, [updateConfig, alwaysOverwrite]);

    const onChangeAllowMultiple = React.useCallback(() => {
        updateConfig({ allowMultipleOrders: !allowMultipleOrders });
    }, [updateConfig, allowMultipleOrders]);

    return (
        <Grid container spacing={4} direction="column">
            <Grid item>
                <div className={classes.wrapRow}>
                    <div className={classes.gridRow}>
                        <Typography className={classes.label}>
                            Spreadsheet Id:
                        </Typography>
                        <TextField
                            required
                            size="small"
                            label="Spreadsheet Id"
                            disabled={sheetIdDisabled}
                            variant={sheetIdDisabled ? 'filled' : 'outlined' as any}
                            value={spreadsheetId}
                            onChange={changeSpreadsheetId}
                        />
                    </div>
                    <div className={classes.gridRow}>
                        <Typography className={classes.label}>
                            Spreadsheet Tab Heading:
                        </Typography>
                        <TextField
                            required
                            size="small"
                            label="Spreadsheet Heading"
                            disabled={sheetIdDisabled}
                            variant={sheetIdDisabled ? 'filled' : 'outlined' as any}
                            value={spreadsheetTab}
                            onChange={changeSpreadsheetTab}
                        />
                    </div>
                    {lockPuzzle}
                </div>
                {!sheetIdDisabled && (
                    <div className={classes.gridRow}>
                        <Paper elevation={3} className={classes.infoMessage}>
                            <Typography>
                                If you want to use this app with a different spreadsheet, 
                                you need to grant edit access to the app service provider account:
                            </Typography>
                            <Typography>
                                brightpattern-282908@appspot.gserviceaccount.com
                            </Typography>
                        </Paper>
                    </div>
                )}
            </Grid>
            <Grid item className={classes.gridRow}>
                <FormControlLabel
                    label="Overwrite existing order: "
                    labelPlacement="start"
                    className={classes.switchRowControl}
                    control={
                        <Switch
                            color="secondary"
                            name="overwriteSwitch"
                            checked={alwaysOverwrite}
                            onChange={onChangeOverwrite}
                        />
                    }
                />
            </Grid>
            <Grid item className={classes.gridRow}>
                <FormControlLabel
                    label="Allow multiple orders: "
                    labelPlacement="start"
                    className={classes.switchRowControl}
                    control={
                        <Switch
                            color="secondary"
                            name="overwriteSwitch"
                            checked={allowMultipleOrders}
                            onChange={onChangeAllowMultiple}
                        />
                    }
                />
            </Grid>
        </Grid>
    );
};
