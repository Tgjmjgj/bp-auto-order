import React from 'react';
import { ConfigStateProvider } from './ConfigStateProvider';
import { AuthAuthProvider } from './AutoAuthProvider';
import { Main } from './Main';

export const App: React.FC = () => {
    return (
        <AuthAuthProvider>
            <ConfigStateProvider>
                <Main />
            </ConfigStateProvider>
        </AuthAuthProvider>
    );
};
