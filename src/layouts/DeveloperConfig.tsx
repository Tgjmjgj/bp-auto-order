import React from 'react';
import shuffle from 'lodash/shuffle';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import { ConfigStateContext } from '../ConfigStateProvider';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gridRow: {
            display: 'flex',
            alignItems: 'center',
        },
        label: {
            marginRight: '20px',
        },
        iconGroup: {
            margin: theme.spacing(1),
        }
    })
);

export const DeveloperConfig: React.FC = () => {
    const rightOrderRef = React.useRef(shuffle([0, 1, 2]));
    const [correctClicks, setCorrectClicks] = React.useState(0);
    const [sheetIdDisabled, setSheetIdDisabled] = React.useState(true);
    const configState = React.useContext(ConfigStateContext);
    const classes = useStyles();
    const spreadsheetId = configState.state.spreadsheetId;

    const changeSpreadsheetId = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        configState.updateState({spreadsheetId: e.target.value});
    }, [configState]);

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

    return (
        <Grid container spacing={4}>
            <Grid item className={classes.gridRow}>
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
                {lockPuzzle}
            </Grid>
        </Grid>
    );
};
