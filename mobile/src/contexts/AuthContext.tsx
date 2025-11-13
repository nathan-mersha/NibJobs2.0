import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User } from '@nibjobs/shared';
import { isWeb, webFirebaseStub } from '../utils/platform';

// Conditional Firebase imports
let auth: any = null;
let firestore: any = null;
let FirebaseAuthTypes: any = null;

if (!isWeb) {
  auth = require('@react-native-firebase/auth').default;
  firestore = require('@react-native-firebase/firestore').default;
  FirebaseAuthTypes = require('@react-native-firebase/auth').FirebaseAuthTypes;
} else {
  // Use web stubs for development
  auth = webFirebaseStub.auth;
  firestore = webFirebaseStub.firestore;
}

interface AuthContextType {
  user: any;
  userProfile: User | null;
  isGuest: boolean;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isGuest = user?.isAnonymous || !user;

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (authUser: any) => {
      setUser(authUser);
      
      if (authUser && !authUser.isAnonymous) {
        // Load user profile from Firestore
        await loadUserProfile(authUser.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        setUserProfile(userDoc.data() as User);
      } else {
        // Create new user profile
        const newUserProfile: User = {
          userId,
          email: auth().currentUser?.email || '',
          fcmTokens: [],
          selectedCategories: [],
          isNotificationsEnabled: false,
          createdAt: firestore.Timestamp.now(),
          updatedAt: firestore.Timestamp.now(),
        };
        
        await firestore().collection('users').doc(userId).set(newUserProfile);
        setUserProfile(newUserProfile);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Create user profile in Firestore
      if (userCredential.user) {
        await loadUserProfile(userCredential.user.uid);
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      setLoading(true);
      await auth().signInAnonymously();
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await auth().signOut();
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user || !userProfile) {
      throw new Error('No authenticated user');
    }

    try {
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: firestore.Timestamp.now(),
      };

      await firestore().collection('users').doc(user.uid).update(updates);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isGuest,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInAnonymously,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};