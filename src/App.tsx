import React from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';

import { AuthAuthProvider } from './providers/AutoAuthProvider';
import { MenuProvider } from './providers/MenuProvider';
import { ConfigStateProvider } from './providers/ConfigStateProvider';
import { DateForProvider } from './providers/DateForProvider';
import { DialogsProvider } from './providers/DialogsProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { Main } from './Main';

export const App: React.FC = () => {
    return (
        <MuiPickersUtilsProvider utils={LuxonUtils}>
            <AuthAuthProvider>
                <ConfigStateProvider>
                    <DateForProvider>
                        <MenuProvider>
                            <DialogsProvider>
                                <NotificationProvider>
                                    <Main />
                                </NotificationProvider>
                            </DialogsProvider>
                        </MenuProvider>
                    </DateForProvider>
                </ConfigStateProvider>
            </AuthAuthProvider>
        </MuiPickersUtilsProvider>
    );
};
