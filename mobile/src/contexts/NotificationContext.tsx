import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { isWeb, webFirebaseStub } from '../utils/platform';
import { useAuth } from './AuthContext';

// Conditional Firebase imports
let messaging: any = null;
let getFCMToken: any = null;
let subscribeToTokenRefresh: any = null;
let subscribeForegroundMessages: any = null;
let subscribeNotificationOpen: any = null;

if (!isWeb) {
  messaging = require('@react-native-firebase/messaging').default;
  const firebaseService = require('../services/firebase');
  getFCMToken = firebaseService.getFCMToken;
  subscribeToTokenRefresh = firebaseService.subscribeToTokenRefresh;
  subscribeForegroundMessages = firebaseService.subscribeForegroundMessages;
  subscribeNotificationOpen = firebaseService.subscribeNotificationOpen;
} else {
  // Use web stubs
  messaging = webFirebaseStub.messaging;
  getFCMToken = async () => 'mock-web-token';
  subscribeToTokenRefresh = () => () => {};
  subscribeForegroundMessages = () => () => {};
  subscribeNotificationOpen = () => () => {};
}

interface NotificationContextType {
  fcmToken: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  updateFCMToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const { user, userProfile, updateUserProfile } = useAuth();

  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    // Update FCM token in user profile when token changes
    if (fcmToken && user && userProfile && !user.isAnonymous) {
      updateUserFCMToken(fcmToken);
    }
  }, [fcmToken, user, userProfile]);

  const initializeNotifications = async () => {
    if (Platform.OS === 'web') {
      return; // Skip for web platform
    }

    try {
      // Check initial permission
      const authStatus = await messaging().hasPermission();
      setHasPermission(
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );

      // Get initial token
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
      }

      // Subscribe to token refresh
      const unsubscribeTokenRefresh = subscribeToTokenRefresh((newToken: any) => {
        setFcmToken(newToken);
      });

      // Subscribe to foreground messages
      const unsubscribeForeground = subscribeForegroundMessages((message: any) => {
        // Handle foreground notification
        console.log('Foreground message:', message);
        // You could show an in-app notification here
      });

      // Subscribe to notification open events
      subscribeNotificationOpen((message: any) => {
        // Handle notification tap
        console.log('Notification opened:', message);
        // Navigate to relevant screen based on message data
        handleNotificationOpen(message);
      });

      return () => {
        unsubscribeTokenRefresh();
        unsubscribeForeground();
      };
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false; // Web notifications handled differently
    }

    try {
      const authStatus = await messaging().requestPermission();
      const granted = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      setHasPermission(granted);
      
      if (granted) {
        // Get token after permission granted
        const token = await getFCMToken();
        if (token) {
          setFcmToken(token);
        }
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const updateFCMToken = async () => {
    try {
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
      }
    } catch (error) {
      console.error('Failed to update FCM token:', error);
    }
  };

  const updateUserFCMToken = async (newToken: string) => {
    try {
      if (!userProfile) return;

      // Add token to user's FCM tokens array if not already present
      const currentTokens = userProfile.fcmTokens || [];
      if (!currentTokens.includes(newToken)) {
        const updatedTokens = [...currentTokens, newToken];
        
        // Keep only the last 5 tokens to prevent excessive storage
        if (updatedTokens.length > 5) {
          updatedTokens.splice(0, updatedTokens.length - 5);
        }
        
        await updateUserProfile({
          fcmTokens: updatedTokens,
        });
      }
    } catch (error) {
      console.error('Failed to update user FCM token:', error);
    }
  };

  const handleNotificationOpen = (message: any) => {
    if (message?.data?.type === 'new_job' && message?.data?.jobId) {
      // Navigate to job detail screen
      // This would be handled by your navigation service
      console.log('Navigate to job:', message.data.jobId);
    }
  };

  const value: NotificationContextType = {
    fcmToken,
    hasPermission,
    requestPermission,
    updateFCMToken,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};