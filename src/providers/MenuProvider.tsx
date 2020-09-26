import React from 'react';
import 'firebase/firestore';
import produce from 'immer';

import { AutoAuthContext } from './AutoAuthProvider';
import { ConfigStateContext } from './ConfigStateProvider';
import { DateForContext } from './DateForProvider';
import { getUpdatedMenu } from '../service/functions';
import { defaultConfigState, pseudoIdPrefix } from '../initData'
import { UpdatedMenu } from '../../types/autoOrderMenus';

type AllMenus = Record<string, UpdatedMenu>;

const menuTargets = defaultConfigState.savedTargets.filter(target => target.isSystem);
const defaultMenus: AllMenus = Object.fromEntries(
    menuTargets.map(target => [target.id, []]),
);

export const MenuContext = React.createContext<AllMenus>(defaultMenus);

export const MenuProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const configState = React.useContext(ConfigStateContext);
    const { dateFor } = React.useContext(DateForContext);
    const [menusState, setMenusState] = React.useState<AllMenus>(defaultMenus);
    const checkedMenuTargetsRef = React.useRef<string[]>([]);

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

    // fix item keys from default random config
    React.useEffect(() => {
        const targetKeys = Object.keys(menusState);
        targetKeys.forEach(target => {
            if (!checkedMenuTargetsRef.current.includes(target)) {
                const targetMenu = menusState[target];
                if (targetMenu.length) {
                    configState.updateState(produce(configState.state, state => {
                        state.randomConfigs.forEach(rndCfg => {
                            const targetCfg = rndCfg.config.targetsData[target];
                            if (targetCfg) {
                                Object.entries(targetCfg.items).forEach(([itemKey, itemCfg]) => {
                                    if (itemKey.startsWith(pseudoIdPrefix)) {
                                        const itemName = itemKey.slice(pseudoIdPrefix.length);
                                        const menuItem = targetMenu.find(item => item.name === itemName);
                                        if (menuItem) {
                                            delete targetCfg.items[itemKey];
                                            targetCfg.items[menuItem.id] = itemCfg;
                                        }
                                    }
                                });
                            }
                        });
                    }));
                    checkedMenuTargetsRef.current.push(target);
                }
            }
        });
    }, [menusState, configState, checkedMenuTargetsRef]);

    return (
        <MenuContext.Provider value={ menusState }>
            { children }
        </MenuContext.Provider>
    );
};
