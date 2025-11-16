// Firebase configuration for web
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCYYavl-JsiPGcFhWSw7vGMPCbVhqt5pBQ",
  authDomain: "nibjobs-dev.firebaseapp.com",
  projectId: "nibjobs-dev",
  storageBucket: "nibjobs-dev.firebasestorage.app",
  messagingSenderId: "921124469397",
  appId: "1:921124469397:android:4dcb0020fee8cb5ca9f99c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Functions with us-central1 region
export const functions = getFunctions(app, 'us-central1');

// Set functions region if needed
// connectFunctionsEmulator(functions, "localhost", 5001);

export default app;