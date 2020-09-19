import * as FirebaseAdmin from 'firebase-admin';

const app = FirebaseAdmin.initializeApp();

export const firestore = FirebaseAdmin.firestore(app);
