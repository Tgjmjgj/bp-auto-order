import React, { useEffect } from 'react';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import pickBy from 'lodash/pickBy';
import eq from 'fast-deep-equal';

import { AutoAuthContext } from './AutoAuthProvider';
import { ConfigState, RandomOrderConfig } from '../../types/autoOrderConfigs';
import { randomId } from '../utils';

export type OrderTarget = {
    key: string
    displayName: string
};

export type ConfigContextData = {
    state: LocalConfigState
    updateState: (stateUpdate: Partial<ConfigState>) => void
    saved: number                   // value changes when config successfully saved on server
    dataLoaded: boolean
};

export type LocalConfigState = ConfigState & {
    saveOnServer: boolean           // indicates does we need to initiate saving operation or not
};

const defaultKumirTarget = { id: 'kumir', displayName: 'Ку-мир', isSystem: true };
const defaultChanakhiTarget = { id: 'chanakhi', displayName: 'Чанахи', isSystem: false };

const defaultPreset = {
    id: randomId(),
    name: 'Default preset',
    items: [
        { id: randomId(), name: 'Cувлаки', price: 140, quantity: 2, target: defaultChanakhiTarget.id },
    ],
};

const defaultRandomConfig: RandomOrderConfig = {
    id: randomId(),
    name: 'Default Config',
    config: {
        total: {
            cost: { min: 270, mid: 300, max: 330 },
            minItems: 1,
            maxItems: 5,
        },
        selectFromTargets: [ defaultKumirTarget.id ],
        targetsData: {
            [defaultKumirTarget.id]: {
                categories: {
                    'Хлеб': { weight: 0, minItems: 0, maxItems: 0 },
                    'Одноразовая посуда': { weight: 0, minItems: 0, maxItems: 0 },
                    'Соусы и приправы': { weight: 0, minItems: 0, maxItems: 0 },
                    'Десерты, выпечка': { weight: 0, minItems: 0, maxItems: 0 },
                    'Буфетная продукция': { weight: 0, minItems: 0, maxItems: 0 },
                    'Напитки': { weight: 0, minItems: 0, maxItems: 0 },
                },
                items: {
                    '"Бульон мясной с сухариками" (300/25г)': { weight: 0, minItems: 0, maxItems: 0 },
                    '"Сладкий Орешек" (240г)': { weight: 0, minItems: 0, maxItems: 0 },
                    '"Сырник Шоколад" (220г)': { weight: 0, minItems: 0, maxItems: 0 },
                    'Каша рисовая с яблоками и ванилью (250г)': { weight: 0, minItems: 0, maxItems: 0 },
                    'Смузи клубнично-банановый (300г)': { weight: 0, minItems: 0, maxItems: 0, },
                    'Хлебцы ржаные (100г)': { weight: 0, minItems: 0, maxItems: 0 },
                    'Блинчики с мёдом (3/40/30г)': { weight: 0, minItems: 0, maxItems: 0 },
                },
            },
        },
    },
};

export const defaultConfigState: LocalConfigState = {
    saveOnServer: false,

    enabled: false,
    spreadsheetId: '16A8ybyTrCyH6L3okYUgZW-GpYYPqttLj4PhSDYBPlYA',
    mode: 'preset',
    selectedPresets: [ defaultPreset.id ],
    presets: [ defaultPreset ],
    savedTargets: [ defaultKumirTarget, defaultChanakhiTarget ],
    randomConfigs: [ defaultRandomConfig ],
    selectedConfig: defaultRandomConfig.id,
    overwriteAlways: false,
    allowMultipleOrders: false,
};

const omitProperties = ['saveOnServer'];
const prepareConfigForServer = (conf: LocalConfigState) => {
    return pickBy(conf, (val, key) => !omitProperties.includes(key)) as ConfigState;
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
    const [configState, setConfigState] = React.useState<LocalConfigState>(defaultConfigState);
    const [saved, setSaved] = React.useState(0);
    const [dataLoaded, setDataLoaded] = React.useState(false);
    const serverConfigStateRef = React.useRef<ConfigState>(defaultConfigState);
    const timerIdRef = React.useRef(0);

    const configContextValue = React.useMemo(() => {
        return {
            state: configState,
            updateState: (stateUpdate: Partial<ConfigState>) => {
                setConfigState({
                    ...configState,
                    ...stateUpdate,
                    saveOnServer: true,
                });
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
            const docRef = firebase.firestore().collection('auto-order-configs').doc(authContext.uid);
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
                    saveOnServer: false,
                };
                setConfigState(initialConfigState);
                serverConfigStateRef.current = initialConfigState;
                setDataLoaded(true);
            });
        }
    }, [authContext.uid, authContext.displayName]);

    useEffect(() => {
        if (authContext.uid) {
            if (configState.saveOnServer) {
                clearTimeout(timerIdRef.current);

                timerIdRef.current = window.setTimeout(() => {

                    console.log('local config: ', configState);
                    console.log('server state: ', serverConfigStateRef.current);

                    const preparedData = prepareConfigForServer(configState);
                    if (!eq(preparedData, serverConfigStateRef.current)) {

                        console.log('@Send to server: ', preparedData);

                        firebase.firestore().collection('auto-order-configs').doc(authContext.uid)
                        .update(preparedData)
                        .then(() => {
                            setSaved(s => ++s);
                            serverConfigStateRef.current = configState;
                        });
                    }
                }, saveConfigInactivityTimeout);
            }
        }
    }, [configState, authContext.uid, serverConfigStateRef]);

    return (
        <ConfigStateContext.Provider value={ configContextValue }>
            { children }
        </ConfigStateContext.Provider>
    );
};
