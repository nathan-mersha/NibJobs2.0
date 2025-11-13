import { Platform } from 'react-native';

// Web-compatible Firebase setup
export const isWebPlatform = Platform.OS === 'web';

// Mock Firebase for web development
export const webFirebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-domain.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock-bucket.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// For now, let's simplify and just skip Firebase on web
export const initializeFirebase = () => {
  if (isWebPlatform) {
    console.log('Firebase skipped on web platform');
  } else {
    // On native platforms, Firebase is auto-initialized
    console.log('Firebase initialized for native platform');
  }
};