import React from 'react';

export const highlightSearch = (text: string, search: string) => {
    const index = text.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1 || !search) {
        return text;
    } else {
        const part1 = text.slice(0, index);
        const part2 = text.slice(index, search.length);
        const part3 = text.slice(index + search.length);
        return (
            <>
                <span>{part1}</span>
                <span style={{backgroundColor: 'yellow'}}>
                    {part2}
                </span>
                <span>{part3}</span>
            </>
        );
    }
};
