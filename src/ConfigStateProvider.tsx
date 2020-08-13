import React, { useEffect } from 'react';
import * as Firebase from 'firebase';
import pickBy from 'lodash/pickBy';
import eq from 'fast-deep-equal';

import { AutoAuthContext } from './AutoAuthProvider';


export type ConfigState = {
    enabled: boolean
    saveOnServer: boolean     // indicates do we need to initiate saving operation or not
    spreadsheetId: string
    defaultOrder: OrderItem[]
    systemName?: string
    customName?: string
};

export type ConfigContextData = {
    state: ConfigState
    updateState: (stateUpdate: Partial<ConfigState>) => void
    saved: number           // value changes when config successfully saved on server
};

export type OrderItem = {
    name: string
    price: number
    quantity: number
};

const defaultConfigState: ConfigState = {
    enabled: false,
    saveOnServer: false,
    spreadsheetId: '16A8ybyTrCyH6L3okYUgZW-GpYYPqttLj4PhSDYBPlYA',
    defaultOrder: [{ name: 'Cувлаки', price: 140, quantity: 2 }],
};

const omitProperties = ['saveOnServer'];
const prepareConfigForServer = (conf: ConfigState) => {
    return pickBy(conf, (val, key) => !omitProperties.includes(key));
};

const defaultConfigContextData = {
    state: defaultConfigState,
    updateState: () => {},
    saved: 0,
};

const saveConfigInactivityTimeout = 5000;

export const ConfigStateContext = React.createContext<ConfigContextData>(defaultConfigContextData);

export const ConfigStateProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const [configState, setConfigState] = React.useState<ConfigState>(defaultConfigState);
    const [saved, setSaved] = React.useState(0);
    const oldConfigStateRef = React.useRef<ConfigState>(defaultConfigState);
    const timerIdRef = React.useRef(0);

    const configContextValue = React.useMemo(() => ({
        state: configState,
        updateState: (stateUpdate: Partial<ConfigState>) => {
            setConfigState({
                ...configState,
                ...stateUpdate,
                saveOnServer: true,
            });
        },
        saved,
    }), [configState, saved]);

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
                    const newKeys = prepareConfigForServer(pickBy(defaultConfigState, (key: string) => !(key in data.data()!)) as ConfigState);
                    if (Object.keys(newKeys).length) {
                        docRef.set({
                            ...defaultConfigState,
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
                    Firebase.firestore().collection('auto-order-configs').doc(authContext.uid)
                    .set(prepareConfigForServer(configState), {merge: true})
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
