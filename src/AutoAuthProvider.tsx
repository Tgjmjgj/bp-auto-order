import React from 'react';
import Firebase from 'firebase';


export type AuthData = {
    authInProcess: boolean
    authWithGoogle: () => void
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
    authWithGoogle: () => {}
};

export const AutoAuthContext = React.createContext<AuthData>(defaultAuthData);

export const AuthAuthProvider: React.FC = ({ children }) => {

    const [authState, setAuthState] = React.useState<AuthData>(defaultAuthData);

    const authWithGoogle = React.useCallback(() => {
        const provider = new Firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            login_hint: 'you@brightpattern.com',
        });
        try {
            setAuthState({
                authWithGoogle,
                authInProcess: true,
            });
            Firebase.auth().signInWithPopup(provider)
            .catch(() => {
                setAuthState({
                    authWithGoogle,
                    authInProcess: false,
                });
            });
            console.log('Google Sign In');
        } catch (error) {
            console.log(error);
        }
    }, []);

    React.useEffect(() => {
        setAuthState({
            authInProcess: true,
            authWithGoogle,
        });
        Firebase
        .initializeApp(firebaseConfig)
        .auth()
        .onAuthStateChanged(user => {
            if (user) {
                setAuthState({
                    authWithGoogle,
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
                    authInProcess: false,
                });
                console.log('User is not logged in');
            }
        });
    }, [authWithGoogle]);

    return (
        <AutoAuthContext.Provider value={ authState }>
            { children }
        </AutoAuthContext.Provider>
    );
}
