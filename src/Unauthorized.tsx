import React from 'react';
import Button from '@material-ui/core/Button';
import { AutoAuthContext } from './providers/AutoAuthProvider';

import {ReactComponent as GoogleSvgIcon} from './images/google.svg';

export const Unauthorized: React.FC = () => {
    const authContext = React.useContext(AutoAuthContext);

    return (
        <div className="unauthorized">
            <Button
                variant="contained"
                color="primary"
                onClick={() => authContext.authWithGoogle()}
                startIcon={<GoogleSvgIcon />}
            >
                Sign in with Google
            </Button>
        </div>
    );
};