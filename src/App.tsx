import React from 'react';
import { AuthAuthProvider } from './providers/AutoAuthProvider';
import { MenuProvider } from './providers/MenuProvider';
import { ConfigStateProvider } from './providers/ConfigStateProvider';
import { DateForProvider } from './providers/DateForProvider';
import { DialogsProvider } from './providers/DialogsProvider';
import { Main } from './Main';

export const App: React.FC = () => {
    return (
        <AuthAuthProvider>
            <DateForProvider>
                <ConfigStateProvider>
                    <MenuProvider>
                        <DialogsProvider>
                            <Main />
                        </DialogsProvider>
                    </MenuProvider>
                </ConfigStateProvider>
            </DateForProvider>
        </AuthAuthProvider>
    );
};
