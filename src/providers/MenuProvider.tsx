import React from 'react';

import { getUpdatedMenu } from '../service/functions';
import { AutoAuthContext } from './AutoAuthProvider';
import { randomOrderOptionsTargetKeys, RandomOrderOptionsTargetKey } from '../constants';
import { Menu } from '../../types/autoOrderMenus';

type AllMenus = Record<RandomOrderOptionsTargetKey, Menu>;

const defaultMenus: AllMenus = {
    'kumir': [],
};

export const MenuContext = React.createContext<AllMenus>(defaultMenus);

export const MenuProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const [menusState, setMenusState] = React.useState<AllMenus>(defaultMenus);

    React.useEffect(() => {
        if (authContext.uid) {
            Promise.allSettled(randomOrderOptionsTargetKeys.map(target => getUpdatedMenu(target)))
            .then(results => {
                const newState = Object.fromEntries(
                    results.map((result, i) => {
                        if (result.status === 'fulfilled') {
                            return [randomOrderOptionsTargetKeys[i], result.value.data] as const;
                        } else {
                            console.error('Can\'t get menu data: ', result.reason);
                            return [randomOrderOptionsTargetKeys[i], [] as Menu] as const;
                        }
                    }),
                ) as AllMenus;
                console.log('@Initial Menus: ', newState);
                setMenusState(newState);
            });
        }
    }, [authContext.uid]);

    return (
        <MenuContext.Provider value={ menusState }>
            { children }
        </MenuContext.Provider>
    );
};
