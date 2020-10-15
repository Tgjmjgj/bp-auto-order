import React from 'react';
import cn from 'classnames';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert'

import { NotificationContext } from '../providers/NotificationProvider'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
    }),
);

export const NotificationBar: React.FC = () => {
    const classes = useStyles();
    const { notificationData: data } = React.useContext(NotificationContext)

    return (
        <Collapse in={!!data}>
            <Alert className={cn(data && data.className)}>
                {data && data.message}
            </Alert>
        </Collapse>
    );
};
