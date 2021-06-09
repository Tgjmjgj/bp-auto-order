import { sheets_v4 } from 'googleapis';


export function getSheet(spreadsheet: sheets_v4.Schema$Spreadsheet, sheetTitle?: string): sheets_v4.Schema$Sheet {
    return spreadsheet.sheets!.find(sheet => sheet.properties && sheet.properties.title === sheetTitle) || spreadsheet.sheets![0]!;
}
