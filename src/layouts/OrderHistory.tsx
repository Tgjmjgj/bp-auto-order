import React from 'react';
import cn from 'classnames';
import { DateTime } from 'luxon';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { DatePicker } from '@material-ui/pickers';
import { OrderHistoryStateContext } from '../providers/OrderHistoryProvider';

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
        longLabel: {
            marginRight: 40,
        },
        label: {
            marginRight: 20,
        },
        divider: {
            marginTop: 8,
        },
    }),
);

export const OrderHistory: React.FC = () => {
    const classes = useStyles();
    const orderHistory = React.useContext(OrderHistoryStateContext);

    const [filterDateFrom, setFilterDateFrom] = React.useState<DateTime | null>(null);
    const [filterDateTo, setFilterDateTo] = React.useState<DateTime | null>(null);

    const orderDates = Object.keys(orderHistory.data).sort();
    const minOrderDate = orderDates.length ? Number(orderDates[0]) : Date.now();
    const maxDateFrom = React.useMemo(() => {
        return filterDateTo || DateTime.fromMillis(minOrderDate);
    }, [filterDateTo, minOrderDate]);
    const minDateTo = React.useMemo(() => {
        return filterDateFrom || DateTime.fromMillis(minOrderDate);
    }, [filterDateFrom, minOrderDate]);

    return (
        <Grid container spacing={4} direction="column">
            <Grid item className={cn(classes.gridRow, classes.wrapRow)}>
                <div className={classes.gridRow}>
                    <Typography className={classes.longLabel}>
                        Filter
                    </Typography>
                </div>
                <div className={classes.gridRow}>
                    <Typography className={classes.label}>
                        from
                    </Typography>
                    <DatePicker
                        autoOk
                        disableToolbar
                        disabled={orderHistory.dataLoadingStatus !== 'loaded'}
                        variant="dialog"
                        placeholder="date"
                        value={filterDateFrom}
                        onChange={setFilterDateFrom}
                        minDate={minOrderDate}
                        maxDate={maxDateFrom}
                        format="cccc, MMMM d"
                        clearable
                    />
                </div>
                <div className={classes.gridRow}>
                    <Typography className={classes.label}>
                        until
                    </Typography>
                    <DatePicker
                        autoOk
                        disableToolbar
                        disabled={orderHistory.dataLoadingStatus !== 'loaded'}
                        variant="dialog"
                        placeholder="date"
                        value={filterDateTo}
                        onChange={setFilterDateTo}
                        minDate={minDateTo}
                        maxDate={DateTime.local()}
                        format="cccc, MMMM d"
                        clearable
                    />
                </div>
            </Grid>
            <Divider className={classes.divider} />
        </Grid>
    );
};
