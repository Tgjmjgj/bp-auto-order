import React from 'react';
import { DateTime, Duration, Interval } from 'luxon';

const orderWeekdays = [2, 4];
const orderTime = {hour: 15, minute: 0}; 

const units = ['year', 'month', 'day', 'hour', 'minute', 'second'] as const;

const durationToReadable = (duration: Duration) => {
    let required = false;
    const sDur = duration.shiftTo(...units, 'millisecond');
    return units.reduce<string[]>((arr, unit, index) => {
		if ((Number(sDur[`${unit}s` as 'days']) > 0) || required || (index === (units.length - 1))) {
			arr.push(`${sDur[`${unit}s` as 'days']} ${unit}${sDur[`${unit}s` as 'days'] === 1 ? '' : 's'}`);
			required = true;
        }
        return arr;
	}, []).join(', ');
};

export const TimeUntilNextOrder: React.FC = () => {

    const [timeLeft, setTimeLeft] = React.useState('');
    const [resetter, setResetter] = React.useState(0);

    const orderDateTime = React.useMemo(() => {
        const today = DateTime.local().setZone('Europe/Moscow');
        let orderDay = today;
        if (today.hour >= orderTime.hour && today.minute >= orderTime.minute) {
            orderDay = orderDay.plus({days: 1});
        }
        while (!orderWeekdays.includes(orderDay.weekday)) {
            orderDay = orderDay.plus({days: 1});
        }
        return orderDay.set(orderTime);
    }, [resetter]); // eslint-disable-line react-hooks/exhaustive-deps

    const calculateLeftTime = React.useCallback(() => {
        const now = DateTime.local().setZone('Europe/Moscow');
        const duration = Interval.fromDateTimes(now, orderDateTime).toDuration();
        if (duration.isValid) {
            const durStr = durationToReadable(duration);
            setTimeLeft(durStr);
        } else {
            setResetter(val => ++val);
        }
    }, [orderDateTime]);

    React.useEffect(() => {
        calculateLeftTime();
        const intervalId = setInterval(calculateLeftTime, 1000);
        return () => clearInterval(intervalId);
    }, [calculateLeftTime]); 

    return (
        <span>
            {timeLeft}
        </span>
    );
};
