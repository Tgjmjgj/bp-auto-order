import React, { useEffect } from 'react';
import * as Firebase from 'firebase';
import pickBy from 'lodash/pickBy';
import eq from 'fast-deep-equal';

import { AutoAuthContext } from './AutoAuthProvider';

export type OrderTarget = {
    key: string
    displayName: string
};

export const authOrderMode = ['preset', 'random'] as const;
export type AutoOrderMode = typeof authOrderMode[number];

export type ConfigState = {
    enabled: boolean
    saveOnServer: boolean       // indicates do we need to initiate saving operation or not
    spreadsheetId: string
    mode: AutoOrderMode
    presets: OrderPreset[]
    selectedPresets: number[]
    savedTargets: OrderTarget[]
    systemName?: string
    customName?: string
};

export type ConfigContextData = {
    state: ConfigState
    updateState: (stateUpdate: Partial<ConfigState>) => void
    saved: number               // value changes when config successfully saved on server
    dataLoaded: boolean
};

export type OrderPreset = {
    name: string
    items: OrderItem[]
};

export type OrderItem = {
    name: string
    price: number
    quantity: number
    target: string
};

const defaultConfigState: ConfigState = {
    enabled: false,
    saveOnServer: false,
    spreadsheetId: '16A8ybyTrCyH6L3okYUgZW-GpYYPqttLj4PhSDYBPlYA',
    mode: 'preset',
    selectedPresets: [0],
    presets: [
        {
            name: 'Default preset',
            items: [
                { name: 'Cувлаки', price: 140, quantity: 2, target: 'chanakhi' },
            ],
        },
    ],
    savedTargets: [
        { key: 'kumir', displayName: 'Ку-мир' },
        { key: 'chanakhi', displayName: 'Чанахи' },
    ],
};

const omitProperties = ['saveOnServer'];
const prepareConfigForServer = (conf: ConfigState) => {
    return pickBy(conf, (val, key) => !omitProperties.includes(key));
};

const defaultConfigContextData = {
    state: defaultConfigState,
    updateState: () => {},
    saved: 0,
    dataLoaded: false,
};

const saveConfigInactivityTimeout = 3000;

export const ConfigStateContext = React.createContext<ConfigContextData>(defaultConfigContextData);

export const ConfigStateProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const [configState, setConfigState] = React.useState<ConfigState>(defaultConfigState);
    const [saved, setSaved] = React.useState(0);
    const [dataLoaded, setDataLoaded] = React.useState(false);
    const oldConfigStateRef = React.useRef<ConfigState>(defaultConfigState);
    const timerIdRef = React.useRef(0);

    const configContextValue = React.useMemo(() => {
        return {
            state: configState,
            updateState: (stateUpdate: Partial<ConfigState>) => {
                const newState = {
                    ...configState,
                    ...stateUpdate,
                    saveOnServer: true,
                };
                setConfigState(newState);
            },
            saved,
            dataLoaded,
        };
    }, [configState, saved, dataLoaded]);

    React.useEffect(() => {
        console.log('@ new state: ', configState);
    }, [configState]);

    useEffect(() => {
        if (authContext.uid) {
            const docRef = Firebase.firestore().collection('auto-order-configs').doc(authContext.uid);
            docRef.get().then(data => {
                if (!data.exists) {
                    docRef.set(prepareConfigForServer({
                        ...defaultConfigState,
                        systemName: authContext.displayName || '',
                        customName: authContext.displayName || '',
                    }), {merge: true});
                } else {
                    const newKeys = prepareConfigForServer(pickBy(defaultConfigState, (val, key) => !(key in data.data()!)) as ConfigState);
                    if (Object.keys(newKeys).length) {
                        docRef.set({
                            ...data.data(),
                            ...newKeys,
                        });
                    }
                }
                console.log('### initial data: ', data.data());
                setConfigState({
                    ...defaultConfigState,
                    systemName: authContext.displayName || '',
                    customName: authContext.displayName || '',
                    ...(data.exists ? data.data() : undefined),
                    saveOnServer: false,
                });
                setDataLoaded(true);
            });
        }
    }, [authContext]);

    useEffect(() => {
        console.log('Timer Id: ', timerIdRef.current);
        if (authContext.uid && !eq(configState, oldConfigStateRef.current)) {
            if (configState.saveOnServer) {
                console.log('save config: ', configState);
                console.log('old state: ', oldConfigStateRef.current);
                clearTimeout(timerIdRef.current);
                timerIdRef.current = window.setTimeout(() => {
                    const preparedData = prepareConfigForServer(configState);
                    console.log('@Send to server: ', preparedData);
                    Firebase.firestore().collection('auto-order-configs').doc(authContext.uid)
                    .set(preparedData, {merge: true})
                    .then(() => setSaved(s => ++s));
                }, saveConfigInactivityTimeout);
            }
            oldConfigStateRef.current = configState;
        }
    }, [configState, authContext.uid, oldConfigStateRef]);

    return (
        <ConfigStateContext.Provider value={ configContextValue }>
            { children }
        </ConfigStateContext.Provider>
    );
}
