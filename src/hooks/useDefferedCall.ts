import React from 'react';

export const useDefferedCall = (timeout: number, fn: () => void) => {

    const isDirtyRef = React.useRef(false);
    const fnRef = React.useRef(fn);
    fnRef.current = fn;

    React.useEffect(() => {
        return () => {
            console.log('@Invoke it only on the unmount state');
            if (isDirtyRef.current) {
                fnRef.current();
            }
        }
    }, [isDirtyRef, fnRef]);

    React.useEffect(() => {
        isDirtyRef.current = true;
        const timeoutId = setTimeout(() => {
            fn();
            console.log('@Invloke fn and set dirty = false');
            isDirtyRef.current = false;
        }, timeout);
        return () => clearTimeout(timeoutId);
    }, [fn, timeout, isDirtyRef]);

};
