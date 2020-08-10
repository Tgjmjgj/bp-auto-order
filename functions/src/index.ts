import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';
import {google, sheets_v4} from 'googleapis';
import get from 'lodash/get';
import chunk from 'lodash/chunk';

const spreadsheetId = '1S-gWGUUqDzfBUUZNRo2UjlHR8kw9LrKQ-I_PvH7nXB4'; // tmp

FirebaseAdmin.initializeApp();

type StaticTarget = 'kumir' | 'chanakhi';

type ExpectedRequestData = {
    target?: StaticTarget
    name?: string
    items?: string[]
    totalCost?: string
};

const getLastFilledRow = async (api: sheets_v4.Sheets) => {
    const bulkSize = 300;
    let iteration = 0, foundRow = 0, possiblyFoundRow = 0, checkIter = 0;
    const sheetData = await api.spreadsheets.get({ spreadsheetId });
    const maxRow = get(sheetData, 'data.sheets[0].properties.gridProperties.rowCount');

    do {
        const row1 = maxRow - bulkSize * (iteration + 1);
        const row2 = maxRow - bulkSize * iteration;
        const range = `D${row1 < 1 ? 1 : row1}:D${row2}`;

        const {data} = await api.spreadsheets.get({
            spreadsheetId,
            includeGridData: true,
            ranges: [range],
        });

        if (data.sheets && data.sheets.length) {
            if (data.sheets[0].data && data.sheets[0].data.length) {
                const rowData = data.sheets[0].data[0].rowData;
                if (rowData) {
                    for (let i = 0; i < rowData.length; i++) {
                        if (rowData[i] && rowData[i].values && rowData[i].values![0]) {
                            const value = rowData[i].values![0].userEnteredValue;
                            if (!value) {
                                if (possiblyFoundRow) {
                                    checkIter++;
                                    if (checkIter > 10) {
                                        foundRow = possiblyFoundRow;
                                    }
                                } else {
                                    possiblyFoundRow = row1 + i;
                                    checkIter = 0;
                                }
                            } else {
                                possiblyFoundRow = 0;
                            }
                        }
                    }
                }
            } else {
                throw Error(`Cannot retreive spreadsheet ${spreadsheetId} range data ${range}`);
            }
        } else {
            throw Error(`Cannot find spreadsheet pages in the document with id ${spreadsheetId}`);
        }

        iteration++;
        if (row1 < 1) {
            throw Error('Can\'t get last filled row by D column: All rows examined.');
        }
    } while (!foundRow);

    do {
        const {data} = await api.spreadsheets.get({
            spreadsheetId,
            includeGridData: true,
            ranges: [`B${foundRow}:M${foundRow}`],
        });
        const rowValues = get(data, 'sheets[0].data[0].rowData[0].values');
        if (rowValues && rowValues.length) {
            functions.logger.info(rowValues, {structuredData: true});
            const filledRowsNumber = rowValues.filter((cell: sheets_v4.Schema$CellData) => cell.userEnteredValue).length;
            if (filledRowsNumber === 0) {
                break;
            }
        }
        foundRow++;
    } while (true);

    functions.logger.info(`Found Row: ${foundRow}`, {structuredData: true});
    return foundRow;
};

const targetDisplayNames: Record<StaticTarget, string> = {
    'kumir': 'Ку-Мир',
    'chanakhi': 'Чанахи',
};

const writeOrderToRow = async (api: sheets_v4.Sheets, order: ExpectedRequestData, rowNumber: number) => {

    if (order.name && order.items && order.items.length) {
        const targetName = order.target &&(targetDisplayNames[order.target] || order.target);
        const name = order.name;
        const orderItemGroups = chunk(order.items, 6);
        while (orderItemGroups[orderItemGroups.length - 1].length < 6) {
            orderItemGroups[orderItemGroups.length - 1].push('');
        }
        const rows = orderItemGroups.map(itemGroup => {
            return ['', '', '', ...itemGroup, '', '', ''];
        });
        const totalCostIndex = order.target === 'chanakhi' ? 9 : order.target === 'kumir' ? 10 : 11;
        rows.forEach((row, i) => {
            if (i === 0) {
                row[0] = targetName || '';
                row[2] = name;
            } else {
                row[2] = '↑';
            }
            if (i === rows.length - 1) {
                row[totalCostIndex] = order.totalCost || '';
            } else {
                row[totalCostIndex] = '↓';
            }
        });

        const range = `B${rowNumber}:M${rowNumber + rows.length - 1}`;
        const res = await api.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: rows,
                range,
                majorDimension: 'ROWS',
            },
        });
        if (res.status !== 200) {
            functions.logger.error(`Insert row failed: ${res.data}`, {structuredData: true});
        }
        functions.logger.info(`Insert row result: ${res.data}`, {structuredData: true});
        return res;
    } else {
        throw Error(`Invalid order data: ${order}`);
    }
};

export const placeOrders = functions.https.onRequest(async (request, response) => {
    // const data2 = await FirebaseAdmin.firestore().collection('auto-order-configs').get();
    // data2.forEach(entry => {
    //     functions.logger.info(entry.data(), {structuredData: true});
    // });
    const data = request.body as ExpectedRequestData;
    functions.logger.info(data, {structuredData: true});
    try {
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
        const api = google.sheets({ version: 'v4', auth });
        const lastRow = await getLastFilledRow(api);
        await writeOrderToRow(api, data, lastRow);
        response.status(200).send(`Row: ${lastRow}`);
    } catch (err) {
        functions.logger.info(`ERROR: ${err}`, { structuredData: true });
        response.status(500).send({ err });
    }
});
