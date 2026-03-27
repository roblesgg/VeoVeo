import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, type Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

let authSingleton: Auth | null = null;
let firestoreSingleton: Firestore | null = null;
let storageSingleton: FirebaseStorage | null = null;

function readConfig(): FirebaseOptions | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
}

let appSingleton: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  const cfg = readConfig();
  if (!cfg?.apiKey) return null;
  if (getApps().length === 0) {
    appSingleton = initializeApp(cfg);
  } else {
    appSingleton = getApps()[0]!;
  }
  return appSingleton;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  
  if (!authSingleton) {
    if (getApps().length > 0 && !authSingleton) {
      // Intentamos inicializar con persistencia si es la primera vez
      try {
        authSingleton = initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        });
      } catch {
        // Fallback si ya estaba inicializado o falla
        authSingleton = getAuth(app);
      }
    } else {
      authSingleton = getAuth(app);
    }
  }
  return authSingleton;
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!firestoreSingleton) firestoreSingleton = getFirestore(app);
  return firestoreSingleton;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!storageSingleton) storageSingleton = getStorage(app);
  return storageSingleton;
}
