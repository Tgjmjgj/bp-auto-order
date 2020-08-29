import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';

import { placeOrder as placeOrderFn } from './placeOrder';
import { scheduledPlacement as scheduledPlacementFn } from './scheduledPlacement';
import { getRandomOrder as getRandomOrderFn } from './getRandomOrder';
import { getUpdatedMenu as getUpdatedMenuFn } from './getUpdatedMenu';

process.env.APIFY_MEMORY_MBYTES = '256';

FirebaseAdmin.initializeApp();

export const placeOrder = functions.region('europe-west1').https.onCall(async (data, context) => await placeOrderFn(data));

export const getRandomOrder = functions.region('europe-west1').https.onCall(async (data, context) => await getRandomOrderFn(data.target, data.items));

export const getUpdatedMenu = functions.region('europe-west1').https.onCall(async (data, context) => await getUpdatedMenuFn(data.target));

export const scheduledPlacement =
    functions.region('europe-west1')
    .pubsub.schedule('00 15 * * 1,3').timeZone('Europe/Moscow')
    .onRun(() => scheduledPlacementFn());
