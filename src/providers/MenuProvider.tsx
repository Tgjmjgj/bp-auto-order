import React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { getUpdatedMenu } from '../service/functions';
import { AutoAuthContext } from './AutoAuthProvider';
import { defaultConfigState } from './ConfigStateProvider';
import { Menu, MenuTable } from '../../types/autoOrderMenus';

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
            Promise.allSettled(menuTargets.map(target => getUpdatedMenu(target.id)))
            .then(() => {
                firebase.firestore().collection('auto-order-menus').get().then(data => {
                    data.forEach(menuEntry => {
                        const menuData = menuEntry.data() as MenuTable;
                        setMenusState(state => ({
                            ...state,
                            [menuEntry.id]: menuData.menu,
                        }));
                        console.log(`@ '${menuEntry.id}' menu: `, menuData.menu);
                    });
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
