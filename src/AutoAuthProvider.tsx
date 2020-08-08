import React from 'react';
import Firebase from 'firebase';


export type AuthData = {
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

export const AutoAuthContext = React.createContext<AuthData>({});

export const AuthAuthProvider: React.FC = ({ children }) => {

    const [authState, setAuthState] = React.useState<AuthData>({});

    React.useEffect(() => {
        Firebase
        .initializeApp(firebaseConfig)
        .auth()
        .onAuthStateChanged(user => {
            if (user) {
                setAuthState({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoUrl: user.photoURL,
                });
                console.log('User is logged in');
                console.log(user);
            } else {
                console.log('User is not logged in');
                // const provider = new Firebase.auth.GoogleAuthProvider();
                // provider.setCustomParameters({
                //     login_hint: 'you@brightpattern.com',
                // });
                // try {
                //     Firebase.auth().signInWithPopup(provider);
                //     console.log('Google Sign In');
                // } catch (error) {
                //     console.log(error);
                // }
            }
        });
    }, []);

    return (
        <AutoAuthContext.Provider value={ authState }>
            { children }
        </AutoAuthContext.Provider>
    );
}
