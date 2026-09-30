import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = firebaseConfigJson.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId) 
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
