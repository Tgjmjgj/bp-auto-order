import React from 'react';

export const useDefferedCall = (timeout: number, fn: () => void, deps: any[] = []) => {

    const isDirtyRef = React.useRef(false);
    const fnRef = React.useRef(fn);

    React.useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    React.useEffect(() => {
        return () => {
            if (isDirtyRef.current) {
                fnRef.current();
            }
        };
    }, []);

    React.useEffect(() => {
        return () => {
            if (isDirtyRef.current) {
                fnRef.current();
            }
        };
    }, [...deps]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        isDirtyRef.current = true;
        const timeoutId = setTimeout(() => {
            fn();
            isDirtyRef.current = false;
        }, timeout);
        return () => clearTimeout(timeoutId);
    }, [fn, timeout]);

};
