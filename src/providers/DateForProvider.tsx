import React from 'react';
import { getNextOrderDateTime } from '../components/TimeUntilNextOrder';

type DateForContextValue = {
    dateFor: string
    setDateFor: React.Dispatch<React.SetStateAction<string>>
};

export const customDateFormat = 'yyyy-MM-dd';

export const DateForContext = React.createContext<DateForContextValue>({
    dateFor: getNextOrderDateTime().toFormat(customDateFormat),
    setDateFor: () => {},
});

export const DateForProvider: React.FC = ({ children }) => {

    const [dateFor, setDateFor] = React.useState<string>(
        getNextOrderDateTime().toFormat(customDateFormat)
    );
    const dateForContextValue = React.useMemo(() => {
        return { dateFor, setDateFor };
    }, [dateFor]);

    return (
        <DateForContext.Provider value={ dateForContextValue }>
            { children }
        </DateForContext.Provider>
    );
};
