import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';

import { placeOrder } from './placeOrder';
import { scheduledPlacement } from './scheduledPlacement';
import { getRandomOrder } from './getRandomOrder';
import { getUpdatedMenu } from './getUpdatedMenu';

process.env.APIFY_MEMORY_MBYTES = '256';

FirebaseAdmin.initializeApp();

export default {
    placeOrder: functions.region('europe-west1').https.onRequest(async (request, response) => {
        const result = await placeOrder(request.body);
        response.status(result.status).send(result.data);
    }),
    getRandomOrder: functions.region('europe-west1').https.onRequest(async (request, response) => {
        const result = await getRandomOrder(request.body.target);
        response.status(result.status).send(result.data);
    }),
    getUpdatedMenu: functions.region('europe-west1').https.onRequest(async (request, response) => {
        const menuData = await getUpdatedMenu(request.body.target);
        response.status(menuData ? 200 : 500).send(menuData);
    }),
    scheduledPlacement: 
        functions.region('europe-west1')
        .pubsub.schedule('00 15 * * 1,3').timeZone('Europe/Moscow')
        .onRun(() => scheduledPlacement()),
};
