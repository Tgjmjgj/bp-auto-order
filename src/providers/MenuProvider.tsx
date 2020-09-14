import React from 'react';
import 'firebase/firestore';

import { getUpdatedMenu } from '../service/functions';
import { AutoAuthContext } from './AutoAuthProvider';
import { defaultConfigState } from './ConfigStateProvider';
import { Menu } from '../../types/autoOrderMenus';

type AllMenus = Record<string, Menu>;

const menuTargets = defaultConfigState.savedTargets.filter(target => target.isSystem);
const defaultMenus: AllMenus = Object.fromEntries(
    menuTargets.map(target => [target.id, []]),
);

export const MenuContext = React.createContext<AllMenus>(defaultMenus);

export const MenuProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const [menusState, setMenusState] = React.useState<AllMenus>(defaultMenus);

    React.useEffect(() => {
        if (authContext.uid) {
            menuTargets.forEach(target => {
                getUpdatedMenu(target.id).then(menuData => {
                    setMenusState(state => ({
                        ...state,
                        [target.id]: menuData.data,
                    }));
                    console.log(`@ '${target.id}' menu: `, menuData.data);
                });
            });
        }
    }, [authContext.uid]);

    return (
        <MenuContext.Provider value={ menusState }>
            { children }
        </MenuContext.Provider>
    );
};
