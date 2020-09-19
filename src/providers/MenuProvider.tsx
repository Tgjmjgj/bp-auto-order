import React from 'react';
import 'firebase/firestore';

import { getUpdatedMenu } from '../service/functions';
import { AutoAuthContext } from './AutoAuthProvider';
import { defaultConfigState } from './ConfigStateProvider';
import { UpdatedMenu } from '../../types/autoOrderMenus';
import { DateForContext } from './DateForProvider';

type AllMenus = Record<string, UpdatedMenu>;

const menuTargets = defaultConfigState.savedTargets.filter(target => target.isSystem);
const defaultMenus: AllMenus = Object.fromEntries(
    menuTargets.map(target => [target.id, []]),
);

export const MenuContext = React.createContext<AllMenus>(defaultMenus);

export const MenuProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const { dateFor } = React.useContext(DateForContext);
    const [menusState, setMenusState] = React.useState<AllMenus>(defaultMenus);

    React.useEffect(() => {
        if (authContext.uid) {
            menuTargets.forEach(target => {
                getUpdatedMenu(target.id, dateFor).then(menuData => {
                    setMenusState(state => ({
                        ...state,
                        [target.id]: menuData.data,
                    }));
                    console.log(`@ '${target.id}' menu for ${dateFor}: `, menuData.data);
                });
            });
        }
    }, [authContext.uid, dateFor]);

    return (
        <MenuContext.Provider value={ menusState }>
            { children }
        </MenuContext.Provider>
    );
};
