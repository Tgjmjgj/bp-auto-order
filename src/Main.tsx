import React from 'react';
import { AutoAuthContext } from './AutoAuthProvider';
import { ConfigStateContext } from './ConfigStateProvider';
import { Authorized } from './Authorized';
import { Unauthorized } from './Unauthorized';
import { Loader } from './components/Loader';

export const Main: React.FC = () => {
    const authContext = React.useContext(AutoAuthContext);
    const configContext = React.useContext(ConfigStateContext);

    return (
        authContext.uid
            ? configContext.dataLoaded ? <Authorized /> : <Loader/>
            : !authContext.authInProcess ? <Unauthorized /> : <Loader/>
    );
};
