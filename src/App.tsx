import React from 'react';
import { AuthAuthProvider } from './AutoAuthProvider';
import { Main } from './Main';

function App() {
    return (
        <AuthAuthProvider>
            <Main />
        </AuthAuthProvider>
    );
}

export default App;
