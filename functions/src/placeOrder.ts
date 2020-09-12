import * as functions from 'firebase-functions';
import { google, sheets_v4 } from 'googleapis';
import cyrillicToTranslit from 'cyrillic-to-translit-js';
import levenshtein from 'js-levenshtein'
import faker from 'faker';
import capitalize from 'lodash/capitalize';
import groupBy from 'lodash/groupBy';
import chunk from 'lodash/chunk';
import uniq from 'lodash/uniq';
import get from 'lodash/get';

import { throwError } from './utils';
import { PlaceOrderData } from '../../types/autoOrderConfigs';

const randomName = () => `${capitalize(faker.hacker.adjective())} ${capitalize(faker.hacker.noun())}`;

const getLastFilledRow = async (api: sheets_v4.Sheets, spreadsheetId: string): Promise<number> => {
    try {
        const bulkSize = 300;
        let foundRow = 0;
        const sheetData = await api.spreadsheets.get({ spreadsheetId });
        const maxRow = get(sheetData, 'data.sheets[0].properties.gridProperties.rowCount');
        const range = `D${maxRow - bulkSize}:D${maxRow}`;
        const {data} = await api.spreadsheets.get({
            spreadsheetId,
            includeGridData: true,
            ranges: [range],
        });
        if (data.sheets && data.sheets.length) {
            if (data.sheets[0].data && data.sheets[0].data.length) {
                const rowData = data.sheets[0].data[0].rowData;
                if (rowData) {
                    let value = null;
                    let i = rowData.length - 1;
                    do {
                        if (rowData[i] && rowData[i].values && rowData[i].values![0]) {
                            value = rowData[i].values![0].userEnteredValue;
                        }
                        --i;
                    } while (!value && i >=0);
                    foundRow = maxRow - bulkSize + i + 2;
                    if (!value) {
                        functions.logger.warn('Unable to locale last filled row, or spreadsheet is empty, for range ' + range);
                    }
                }
            } else {
                throwError('not-found', `Cannot retreive spreadsheet ${spreadsheetId} range data ${range}`);
            }
        } else {
            throwError('not-found', `Cannot find spreadsheet pages in the document with id ${spreadsheetId}`);
        }

        const packSize = 5;
        let rowShift = 0;
        do {
            foundRow += rowShift;
            rowShift = 0;
            const getResult = await api.spreadsheets.get({
                spreadsheetId,
                includeGridData: true,
                ranges: [`B${foundRow}:M${foundRow + packSize}`],
            });
            const rowData = get(getResult.data, 'sheets[0].data[0].rowData');

            for (let i = rowData.length - 1; i >= 0; --i) {
                if (rowData[i].values && rowData[i].values.length) {
                    functions.logger.info(rowData[i].values);
                    const filledRowsNumber = rowData[i].values.filter((cell: sheets_v4.Schema$CellData) => cell.userEnteredValue).length;
                    if (filledRowsNumber !== 0) {
                        rowShift = i + 1;
                        break;
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

type RowNames = {
    row: number
    lines: number
    limited: boolean
    name: string
};

const maxNamesAllowed = 40;
const ijColumnTargets = ['всего', 'total'];

const checkExistedOrder = async (api: sheets_v4.Sheets, names: string[], lastRowNumber: number, spreadsheetId: string): Promise<RowNames | null> => {
    try {
        const {data} = await api.spreadsheets.get({
            spreadsheetId,
            includeGridData: true,
            ranges: [
                `D${lastRowNumber - 100}:D${lastRowNumber}`,
                `I${lastRowNumber - 100}:I${lastRowNumber}`,
                `J${lastRowNumber - 100}:J${lastRowNumber}`,
            ],
        });
        const namesDataD = get(data, 'sheets[0].data[0].rowData');
        const totalDataI = get(data, 'sheets[0].data[1].rowData');
        const totalDataJ = get(data, 'sheets[0].data[2].rowData');

        functions.logger.info(totalDataI, {structuredData: true});
        const rowNames: RowNames[] = [];
        let foundTotalLabel = false;
        let i = namesDataD.length - 1;
        do {
            const name = get(namesDataD[i], 'values[0].userEnteredValue.stringValue');
            if (typeof name === 'string') {
                const formattedName = name.toLowerCase().trim();
                const prevNameData = rowNames.length && rowNames[rowNames.length - 1];
                if (prevNameData && ['', '↑', formattedName].includes(prevNameData.name)) {
                    prevNameData.name = formattedName;
                    prevNameData.lines++;
                    prevNameData.row--;
                } else {
                    rowNames.push({
                        row: lastRowNumber - namesDataD.length + i + 1,
                        lines: 1,
                        limited: !!rowNames.length,
                        name: formattedName,
                    });
                }
            }
            const totalLabel1: string | undefined = get(totalDataI[i], 'values[0].userEnteredValue.stringValue');
            if (totalLabel1 && ijColumnTargets.find(targetMark => totalLabel1.toLowerCase().trim().includes(targetMark))) {
                foundTotalLabel = true;
            }
            const totalLabel2: string | undefined = get(totalDataJ[i], 'values[0].userEnteredValue.stringValue');
            if (totalLabel2 && ijColumnTargets.find(targetMark => totalLabel2.toLowerCase().trim().includes(targetMark))) {
                foundTotalLabel = true;
            }
            i--;
        } while (rowNames.length < maxNamesAllowed && !foundTotalLabel);

        functions.logger.info(rowNames, {structuredData: true});

        const translit = new cyrillicToTranslit();
        const nameVariants = uniq(names.reduce<string[]>((total, next) => {
            const lName = next.toLowerCase().trim();
            const translitName = translit.transform(lName);
            total.push(translitName);
            total.push(translit.reverse(translitName));
            const splits = lName.split(' ').filter(namePart => namePart);
            if (splits.length > 1) {
                const reversedName = `${splits[1]} ${splits[0]}`;
                const translitReversedName = translit.transform(lName);
                total.push(reversedName);
                total.push(translitReversedName);
                total.push(translit.reverse(translitReversedName));
            }
            total.push(...splits);
            return total;
        }, []));

        const foundRowName = rowNames.find(rowName => {
            return !!nameVariants.find(name => levenshtein(rowName.name, name) < 3);
        }) || null;

        functions.logger.info(`Found name: ${foundRowName && foundRowName.name} on row ${foundRowName && foundRowName.row} for [${nameVariants.join(', ')}]`);
        return foundRowName;
    } catch (e) {
        throwError('unknown', 'Unknown Error in checking of the order existence', e);
    }
    return null;
};

const transformRawDataToTableRows = (order: PlaceOrderData): string[][] => {
    try {
        const tableRows =
            (Object.values(groupBy(order.items, item => item.target))
            .map(targetItems => {
                const validTargetItems = targetItems.filter(item => item.name);
                if (!validTargetItems.length) {
                    return null;
                }
                const orderItemGroups = chunk(validTargetItems.map(item => {
                    let itemDisplayName = item.name;
                    if (item.price) {
                        itemDisplayName += ` ${item.price}р.`;
                    }
                    if ((item.quantity || 1) > 1) {
                        itemDisplayName += ` x${item.quantity}`;
                    }
                    return itemDisplayName;
                }) as string[], 6);
                while (orderItemGroups[orderItemGroups.length - 1].length < 6) {
                    orderItemGroups[orderItemGroups.length - 1].push('');
                }
                const rows = orderItemGroups.map(itemGroup => {
                    return ['', '', '↑', ...itemGroup, '', '', ''];
                });
                const relatedTarget = order.targets && order.targets.length &&
                    order.targets.find(target => target.id === validTargetItems[0].target);
                const targetName = relatedTarget ? relatedTarget.displayName : '';
                const totalCostIndex = validTargetItems[0].target === 'chanakhi' ? 9 : validTargetItems[0].target === 'kumir' ? 10 : 11;
                const totalCostValue = validTargetItems.reduce((sum, item) => {
                    const addition = Number(item.price!) * Number(item.quantity!);
                    return sum + (Number.isNaN(addition) ? 0 : addition);
                }, 0);
                rows.forEach((row, i) => {
                    row[0] = i === 0 ? targetName : '↑';
                    row[totalCostIndex] = i === rows.length - 1 ? totalCostValue === 0 ? '?' : totalCostValue.toString() : '↓';
                });
                return rows;
            }).filter(rowsGroup => rowsGroup) as string[][][]).reduce((rows, rowsGroup) => {
                rows.push(...rowsGroup);
                return rows;
            }, []);
            const name = order.customName || order.systemName || randomName();
            tableRows[0][2] = name;
            return tableRows;
        } catch (e) {
            throwError('unknown', 'Unknown error in raw data transformation', e);
        }
        return [];
};

const writeTableRows = async (api: sheets_v4.Sheets, spreadsheetId: string, tableRows: string[][], rowNumber: number) => {
    const range = `B${rowNumber}:M${rowNumber + tableRows.length - 1}`;
    const res = await api.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: tableRows,
            range,
            majorDimension: 'ROWS',
        },
    });
    functions.logger.info(`Successfull row ${rowNumber} - ${rowNumber + tableRows.length - 1} insertion`);
    if (res.status !== 200) {
        throwError('aborted', `Insert order to row ${rowNumber} failed: ${res.data}`);
    }
};

const writeOrderToLastRow = async (api: sheets_v4.Sheets, orderData: PlaceOrderData, lastRowNumber: number) => {
    try {
        const tableRows = transformRawDataToTableRows(orderData);
        await writeTableRows(api, orderData.spreadsheetId, tableRows, lastRowNumber);
    } catch (e) {
        throwError('unknown', 'Unknown Error in writing order into the spreadsheet', e);
    }
    return null;
};

const clearRows = async (api: sheets_v4.Sheets, spreadsheetId: string, fromRow: number, toRow: number) => {
    const range = `B${fromRow}:M${toRow}`;
    console.log(`Cleare rows on range ${range}`);
    const res = await api.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: Array(toRow - fromRow).fill(Array(12).fill('')),
            range,
            majorDimension: 'ROWS',
        },
    });
    if (res.status !== 200) {
        throwError('aborted', `Clearing rows from ${fromRow} to ${toRow} failed`, res.data);
    }
};

const overwriteOrderToRow = async (api: sheets_v4.Sheets, orderData: PlaceOrderData, foundRow: RowNames, lastRowNumber: number) => {
    try {
        const tableRows = transformRawDataToTableRows(orderData);
        await clearRows(api, orderData.spreadsheetId, foundRow.row, foundRow.row + foundRow.lines);
        if (tableRows.length > foundRow.lines) {
            await writeTableRows(api, orderData.spreadsheetId, tableRows, lastRowNumber);
            return lastRowNumber;
        } else {
            await writeTableRows(api, orderData.spreadsheetId, tableRows, foundRow.row);
            return foundRow.row;
        }
    } catch (e) {
        throwError('unknown', 'Unknown Error in overwriting an existing order in the spreadsheet', e);
    }
    return -1;
};

export const placeOrder = async (data: PlaceOrderData): Promise<number> => {
    const spreadsheetId = data.spreadsheetId;
    if (!spreadsheetId) {
        throwError('invalid-argument', 'No spreadsheetId in the request');
        return -1;
    }
    if (!data.items || !data.items.length) {
        throwError('invalid-argument', 'Trying to place an empty order (no items)');
        return -1;
    }
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const api = google.sheets({ version: 'v4', auth });
    const lastRow = await getLastFilledRow(api, spreadsheetId);
    const names = [data.systemName, data.customName].filter(name => name) as string[];
    let writtenToRow = -1;
    let foundRowName = null;
    if (!data.allowMultiple) {
        foundRowName = await checkExistedOrder(api, names, lastRow, spreadsheetId);
    }
    if (foundRowName) {
        if (data.overwrite) {
            writtenToRow = await overwriteOrderToRow(api, data, foundRowName, lastRow);
        } else {
            throwError('already-exists', 'Your order already exists');
        }
    } else {
        await writeOrderToLastRow(api, data, lastRow);
        writtenToRow = lastRow;
    }
    return writtenToRow;
};
