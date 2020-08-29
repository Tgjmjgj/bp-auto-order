import * as functions from 'firebase-functions';

export const randomId = () => Math.random().toString(36).substring(2);

export const throwError = (code: functions.https.FunctionsErrorCode, message: string, details?: any): never => {
    functions.logger.error(message, {structuredData: true});
    throw new functions.https.HttpsError(code, message, details);
};
