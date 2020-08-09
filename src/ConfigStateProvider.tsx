import React, { useEffect } from 'react';
import * as Firebase from 'firebase';
import pickBy from 'lodash/pickBy';
import eq from 'fast-deep-equal';


import { AutoAuthContext } from './AutoAuthProvider';


export type ConfigState = {
    enabled: boolean
    saveOnServer: boolean     // indicates do we need to initiate saving operation or not
    displayName?: string | null
};

export type ConfigContextData = {
    state: ConfigState
    updateState: (stateUpdate: Partial<ConfigState>) => void
    saved: number           // value changes when config successfully saved on server
};

const defaultConfigState = {
    enabled: false,
    saveOnServer: false,
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
    const [oldConfigState, setOldConfigState] = React.useState<ConfigState>(defaultConfigState);
    const [saved, setSaved] = React.useState(0);

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
    }), [configState, setConfigState, saved]);

    useEffect(() => {
        if (authContext.uid) {
            const docRef = Firebase.firestore().collection('auto-order-configs').doc(authContext.uid);
            docRef.get().then(data => {
                if (data.get('displayName') !== authContext.displayName) {
                    docRef.set(prepareConfigForServer({
                        ...configState,
                        displayName: authContext.displayName,
                    }), {merge: true})
                }
                console.log('### initial data: ', data.data());
                setConfigState({
                    ...configState,
                    displayName: authContext.displayName,
                    ...(data.exists ? data.data() : undefined),
                    saveOnServer: false,
                });
            });
        }
    }, [authContext]);

    let timerId = 0;
    useEffect(() => {
        console.log('Timer Id: ', timerId);
        if (authContext.uid && !eq(configState, oldConfigState)) {
            if (configState.saveOnServer) {
                console.log('save config: ', configState);
                console.log('old state: ', oldConfigState);
                clearTimeout(timerId);
                timerId = window.setTimeout(() => {
                    Firebase.firestore().collection('auto-order-configs').doc(authContext.uid)
                    .set(prepareConfigForServer(configState), {merge: true})
                    .then(() => setSaved(s => ++s));
                }, saveConfigInactivityTimeout);
            }
            setOldConfigState(configState);
        }
    }, [configState, authContext.uid]);

    return (
        <ConfigStateContext.Provider value={ configContextValue }>
            { children }
        </ConfigStateContext.Provider>
    );
}
