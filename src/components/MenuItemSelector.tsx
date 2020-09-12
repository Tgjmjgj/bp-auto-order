import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { MenuItem } from '../../types/autoOrderMenus';

interface Props {
    items: MenuItem[]
    selectItem: (itemId: string) => void
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
    }),
);

export const MenuItemSelector: React.FC<Props> = (props) => {
    const classes = useStyles();


    return (
        <div/>
    );
};
