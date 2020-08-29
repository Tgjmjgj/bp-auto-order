import * as firebase from 'firebase/app';
import 'firebase/functions';
import { OrderItem } from '../../types/autoOrderConfigs';
import { Menu } from '../../types/autoOrderMenus';

export const placeOrder = (payload: any): Promise<{ data: number }> =>
    firebase.app().functions('europe-west1').httpsCallable('placeOrder')(payload);

export const getRandomOrder = (payload: { target: string }): Promise<{ data: OrderItem[] }> =>
    firebase.app().functions('europe-west1').httpsCallable('getRandomOrder')(payload)

export const getUpdatedMenu = (payload: { target: string }): Promise<{ data: Menu }> =>
    firebase.app().functions('europe-west1').httpsCallable('getUpdatedMenu')(payload);
