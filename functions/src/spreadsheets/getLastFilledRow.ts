import * as functions from 'firebase-functions';
import { sheets_v4 } from 'googleapis';
import get from 'lodash/get';
import { SpreadsheetData } from '../../../types/autoOrderConfigs';
import { log, throwError } from '../utils';
import { getSheet } from './getSheet';

export const getLastFilledRow = async (api: sheets_v4.Sheets, spreadsheet: SpreadsheetData): Promise<number> => {
    log(`#Call: getLastFilledRow(spreadsheetId = ${spreadsheet.id})`);
    try {
        const bulkSize = 300;
        let foundRow = 0;
        const spreadsheetData = await api.spreadsheets.get({ spreadsheetId: spreadsheet.id });
        const sheetData = getSheet(spreadsheetData.data, spreadsheet.tabHeading); 
        const maxRow = get(sheetData, 'properties.gridProperties.rowCount');
        const rangeTabPrefix = spreadsheet.tabHeading ? `'${spreadsheet.tabHeading}'!` : '';
        log('@maxRow: ', maxRow);
        let fromRow, iter = 0;
        do {
            fromRow = maxRow - (bulkSize * (iter + 1));
            fromRow = fromRow < 1 ? 1 : fromRow;
            const toRow = maxRow - (bulkSize * iter);
            const range = `${rangeTabPrefix}D${fromRow}:D${toRow}`;
            log('Range: ', range);
            const {data} = await api.spreadsheets.get({
                spreadsheetId: spreadsheet.id,
                includeGridData: true,
                ranges: [range],
            });
            const sheetData2 = getSheet(data, spreadsheet.tabHeading);
            if (sheetData2) {
                if (sheetData2.data && sheetData2.data.length) {
                    const rowData = sheetData2.data[0].rowData;
                    if (rowData) {
                        let value = null;
                        let i = rowData.length - 1;
                        do {
                            if (rowData[i] && rowData[i].values && rowData[i].values![0]) {
                                value = rowData[i].values![0].userEnteredValue;
                                if (value) {
                                    foundRow = fromRow + i + 1;
                                    break;
                                }
                            }
                            --i;
                        } while (i >= 0);
                        if (!value) {
                            functions.logger.warn('Unable to locale last filled row, or spreadsheet is empty, for range ' + range);
                        }
                    }
                } else {
                    throwError('not-found', `Cannot retreive spreadsheet ${spreadsheet.id} range data ${range}`);
                }
            } else {
                throwError('not-found', `Cannot find spreadsheet pages in the document with id ${spreadsheet.id}`);
            }
            iter++;
        } while (fromRow !== 1 && !foundRow);

        console.log('@foundRow iter1: ', foundRow);
        const packSize = 5;
        let rowShift = 0;
        do {
            foundRow += rowShift;
            rowShift = 0;
            const getResult = await api.spreadsheets.get({
                spreadsheetId: spreadsheet.id,
                includeGridData: true,
                ranges: [
                    `${rangeTabPrefix}B${foundRow}:M${foundRow + packSize}`,
                ],
            });
            const sheetData3 = getSheet(getResult.data, spreadsheet.tabHeading); 
            const rowData = get(sheetData3, 'data[0].rowData');
            if (rowData) {
                for (let i = rowData.length - 1; i >= 0; --i) {
                    if (rowData[i].values && rowData[i].values.length) {
                        const filledRowsNumber = rowData[i].values.filter((cell: sheets_v4.Schema$CellData) => cell.userEnteredValue).length;
                        if (filledRowsNumber !== 0) {
                            rowShift = i + 1;
                            break;
                        }
                    }
                }
            }
        } while (rowShift);

        functions.logger.info(`Found the next free row: ${foundRow}`);
        return foundRow;

    } catch (e) {
        console.log(e);
        if (get(e, 'errors.message') === 'The caller does not have permission') {
            throwError(
                'permission-denied',
                'This service has no access to the specified spreadsheet. ' +
                    'If you wanna to use non-standard spreadsheet, please, ' +
                    'share it for editing to the "brightpattern-282908@appspot.gserviceaccount.com".',
                e,
            );
        }
        throwError('unknown', 'Unknown Error in last filled row detection', e);
    }
    return -1;
};
