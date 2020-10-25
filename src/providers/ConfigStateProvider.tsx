import React, { useEffect } from 'react';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import pickBy from 'lodash/pickBy';
import isEqual from 'lodash/isEqual';
import isFunction from 'lodash/isFunction';

import { AutoAuthContext } from './AutoAuthProvider';
import { defaultConfigState } from '../initData';
import { ConfigState } from '../../types/autoOrderConfigs';

export type OrderTarget = {
    key: string
    displayName: string
};

export type ConfigContextData = {
    state: LocalConfigState
    saved: number                   // value changes when config successfully saved on server
    dataLoaded: boolean
};

export type LocalConfigState = ConfigState & {
    dontSaveOnServer?: boolean           // indicates does we need to initiate saving operation or not
};

export type ConfigUpdateStateMethod = (stateUpdate: Partial<ConfigState> | ((oldState: ConfigState) => ConfigState)) => void;

const omitProperties = ['dontSaveOnServer'];
const prepareConfigForServer = (conf: LocalConfigState) => {
    return pickBy(conf, (val, key) => !omitProperties.includes(key)) as ConfigState;
};

const defaultConfigContextData = {
    state: defaultConfigState,
    saved: 0,
    dataLoaded: false,
};
const defaultConfigUpdateStateContextData = () => {};

const saveConfigInactivityTimeout = 3000;

export const ConfigStateContext = React.createContext<ConfigContextData>(defaultConfigContextData);
export const ConfigUpdateContext = React.createContext<ConfigUpdateStateMethod>(defaultConfigUpdateStateContextData);

export const ConfigStateProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const [configState, setConfigState] = React.useState<LocalConfigState>(defaultConfigState);
    const [saved, setSaved] = React.useState(0);
    const [dataLoaded, setDataLoaded] = React.useState(false);
    const serverConfigStateRef = React.useRef<ConfigState>(defaultConfigState);
    const timerIdRef = React.useRef(0);

    const updateState = React.useCallback((stateUpdate: Partial<ConfigState> | ((oldState: ConfigState) => ConfigState)) => {
        if (isFunction(stateUpdate)) {
            setConfigState(oldState => {
                return stateUpdate(oldState);
            });
        } else {
            setConfigState(oldState => ({
                ...oldState,
                ...stateUpdate,
                dontSaveOnServer: true,
            }));
        }
    }, []);

    const configContextValue = React.useMemo(() => {
        return {
            state: configState,
            saved,
            dataLoaded,
        };
    }, [configState, saved, dataLoaded]);

    React.useEffect(() => {
        console.log('@ new state: ', configState);
    }, [configState]);

    useEffect(() => {
        if (authContext.uid) {
            const docRef = firebase.firestore().collection('auto-order-user-configs').doc(authContext.uid);
            docRef.get().then(data => {
                if (!data.exists) {
                    docRef.set(prepareConfigForServer({
                        ...defaultConfigState,
                        systemName: authContext.displayName || '',
                        customName: authContext.displayName || '',
                    }));
                } else {
                    const newKeys = prepareConfigForServer(
                        pickBy(defaultConfigState, (val, key) => !(key in data.data()!)) as LocalConfigState
                    );
                    if (Object.keys(newKeys).length) {
                        docRef.update({
                            ...data.data(),
                            ...newKeys,
                        });
                    }
                }
                console.log('@initial Configuration: ', data.data());
                const initialConfigState = {
                    ...defaultConfigState,
                    systemName: authContext.displayName || '',
                    customName: authContext.displayName || '',
                    ...(data.exists ? data.data() : undefined),
                };
                setConfigState(initialConfigState);
                serverConfigStateRef.current = initialConfigState;
                setDataLoaded(true);
            });
        }
    }, [authContext.uid, authContext.displayName]);

    useEffect(() => {
        if (authContext.uid && dataLoaded) {
            if (!configState.dontSaveOnServer) {
                clearTimeout(timerIdRef.current);

                timerIdRef.current = window.setTimeout(() => {

                    console.log('local config: ', configState);
                    console.log('server state: ', serverConfigStateRef.current);

                    const preparedData = prepareConfigForServer(configState);
                    if (!isEqual(preparedData, serverConfigStateRef.current)) {

                        console.log('@Send to server: ', preparedData);

                        firebase.firestore().collection('auto-order-user-configs').doc(authContext.uid)
                        .update(preparedData)
                        .then(() => {
                            setSaved(s => ++s);
                            serverConfigStateRef.current = preparedData;
                        });
                    }
                }, saveConfigInactivityTimeout);
            }
        }
    }, [configState, dataLoaded, authContext.uid, serverConfigStateRef]);

    return (
        <ConfigStateContext.Provider value={ configContextValue }>
            <ConfigUpdateContext.Provider value={ updateState }>
                { children }
            </ConfigUpdateContext.Provider>
        </ConfigStateContext.Provider>
    );
};
