import React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { randomId } from '../utils';

export type AuthData = {
    authInProcess: boolean
    authWithGoogle: () => void
    logout: (force?: boolean) => void
    uid?: string
    email?: string | null
    displayName?: string | null
    photoUrl?: string | null
};

const firebaseConfig = {
    apiKey: "AIzaSyAjnZbe5tqvUQBDRBN270uEhAWYHXcBLCA",
    authDomain: "brightpattern-282908.firebaseapp.com",
    databaseURL: "https://brightpattern-282908.firebaseio.com",
    projectId: "brightpattern-282908",
    storageBucket: "brightpattern-282908.appspot.com",
    messagingSenderId: "463231819575",
    appId: "1:463231819575:web:1530cce4693247f08104b2",
};

const defaultAuthData = {
    authInProcess: true,
    authWithGoogle: () => {},
    logout: () => {},
};


export const AutoAuthContext = React.createContext<AuthData>(defaultAuthData);

export const AuthAuthProvider: React.FC = ({ children }) => {

    const [authState, setAuthState] = React.useState<AuthData>(defaultAuthData);
    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
    const uniqDialogIdRef = React.useRef('logout-dialog-' + randomId())

    const logout = React.useCallback((force = false) => {
        if (force) {
            firebase.auth().signOut();
        } else {
            setShowLogoutDialog(true);
        }
    }, []);

    const authWithGoogle = React.useCallback(() => {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            login_hint: 'you@brightpattern.com',
        });
        try {
            setAuthState({
                authWithGoogle,
                authInProcess: true,
                logout,
            });
            firebase.auth().signOut()
            firebase.auth().signInWithPopup(provider)
            .catch(() => {
                setAuthState({
                    authWithGoogle,
                    authInProcess: false,
                    logout,
                });
            });
            console.log('Google Sign In');
        } catch (error) {
            console.log(error);
        }
    }, [logout]);

    React.useEffect(() => {
        setAuthState({
            authInProcess: true,
            authWithGoogle,
            logout,
        });
        firebase.initializeApp(firebaseConfig).auth()
        .onAuthStateChanged(user => {
            if (user) {
                setAuthState({
                    authWithGoogle,
                    logout,
                    authInProcess: false,
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoUrl: user.photoURL,
                });
                console.log('User is logged in');
            } else {
                setAuthState({
                    authWithGoogle,
                    logout,
                    authInProcess: false,
                });
                console.log('User is not logged in');
            }
        });
    }, [authWithGoogle, logout]);

    const onCloseDialog = React.useCallback(() => {
        setShowLogoutDialog(false);
    }, []);

    const onSubmitDialog = React.useCallback(() => {
        firebase.auth().signOut();
    }, []);

    return (
        <>
            <AutoAuthContext.Provider value={ authState }>
                { children }
            </AutoAuthContext.Provider>
            <Dialog open={showLogoutDialog} onClose={onCloseDialog} aria-labelledby={uniqDialogIdRef.current}>
                <form onSubmit={onSubmitDialog}>
                    <DialogTitle id={uniqDialogIdRef.current}>
                        Confirm Logout?
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={onCloseDialog}>
                            Cancel
                        </Button>
                        <Button type="submit" color="secondary">
                            Logout
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};
