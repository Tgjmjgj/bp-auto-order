import React from 'react';
import Firebase from 'firebase';
import Button from '@material-ui/core/Button';

import {ReactComponent as GoogleSvgIcon} from './icons8-google.svg';

export const Unauthorized: React.FC = () => {

    const onLoginClick = () => {
        const provider = new Firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            login_hint: 'you@brightpattern.com',
        });
        try {
            Firebase.auth().signInWithPopup(provider);
            console.log('Google Sign In');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="unauthorized">
            <Button
                variant="contained"
                color="primary"
                onClick={onLoginClick}
                startIcon={<GoogleSvgIcon />}
            >
                Sign in with Google
            </Button>
        </div>
    );
}