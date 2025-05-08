
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Log environment variables during build/server start for debugging (optional, remove in production)
// console.log("Firebase Config Vars:", {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Loaded' : 'Missing',
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Loaded' : 'Missing',
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Loaded' : 'Missing',
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Loaded' : 'Missing',
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Loaded' : 'Missing',
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Loaded' : 'Missing',
// });


const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that required environment variables are present
const requiredEnvVars: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId'];
const missingVars = requiredEnvVars.filter(key => !firebaseConfig[key]);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (missingVars.length > 0) {
  console.error(`Firebase configuration error: Missing required environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`);
  // Depending on the context, you might throw an error or handle this state in the UI
  // For now, services will remain null.
} else {
  // Initialize Firebase only if it hasn't been initialized yet
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully.");
    } catch (error) {
       console.error("Firebase initialization failed:", error);
       // Handle initialization error, maybe show a message to the user
       // Setting app to null or a specific error state might be needed depending on how the rest of the app handles this.
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
    console.error("Firebase services could not be initialized. Ensure your environment variables are correct and the Firebase project is set up properly.");
    // You might want to handle this case more gracefully in your application components,
    // for example, by showing an error message to the user instead of crashing.
}


export { app, auth, db, storage };
// IMPORTANT: Ensure you have a .env.local file in your project root with your actual Firebase credentials:
/*
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:xxxxxxxxxxxxxxxx
*/
