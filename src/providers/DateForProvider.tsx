import React from 'react';
import { DateTime } from 'luxon';

type DateForContextValue = {
    dateFor: string
    setDateFor: React.Dispatch<React.SetStateAction<string>>
};

const dateCheckTimeout = 300000; // 5 minuts
const tomorrow = DateTime.local().plus({ day: 1 }).setZone('Europe/Moscow').toFormat('MM/dd/yyyy');

export const DateForContext = React.createContext<DateForContextValue>({ dateFor: tomorrow, setDateFor: () => {} });

export const DateForProvider: React.FC = ({ children }) => {

    const [dateFor, setDateFor] = React.useState<string>(tomorrow);
    const dateForContextValue = React.useMemo(() => {
        return { dateFor, setDateFor };
    }, [dateFor]);

    React.useEffect(() => {
        const timerId = setInterval(() => {
            const newTomorrow = DateTime.local().plus({ day: 1 }).setZone('Europe/Moscow').toFormat('MM/dd/yyyy');
            if (newTomorrow !== dateFor) {
                setDateFor(newTomorrow);
            }
        }, dateCheckTimeout);

        return () => clearInterval(timerId);
    }, [dateFor]);

    return (
        <DateForContext.Provider value={ dateForContextValue }>
            { children }
        </DateForContext.Provider>
    );
};
