import { initializeApp, getApps, FirebaseApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you need Analytics
// import { getFirestore } from "firebase/firestore"; // Uncomment if you need Firestore
// import { getAuth } from "firebase/auth"; // Uncomment if you need Auth
// import { getStorage } from "firebase/storage"; // Uncomment if you need Storage

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Add your Firebase API Key here or in .env.local
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, // Add your Firebase Auth Domain here or in .env.local
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Add your Firebase Project ID here or in .env.local
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Add your Firebase Storage Bucket here or in .env.local
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Add your Firebase Messaging Sender ID here or in .env.local
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, // Add your Firebase App ID here or in .env.local
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Add your Firebase Measurement ID here or in .env.local (optional)
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize other Firebase services as needed
// const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
// const db = getFirestore(app);
// const auth = getAuth(app);
// const storage = getStorage(app);

export { app }; // Export other services like db, auth, storage as needed 