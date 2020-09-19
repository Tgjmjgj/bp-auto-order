import React from 'react';
import { AuthAuthProvider } from './providers/AutoAuthProvider';
import { MenuProvider } from './providers/MenuProvider';
import { ConfigStateProvider } from './providers/ConfigStateProvider';
import { DateForProvider } from './providers/DateForProvider';
import { Main } from './Main';

export const App: React.FC = () => {
    return (
        <AuthAuthProvider>
            <DateForProvider>
                <MenuProvider>
                    <ConfigStateProvider>
                        <Main />
                    </ConfigStateProvider>
                </MenuProvider>
            </DateForProvider>
        </AuthAuthProvider>
    );
};
