import React from 'react';

import { AlertProps } from '@material-ui/lab/Alert'

export interface NotificationData extends AlertProps {
    lifetime?: number
    message: string
}

type NotificationContextValue = {
    notificationData: NotificationData | null
    pushNotification: React.Dispatch<React.SetStateAction<NotificationData | null>>
};

const emptyNotificationContextValue: NotificationContextValue = {
    notificationData: null,
    pushNotification: () => {},
}

export const NotificationContext = React.createContext<NotificationContextValue>(emptyNotificationContextValue);

export const NotificationProvider: React.FC = ({ children }) => {

    const [notificationData, setNotificationData] = React.useState<NotificationData | null>(null);

    const notificationContextValue = React.useMemo(() => ({
        notificationData,
        pushNotification: setNotificationData,
    }), [notificationData])

    return (
        <NotificationContext.Provider value={ notificationContextValue }>
            { children }
        </NotificationContext.Provider>
    );
};
