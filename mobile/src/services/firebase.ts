import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYYavl-JsiPGcFhWSw7vGMPCbVhqt5pBQ", // Android API key
  authDomain: "nibjobs-dev.firebaseapp.com",
  projectId: "nibjobs-dev",
  storageBucket: "nibjobs-dev.firebasestorage.app",
  messagingSenderId: "921124469397",
  appId: "1:921124469397:android:4dcb0020fee8cb5ca9f99c", // Android app ID
};

/**
 * Initialize Firebase services
 */
export const initializeFirebase = async () => {
  try {
    // Firebase is automatically initialized by @react-native-firebase
    console.log('Firebase initialized successfully');
    
    // Initialize messaging for push notifications
    if (Platform.OS !== 'web') {
      await initializeMessaging();
    }
    
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return false;
  }
};

/**
 * Initialize Firebase Cloud Messaging
 */
const initializeMessaging = async () => {
  try {
    // Request permission for iOS
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Push notification permission not granted');
        return false;
      }
    }

    // For Android, permission is granted by default for API level < 33
    // For API level 33+, you need to request POST_NOTIFICATIONS permission

    console.log('FCM initialized successfully');
    return true;
  } catch (error) {
    console.error('FCM initialization failed:', error);
    return false;
  }
};

/**
 * Get FCM token for current device
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // For web, you would use Firebase JS SDK
      return null;
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

/**
 * Subscribe to FCM token refresh
 */
export const subscribeToTokenRefresh = (callback: (token: string) => void) => {
  if (Platform.OS === 'web') {
    return () => {}; // No-op for web
  }

  return messaging().onTokenRefresh(callback);
};

/**
 * Handle foreground messages
 */
export const subscribeForegroundMessages = (callback: (message: any) => void) => {
  if (Platform.OS === 'web') {
    return () => {}; // No-op for web
  }

  return messaging().onMessage(callback);
};

/**
 * Handle notification open events
 */
export const subscribeNotificationOpen = (callback: (message: any) => void) => {
  if (Platform.OS === 'web') {
    return () => {}; // No-op for web
  }

  // Handle notification opened when app is in background
  messaging().onNotificationOpenedApp(callback);

  // Handle notification opened when app is closed/quit
  messaging()
    .getInitialNotification()
    .then((message) => {
      if (message) {
        callback(message);
      }
    });
};

// Export Firebase instances
export { firestore, auth, messaging };
export default {
  initializeFirebase,
  getFCMToken,
  subscribeToTokenRefresh,
  subscribeForegroundMessages,
  subscribeNotificationOpen,
};