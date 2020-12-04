import * as functions from 'firebase-functions';
import get from 'lodash/get';

import { placeOrder as placeOrderFn } from './spreadsheets/placeOrder';
import { scheduledPlacement as scheduledPlacementFn } from './scheduledPlacement';
import { getRandomOrder as getRandomOrderFn } from './getRandomOrder';
import { getUpdatedMenu as getUpdatedMenuFn } from './getUpdatedMenu';
import { getAvailableMenu as getAvailableMenuFn } from './getAvailableMenu';


export const placeOrder = functions.region('europe-west1').https.onCall(async (data, context) => await placeOrderFn(get(context, 'auth.uid'), data));

export const getRandomOrder = functions.region('europe-west1').https.onCall(async (data, context) => 
    await getRandomOrderFn(get(context, 'auth.uid'), data.target, data.date, data.items),
);

export const getUpdatedMenu = functions.region('europe-west1').runWith({memory: '1GB'}).https.onCall(async (data, context) => await getUpdatedMenuFn(data.target, data.date));

export const getAvailableMenu = functions.region('europe-west1').https.onCall(async (data, context) => await getAvailableMenuFn(data.target, data.date));

export const scheduledPlacement =
    functions.region('europe-west1')
    .pubsub.schedule('00 15 * * 1,3').timeZone('Europe/Moscow')
    .onRun(() => scheduledPlacementFn());
