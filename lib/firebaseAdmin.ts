import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from 'firebase-admin/app';

const serviceAccount = require("./firebase-service-account-key.json");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }),
  });
}

export const db = getFirestore();
export default admin;


