import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseClientConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = initializeApp(firebaseClientConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);


