import { google, sheets_v4 } from 'googleapis';
import get from 'lodash/get';
import { getLastFilledRow } from './getLastFilledRow';
import { targetScrappersBaseUrls } from '../scrappers';
import { log, throwError } from '../utils';
import { SpreadsheetData } from '../../../types/autoOrderConfigs';

const initApi = async (): Promise<sheets_v4.Sheets> => {
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const api = google.sheets({ version: 'v4', auth });
    return api;
};

export const autoDetectTarget = async (spreadsheet: SpreadsheetData, apiArg?: sheets_v4.Sheets, lastFilledRowArg?: number): Promise<string | null> => {
    log(`#Call: autoDetectTarget(spreadsheetId = ${spreadsheet.id}, api, lastFilledRow = ${lastFilledRowArg})`);
    if (!spreadsheet.id) {
        throwError('invalid-argument', 'No spreadsheetId in the request');
    }
    const api = apiArg ? apiArg : await initApi();
    const lastFilledRow = lastFilledRowArg !== undefined ? lastFilledRowArg : await getLastFilledRow(api, spreadsheet);
    const rangeTabPrefix = spreadsheet.tabHeading ? `'${spreadsheet.tabHeading}'!` : '';

    try {
        const {data} = await api.spreadsheets.get({
            spreadsheetId: spreadsheet.id,
            includeGridData: true,
            ranges: [
                `${rangeTabPrefix}B${lastFilledRow - 100}:B${lastFilledRow}`,
            ],
        });
        const columnDataB = get(data, 'sheets[0].data[0].rowData');

        let i = columnDataB.length - 1;
        let targetLink: string | null = null;
        do {
            const value = get(columnDataB[i], 'values[0].userEnteredValue.stringValue');
            if (typeof value === 'string') {
                const formattedValue = value.toLowerCase().trim();
                if (formattedValue.startsWith('http')) {
                    targetLink = formattedValue;
                }
            }
            i--;
        } while (!targetLink && i >= 0);

        log('Found target link: ', targetLink);
        if (!targetLink) {
            return null;
        }
        const detectedTarget = Object.keys(targetScrappersBaseUrls).find(target => {
            return targetLink!.trim().startsWith(targetScrappersBaseUrls[target]);
        });
        return detectedTarget || null;

    } catch (e) {
        throwError('unknown', 'Unknown Error in target auto detection', e);
    }
    return null;
};
