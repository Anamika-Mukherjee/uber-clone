import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = require("./firebase-service-account-key.json");

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
}

export const db = getFirestore();
export default admin;
  