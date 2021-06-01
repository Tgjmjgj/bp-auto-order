import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

type HistoryListProps = {
    className?: string,
}

const useStyles = makeStyles((theme: Theme) => 
    createStyles({

    }),
);

export const HistoryList: React.FC<HistoryListProps> = ({className = ''}) => {
    const classes = useStyles();

    return (
        <Grid container spacing={4} className={className}>

        </Grid>
    );
};
