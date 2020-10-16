import React from 'react';
import cn from 'classnames';

import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';

import { NotificationContext, NotificationData } from '../providers/NotificationProvider';

export const NotificationBar: React.FC = () => {
    const { notificationData: data } = React.useContext(NotificationContext);
    const lastDataRef = React.useRef<NotificationData | null>(null);
    const saveData = ((!data && lastDataRef.current) ? lastDataRef.current : data) || {}

    console.log('PrevData: ', lastDataRef.current)
    console.log('Data: ', data)

    React.useEffect(() => {
        if (data) {
            lastDataRef.current = data
        }
    }, [data, lastDataRef]);

    return (
        <Collapse in={!!data}>
            <Alert
                className={cn(saveData.className)}
                {...saveData}
            />
        </Collapse>
    );
};
