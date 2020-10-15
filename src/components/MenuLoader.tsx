import React from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

const movingDotsPeriod = 500;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gridRow: {
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'center',
            justifyContent: 'center',
        },
        loader: {
            marginTop: theme.spacing(2),
        },
        textContainer: {
            position: 'relative',
        },
        movingDots: {
            position: 'absolute',
        },
    }),
);

export const MenuLoader: React.FC = () => {
    const classes = useStyles();

    const [movingDots, setMovingDots] = React.useState('...');

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMovingDots(dots => Array((dots.length % 3) + 2).join('.'));
        }, movingDotsPeriod);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Grid container spacing={4} direction="column">
            <Grid item xs={12}>
                <div className={classes.gridRow}>
                    <Typography className={classes.textContainer}>
                        <span>
                            Loading menu data
                        </span>
                        <span className={classes.movingDots}>
                            { movingDots }
                        </span>
                    </Typography>
                    <CircularProgress
                        color="inherit"
                        size="32px"
                        className={classes.loader}
                    />
                </div>
            </Grid>
        </Grid>
    );
};
