import * as functions from 'firebase-functions';

export const randomId = () => Math.random().toString(36).substring(2);

export const throwError = (code: functions.https.FunctionsErrorCode, message: string, e?: any): never => {
    if (e instanceof functions.https.HttpsError) {
        throw e;
    }
    functions.logger.error(message, {structuredData: true});
    if (e) {
        functions.logger.error(e, {structuredData: true});
    }
    throw new functions.https.HttpsError(code, message, e);
};
