import React from 'react';
import { AutoAuthContext } from './AutoAuthProvider';
import { ConfigurationPage } from './ConfigurationPage';
import { Unauthorized } from './Unauthorized';

export const Main: React.FC = () => {
    const authContext = React.useContext(AutoAuthContext);
    return (
        authContext.uid
            ? <ConfigurationPage />
            : <Unauthorized />
    )
};
