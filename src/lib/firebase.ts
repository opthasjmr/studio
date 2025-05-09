
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCEm58VW1j7yTk_E1KhzWK2YK_grzzu1bU", // USER PROVIDED
  authDomain: "netram-vision.firebaseapp.com", // USER PROVIDED
  projectId: "netram-vision", // USER PROVIDED
  storageBucket: "netram-vision.appspot.com", // Standard format, updated from user's "firebasestorage.app"
  messagingSenderId: "690790224302", // USER PROVIDED
  appId: "1:690790224302:web:2b9c50b056835285b6783f", // USER PROVIDED
  measurementId: "G-R0VS5205EJ" // USER PROVIDED
};

// Validate that required configuration keys are present and not empty
const requiredConfigKeys: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingConfigKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (missingConfigKeys.length > 0) {
  console.error(`Firebase configuration error: Missing required configuration values in firebase.ts: ${missingConfigKeys.join(', ')}.`);
  // Services will remain null. The AuthContext will handle displaying an error.
} else {
  // Initialize Firebase only if it hasn't been initialized yet
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      // console.log("Firebase initialized successfully."); // Removed for cleaner logs unless debugging
    } catch (error) {
       console.error("Firebase initialization failed:", error);
       app = null; // Ensure app is null if init fails
    }
  } else {
    app = getApp();
    // console.log("Firebase app already initialized."); // Removed for cleaner logs
  }

  // Initialize Firebase services, guarding against null app if initialization failed
  if (app) {
      try {
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
      } catch (serviceError) {
        console.error("Error initializing Firebase services (Auth, Firestore, Storage):", serviceError);
        // Set services to null if any initialization fails
        auth = null;
        db = null;
        storage = null;
      }
  } else {
      console.error("Firebase app object is null, cannot initialize services.");
  }
}

// Check if services initialized correctly before exporting
if (!auth || !db || !storage) {
    if (missingConfigKeys.length === 0 && app) { 
        console.error("Firebase services (auth, db, storage) could not be initialized properly, even though the Firebase app object was created. This might be due to issues with service enablement in the Firebase console or network problems.");
    } else if (missingConfigKeys.length === 0 && !app) {
        // This case means initializeApp(firebaseConfig) itself failed.
        console.error("Firebase app initialization failed. Services (auth, db, storage) cannot be initialized.");
    }
    // If missingConfigKeys.length > 0, the error is already logged above.
}


export { app, auth, db, storage };
// IMPORTANT: Ensure the Firebase configuration values above are correct for your project.
// For production, it's generally recommended to use environment variables.
// Example for .env.local if using environment variables:
/*
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID (optional)
*/

// Ensure your Firestore security rules and Firebase Authentication settings
// are configured correctly in the Firebase console.
// For example, enable Email/Password sign-in method.
