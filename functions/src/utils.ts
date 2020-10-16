import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';

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

export const log = (data: any): void => {
    functions.logger.info(data, {structuredData: true});
};

export const customDateFormat = 'yyyy-MM-dd';

export const checkDate = (forDate: string) => {
    try {
        const date = DateTime.fromFormat(forDate, customDateFormat);
        if (!date.isValid) {
            throw Error();
        }
        const dateDiff = date.diffNow(['month', 'day']);
        if (dateDiff.months < 0) {
            throwError('invalid-argument', 'You can retrieve menu only for past priods no longer than 1 month from today.');
        }
        if (dateDiff.months > 0 || dateDiff.days > 7) {
            throwError('invalid-argument', 'You can retrieve menu only for future periods no longer than 1 week from today.');
        }
    } catch (e) {
        throwError('invalid-argument', `Date is invalid. Expected string format: "${customDateFormat}"`, e);
    }
};
