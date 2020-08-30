import * as firebase from 'firebase/app';
import 'firebase/functions';
import { OrderItem, PlaceOrderData } from '../../types/autoOrderConfigs';
import { Menu } from '../../types/autoOrderMenus';

export const placeOrder = (payload: PlaceOrderData): Promise<{ data: number }> =>
    firebase.app().functions('europe-west1').httpsCallable('placeOrder')(payload);

export const getRandomOrder = (target: string, items?: OrderItem[]): Promise<{ data: OrderItem[] }> =>
    firebase.app().functions('europe-west1').httpsCallable('getRandomOrder')({target, items})

export const getUpdatedMenu = (target: string): Promise<{ data: Menu }> =>
    firebase.app().functions('europe-west1').httpsCallable('getUpdatedMenu')({target});
