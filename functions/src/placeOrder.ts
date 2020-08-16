import * as functions from 'firebase-functions';
import {google, sheets_v4} from 'googleapis';
import cyrillicToTranslit from 'cyrillic-to-translit-js';
import levenshtein from 'js-levenshtein'
import faker from 'faker';
import capitalize from 'lodash/capitalize';
import groupBy from 'lodash/groupBy';
import chunk from 'lodash/chunk';
import uniq from 'lodash/uniq';
import get from 'lodash/get';

// const spreadsheetId = '1S-gWGUUqDzfBUUZNRo2UjlHR8kw9LrKQ-I_PvH7nXB4'; // tmp

type StaticTarget = 'kumir' | 'chanakhi'
type Target = StaticTarget | string;

type OrderItem = {
    name?: string
    price?: number
    quantity?: number
    target?: Target
}

type ExpectedRequestData = {
    spreadsheetId?: string
    items?: OrderItem[]
    systemName?: string
    customName?: string
};

export type PlaceOrderResult = {
    status: number
    data: any
};

const targetDisplayNames: Record<string, string> = {
    'kumir': 'Ку-Мир',
    'chanakhi': 'Чанахи',
};

const randomName = () => `${capitalize(faker.hacker.adjective())} ${capitalize(faker.hacker.noun())}`;

const getLastFilledRow = async (api: sheets_v4.Sheets, spreadsheetId: string) => {
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

    const packSize = 5;
    let foundCycle2 = false;
    do {
        const {data} = await api.spreadsheets.get({
            spreadsheetId,
            includeGridData: true,
            ranges: [`B${foundRow}:M${foundRow + packSize}`],
        });
        const rowData = get(data, 'sheets[0].data[0].rowData');

        for (const {values} of rowData) {
            if (values && values.length) {
                const filledRowsNumber = values.filter((cell: sheets_v4.Schema$CellData) => cell.userEnteredValue).length;
                if (filledRowsNumber === 0) {
                    foundCycle2 = true;
                    break;
                }
            }
        }
        if (!foundCycle2) {
            foundRow++;
        }
    } while (!foundCycle2);

    functions.logger.info(`Found Row: ${foundRow}`);
    return foundRow;
};

const checkExistedOrder = async (api: sheets_v4.Sheets, names: string[], rowNumber: number, spreadsheetId: string) => {
    const {data} = await api.spreadsheets.get({
        spreadsheetId,
        includeGridData: true,
        ranges: [`D${rowNumber - 30}:D${rowNumber}`],
    });
    const rowData = get(data, 'sheets[0].data[0].rowData');
    const existedNames = [];
    let emptyCellSpan = 0;
    for (let i = rowData.length - 1; i >= 0; i--) {
        const value = rowData[i].values[0];
        if (!value || !value.userEnteredValue || !value.userEnteredValue.stringValue) {
            if (existedNames.length) {
                emptyCellSpan++;
                if (emptyCellSpan === 2) {
                    break;
                }
            }
        } else {
            existedNames.push(value.userEnteredValue.stringValue);
            emptyCellSpan = 0;
        }
    }
    
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

    const foundName = existedNames
    .map(existedName => existedName.toLowerCase().trim())
    .find(existedName => !!nameVariants.find(name => levenshtein(existedName, name) < 3));

    functions.logger.info(`Found name: ${foundName} for [${nameVariants.join(', ')}]`);
    return !!foundName;
};

const writeOrderToRow = async (api: sheets_v4.Sheets, order: ExpectedRequestData, rowNumber: number) => {

    const tableRows =
        (Object.values(groupBy(order.items, item => item.target))
        .map(items => {
            const fullItems = items.filter(item => item.name);
            if (!fullItems.length) {
                return null;
            }
            const orderItemGroups = chunk(fullItems.map(item => (item.quantity || 1) > 1 ? `${item.name} x${item.quantity}` : item.name) as string[], 6);
            while (orderItemGroups[orderItemGroups.length - 1].length < 6) {
                orderItemGroups[orderItemGroups.length - 1].push('');
            }
            const rows = orderItemGroups.map(itemGroup => {
                return ['', '', '↑', ...itemGroup, '', '', ''];
            });
            const targetName = fullItems[0].target ? (targetDisplayNames[fullItems[0].target] || fullItems[0].target) : '';
            const totalCostIndex = fullItems[0].target === 'chanakhi' ? 9 : fullItems[0].target === 'kumir' ? 10 : 11;
            const totalCostValue = fullItems.reduce((sum, item) => {
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

    const range = `B${rowNumber}:M${rowNumber + tableRows.length - 1}`;
    const res = await api.spreadsheets.values.update({
        spreadsheetId: order.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: tableRows,
            range,
            majorDimension: 'ROWS',
        },
    });
    if (res.status !== 200) {
        throw Error(`Insert row failed: ${res.data}`);
    }
    functions.logger.info(`Insert row result: ${res.data}`, {structuredData: true});
    return res;
};

export const placeOrder = async (data: ExpectedRequestData): Promise<PlaceOrderResult> => {
    try {
        const spreadsheetId = data.spreadsheetId;
        if (!spreadsheetId) {
            throw Error('No spreadsheetId in the request');
        }
        if (!data.items || !data.items.length) {
            throw Error('Trying to place an empty order (no items)');
        }
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
        const api = google.sheets({ version: 'v4', auth });
        const lastRow = await getLastFilledRow(api, spreadsheetId);
        const names = [data.systemName, data.customName].filter(name => name) as string[];
        const isOrderAlreadyThere = await checkExistedOrder(api, names, lastRow, spreadsheetId);
        if (!isOrderAlreadyThere) {
            await writeOrderToRow(api, data, lastRow);
            return {
                status: 200,
                data: {
                    success: true,
                    row: lastRow,
                },
            };
        } else {
            return {
                status: 200,
                data: {
                    success: false,
                    reason: 'Your order already exists',
                },
            };
        }
    } catch (err) {
        functions.logger.error(`ERROR: ${err}`, { structuredData: true });
        return {
            status: 500,
            data: {
                error: err,
            },
        };
    }
};
