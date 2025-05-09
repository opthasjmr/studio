
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCEm58VW1j7yTk_E1KhzWK2YK_grzzu1bU",
  authDomain: "netram-vision.firebaseapp.com",
  projectId: "netram-vision",
  storageBucket: "netram-vision.firebasestorage.app",
  messagingSenderId: "690790224302",
  appId: "1:690790224302:web:2b9c50b056835285b6783f",
  measurementId: "G-R0VS5205EJ"
};

// Validate that required configuration keys are present and not empty
const requiredConfigKeys: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId'];
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
      console.log("Firebase initialized successfully.");
    } catch (error) {
       console.error("Firebase initialization failed:", error);
       app = null; // Ensure app is null if init fails
    }
  } else {
    app = getApp();
    // console.log("Firebase app already initialized.");
  }

  // Initialize Firebase services, guarding against null app if initialization failed
  if (app) {
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
  } else {
      console.error("Firebase app object is null, cannot initialize services.");
  }
}

// Check if services initialized correctly before exporting
if (!auth || !db || !storage) {
    if (missingConfigKeys.length === 0 && app) { // Only log this specific error if config was present but services still failed
        console.error("Firebase services (auth, db, storage) could not be initialized properly, even though the Firebase app object was created. Check console for specific Firebase errors.");
    } else if (missingConfigKeys.length === 0 && !app) {
        // This case means initializeApp(firebaseConfig) itself failed.
        console.error("Firebase app initialization failed. Services (auth, db, storage) cannot be initialized.");
    }
    // If missingConfigKeys.length > 0, the error is already logged above.
}

export { app, auth, db, storage };
// IMPORTANT: The Firebase configuration is now hardcoded in this file.
// For production, it's generally recommended to use environment variables.
// If you revert to using environment variables (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
// ensure you have a .env.local file in your project root with your actual Firebase credentials.
/*
Example for .env.local if using environment variables:
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID (optional)
*/

