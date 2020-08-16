import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';

import { placeOrder } from './placeOrder';
import { scheduledPlacement } from './scheduledPlacement';
import { scrapKumirMenu } from './scrapKumirMenu';

FirebaseAdmin.initializeApp();

export default {
    placeOrder: functions.region('europe-west1').https.onRequest(async (request, response) => {
        const result = await placeOrder(request.body);
        response.status(result.status).send(result.data);
    }),
    scheduledPlacement: functions.region('europe-west1').pubsub.schedule('00 15 * * 1,3').timeZone('Europe/Moscow').onRun(scheduledPlacement),
    tmpScrap: functions.region('europe-west1').https.onRequest(async (request, response) => {
        const result = await scrapKumirMenu();
        response.status(200).send(result);
    }),
};
