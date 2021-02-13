import React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { AutoAuthContext } from './AutoAuthProvider';
import { OrderHistory } from '../../types/autoOrderHistory';

type DataLoadingStatus = 'not-loaded' | 'loading' | 'error' | 'loaded';

export type OrderHistoryData = {
    data: OrderHistory
    dataLoadingStatus: DataLoadingStatus
    updateFreshData: () => void

};

const defaultOrderHistory = {};

const defaultOrderHistoryContextData: OrderHistoryData = {
    data: defaultOrderHistory,
    dataLoadingStatus: 'not-loaded',
    updateFreshData: () => {},
};

export const OrderHistoryStateContext = React.createContext<OrderHistoryData>(defaultOrderHistoryContextData);

export const OrderHistoryProvider: React.FC = ({ children }) => {

    const authContext = React.useContext(AutoAuthContext);
    const [orderHistoryData, setOrderHistoryData] = React.useState<OrderHistory>(defaultOrderHistory);
    const [dataLoadingStatus, setDataLoadingStatus] = React.useState<DataLoadingStatus>('not-loaded');


    React.useEffect(() => {
        if (authContext.uid) {
            setDataLoadingStatus('loading');
            const docRef = firebase.firestore().collection('auto-order-history').doc(authContext.uid);
            docRef.get().then(data => {
                if (!data.exists) {
                    docRef.set(defaultOrderHistory);
                } else {
                    console.log('Load order history: ', data.data());
                    setOrderHistoryData(data.data() as OrderHistory);
                }
                setDataLoadingStatus('loaded');
            }).catch((e) => {
                setDataLoadingStatus('error');
                console.error('Unable to load order history data: ', e);
            });
        } else {
            setOrderHistoryData(defaultOrderHistory);
            setDataLoadingStatus('not-loaded');
        }
    }, [authContext.uid]);

    const updateFreshData = React.useCallback(() => {
        const docRef = firebase.firestore().collection('auto-order-history').doc(authContext.uid);
        docRef.get().then(data => {
            if (data.exists) {
                setOrderHistoryData(data.data() as OrderHistory);
            }
            setDataLoadingStatus('loaded');
        }).catch((e) => {
            setDataLoadingStatus('loaded');
            console.warn('Unable to update order history data: ', e);
        });
    }, [authContext.uid]);

    const contextValue = React.useMemo<OrderHistoryData>(() => ({
        data: orderHistoryData,
        dataLoadingStatus,
        updateFreshData,
    }), [
        orderHistoryData,
        dataLoadingStatus,
        updateFreshData,
    ]);

    return (
        <OrderHistoryStateContext.Provider value={ contextValue }>
            { children }
        </OrderHistoryStateContext.Provider>
    );
};
