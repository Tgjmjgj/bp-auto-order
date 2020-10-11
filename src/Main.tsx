import React from 'react';
import { AutoAuthContext } from './providers/AutoAuthProvider';
import { ConfigStateContext } from './providers/ConfigStateProvider';
import { Authorized } from './Authorized';
import { Unauthorized } from './Unauthorized';
import { GlobalLoader } from './components/GlobalLoader';

export const Main: React.FC = React.memo(() => {
    const authContext = React.useContext(AutoAuthContext);
    const configContext = React.useContext(ConfigStateContext);

    return (
        authContext.uid
            ? configContext.dataLoaded ? <Authorized /> : <GlobalLoader/>
            : !authContext.authInProcess ? <Unauthorized /> : <GlobalLoader/>
    );
});
