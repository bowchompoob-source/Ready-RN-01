/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Safely gather configuration, prioritizing VITE_ environment variables then firebase-applet-config
const mergedConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig?.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig?.authDomain || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig?.projectId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig?.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig?.messagingSenderId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig?.appId || "",
  databaseId: firebaseConfig?.firestoreDatabaseId || "",
};

// Determine if Firebase has a valid config
const isFirebaseConfigured = !!(
  mergedConfig.apiKey &&
  mergedConfig.apiKey !== "" &&
  !mergedConfig.apiKey.startsWith("YOUR_")
);

let app;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(mergedConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app, mergedConfig.databaseId || undefined);
    console.log("Ready RN 01: Firebase Dynamic Authentication and Firestore initialized successfully.");
  } catch (err) {
    console.warn("Ready RN 01: Firebase initialization exception occurred. Dynamic fallback to Demo Mode. Details:", err);
  }
} else {
  console.log("Ready RN 01: No Firebase credentials provided. Operating securely in standalone local state Demo Mode.");
}

export { auth, db, isFirebaseConfigured };
