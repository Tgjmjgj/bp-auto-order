import * as firebase from 'firebase/app';
import 'firebase/functions';
import { OrderItem, PlaceOrderData } from '../../types/autoOrderConfigs';
import { AnyMenuItem } from '../../types/autoOrderMenus';

export const placeOrder = (payload: PlaceOrderData): Promise<{ data: number }> =>
    firebase.app().functions('europe-west1').httpsCallable('placeOrder')(payload);

export const getRandomOrder = (target: string, date: string, items?: OrderItem[]): Promise<{ data: OrderItem[] }> =>
    firebase.app().functions('europe-west1').httpsCallable('getRandomOrder')({target, date, items})

export const getUpdatedMenu = (target: string, date: string): Promise<{ data: AnyMenuItem[] }> =>
    firebase.app().functions('europe-west1').httpsCallable('getUpdatedMenu')({target, date});
