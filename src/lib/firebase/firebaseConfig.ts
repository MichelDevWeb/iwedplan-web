import { initializeApp, getApps, FirebaseApp } from '@firebase/app';
import { Firestore } from '@firebase/firestore';
import { Auth } from '@firebase/auth';
import { FirebaseStorage } from '@firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Service instances cache
let app: FirebaseApp;
let firestoreInstance: Firestore;
let storageInstance: FirebaseStorage;
let authInstance: Auth;

/**
 * Initialize Firebase app if not already initialized
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app && typeof window !== 'undefined') {
    // Only initialize on client side
    const apps = getApps();
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = apps[0];
    }
  }
  return app;
}

/**
 * Get Firestore instance with lazy initialization
 */
export async function getFirestore(): Promise<Firestore> {
  try {
    if (!firestoreInstance) {
      const app = getFirebaseApp();
      const { getFirestore: getFirestoreFromFB } = await import('firebase/firestore');
      firestoreInstance = getFirestoreFromFB(app);
    }
    return firestoreInstance;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw new Error('Failed to initialize Firestore. Please try again later.');
  }
}

/**
 * Get Storage instance with lazy initialization
 */
export async function getStorage(): Promise<FirebaseStorage> {
  try {
    if (!storageInstance) {
      const app = getFirebaseApp();
      const { getStorage: getStorageFromFB } = await import('firebase/storage');
      storageInstance = getStorageFromFB(app);
    }
    return storageInstance;
  } catch (error) {
    console.error('Error initializing Storage:', error);
    throw new Error('Failed to initialize Storage. Please try again later.');
  }
}

/**
 * Get Auth instance with lazy initialization
 */
export async function getAuth(): Promise<Auth> {
  try {
    if (!authInstance) {
      const app = getFirebaseApp();
      const { getAuth: getAuthFromFB } = await import('firebase/auth');
      authInstance = getAuthFromFB(app);
    }
    return authInstance;
  } catch (error) {
    console.error('Error initializing Auth:', error);
    throw new Error('Failed to initialize Auth. Please try again later.');
  }
}

/**
 * Reset Firebase instances (useful for testing or after logout)
 */
export function resetFirebaseInstances(): void {
  firestoreInstance = null as unknown as Firestore;
  storageInstance = null as unknown as FirebaseStorage;
  authInstance = null as unknown as Auth;
} 