
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANT: Ensure these environment variables are correctly set in your .env.local file
// Example .env.local content:
// NEXT_PUBLIC_FIREBASE_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
// NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:xxxxxxxxxxxxxxxx

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// Validate that required environment variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("Firebase configuration error: Make sure API Key, Auth Domain, and Project ID are set in your environment variables (e.g., .env.local).");
  // Optionally throw an error only in production or handle appropriately
  // throw new Error("Firebase configuration environment variables are missing!");
}


// Initialize Firebase only if it hasn't been initialized yet
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
     console.error("Firebase initialization failed:", error);
     // Handle initialization error, maybe show a message to the user
     // Setting app to null or a specific error state might be needed depending on how the rest of the app handles this.
     app = null;
  }
} else {
  app = getApp();
}

// Initialize Firebase services, guarding against null app if initialization failed
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

// Check if services initialized correctly before exporting
if (!auth || !db || !storage) {
    console.error("Firebase services could not be initialized. Check your configuration and Firebase project settings.");
    // You might want to handle this case more gracefully in your application components
}


export { app, auth, db, storage };
