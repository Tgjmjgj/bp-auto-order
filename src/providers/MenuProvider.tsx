import React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import produce from 'immer';

import { AutoAuthContext } from './AutoAuthProvider';
import { ConfigStateContext } from './ConfigStateProvider';
import { DateForContext } from './DateForProvider';
import { getUpdatedMenu } from '../service/functions';
import { defaultConfigState, pseudoIdPrefix } from '../initData'
import { UpdatedMenu } from '../../types/autoOrderMenus';

type LoadStatus = 'not-loaded' | 'loaded' | 'error';

type AllMenus = {
    [targetId: string]: {
        menu: UpdatedMenu
        loadStatus: LoadStatus
    }
};

type AvailabilityData = {
    [date: string]: {
        [targetId: string]: string[]
    }
};

const menuTargets = defaultConfigState.savedTargets.filter(target => target.isSystem);
const defaultMenus: AllMenus = Object.fromEntries(
    menuTargets.map(target => [target.id, { menu: [], loadStatus: 'not-loaded' }]),
);

export const MenuContext = React.createContext<AllMenus>(defaultMenus);

export const MenuProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const configState = React.useContext(ConfigStateContext);
    const { dateFor } = React.useContext(DateForContext);
    const [menusState, setMenusState] = React.useState<AllMenus>(defaultMenus);
    const availabilityDataRef = React.useRef<AvailabilityData>({});
    const checkedMenuTargetsRef = React.useRef<string[]>([]);
    const initialLoadingRef = React.useRef(false);

    React.useEffect(() => {
        if (!authContext.uid) {
            return;
        }

        // For initial loading - just request all data directly
        if (!initialLoadingRef.current) {
            menuTargets.forEach(target => {
                getUpdatedMenu(target.id, dateFor).then(menuData => {
                    setMenusState(state => ({
                        ...state,
                        [target.id]: {
                            menu: menuData.data,
                            loadStatus: 'loaded',
                        },
                    }));
                    availabilityDataRef.current[dateFor] = {
                        ...availabilityDataRef.current[dateFor],
                        [target.id]: menuData.data.reduce<string[]>((arr, item) => {
                            if (item.enabled) {
                                arr.push(item.id);
                            }
                            return arr;
                        }, []),
                    };
                    console.log(`@ '${target.id}' menu for ${dateFor}: `, menuData.data);
                    initialLoadingRef.current = true;
                }).catch(() => {
                    setMenusState(state => ({
                        ...state,
                        [target.id]: {
                            menu: [],
                            loadStatus: 'error',
                        },
                    }));
                });
            });
            return;
        }

        // If not initial loading
        setMenusState(state => produce(state, mState => {
            Object.values(mState).forEach(targetMenu => {
                targetMenu.loadStatus = 'not-loaded';
            })
        }));
        firebase.firestore().collection('auto-order-menu-availability').doc(dateFor).get()
        .then(availabilityTableData => {
            menuTargets.forEach(target => {
                // 1. Check local cache
                if (availabilityDataRef.current[dateFor] && availabilityDataRef.current[dateFor][target.id]) {
                    setMenusState(state => ({
                        ...state,
                        [target.id]: {
                            menu: state[target.id].menu.map(item => ({
                                ...item,
                                enabled: availabilityDataRef.current[dateFor][target.id].includes(item.id),
                            })),
                            loadStatus: 'loaded',
                        },
                    }));
                    return;
                }
                // 2. Check existing data in availability table
                if (availabilityTableData.exists) {
                    const availableMenuForDate = availabilityTableData.get(target.id) as string[] | undefined;
                    if (availableMenuForDate && availableMenuForDate.length) {
                        setMenusState(state => ({
                            ...state,
                            [target.id]: {
                                menu: state[target.id].menu.map(item => ({
                                    ...item,
                                    enabled: availableMenuForDate.includes(item.id),
                                })),
                                loadStatus: 'loaded',
                            },
                        }));
                        availabilityDataRef.current[dateFor] = {
                            ...availabilityDataRef.current[dateFor],
                            [target.id]: availableMenuForDate,
                        };
                        return;
                    }
                }
                // 3. Retreive data from scrapper
                getUpdatedMenu(target.id, dateFor).then(menuData => {
                    setMenusState(state => ({
                        ...state,
                        [target.id]: {
                            menu: menuData.data,
                            loadStatus: 'loaded',
                        },
                    }));
                    availabilityDataRef.current[dateFor] = {
                        ...availabilityDataRef.current[dateFor],
                        [target.id]: menuData.data.reduce<string[]>((arr, item) => {
                            if (item.enabled) {
                                arr.push(item.id);
                            }
                            return arr;
                        }, []),
                    };
                    console.log(`@ '${target.id}' menu for ${dateFor}: `, menuData.data);
                }).catch(() => {
                    setMenusState(state => ({
                        ...state,
                        [target.id]: {
                            menu: [],
                            loadStatus: 'error',
                        },
                    }));
                });

            });
        }).catch(() => {
            setMenusState(state => produce(state, mState => {
                Object.values(mState).forEach(targetMenu => {
                    targetMenu.loadStatus = 'error';
                })
            }));
        });

    }, [authContext.uid, dateFor]);

    // fix item keys from default random config
    React.useEffect(() => {
        const targetKeys = Object.keys(menusState);
        targetKeys.forEach(target => {
            if (checkedMenuTargetsRef.current.includes(target)) {
                return;
            }
            const targetMenu = menusState[target].menu;
            if (!targetMenu.length) {
                return;
            }
            configState.updateState(produce(configState.state, state => {
                state.randomConfigs.forEach(rndCfg => {
                    const targetCfg = rndCfg.config.targetsData[target];
                    if (!targetCfg) {
                        return;
                    }
                    Object.entries(targetCfg.items).forEach(([itemKey, itemCfg]) => {
                        if (!itemKey.startsWith(pseudoIdPrefix)) {
                            return;
                        }
                        const itemName = itemKey.slice(pseudoIdPrefix.length);
                        const menuItem = targetMenu.find(item => item.name === itemName);
                        if (!menuItem) {
                            return;
                        }
                        delete targetCfg.items[itemKey];
                        targetCfg.items[menuItem.id] = itemCfg;
                    });
                });
            }));
            checkedMenuTargetsRef.current.push(target);
        });
    }, [menusState, configState]);

    return (
        <MenuContext.Provider value={ menusState }>
            { children }
        </MenuContext.Provider>
    );
};
