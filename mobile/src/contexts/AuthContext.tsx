import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User } from '@nibjobs/shared';
import { isWeb } from '../utils/platform';

// Conditional Firebase imports
let auth: any = null;
let firestore: any = null;
let FirebaseAuthTypes: any = null;
let sendEmailVerificationFn: any = null;

if (!isWeb) {
  // React Native Firebase
  auth = require('@react-native-firebase/auth').default;
  firestore = require('@react-native-firebase/firestore').default;
  FirebaseAuthTypes = require('@react-native-firebase/auth').FirebaseAuthTypes;
} else {
  // Firebase Web SDK
  const { initializeApp, getApps, getApp } = require('firebase/app');
  const { getAuth, sendEmailVerification: webSendEmailVerification } = require('firebase/auth');
  const { getFirestore, doc: firestoreDoc, getDoc: firestoreGetDoc, setDoc: firestoreSetDoc, updateDoc: firestoreUpdateDoc, Timestamp } = require('firebase/firestore');
  
  // Check if Firebase is already initialized
  let app;
  if (getApps().length === 0) {
    // Initialize Firebase for web
    const firebaseConfig = {
      apiKey: "AIzaSyCYYavl-JsiPGcFhWSw7vGMPCbVhqt5pBQ",
      authDomain: "nibjobs-dev.firebaseapp.com", 
      projectId: "nibjobs-dev",
      storageBucket: "nibjobs-dev.firebasestorage.app",
      messagingSenderId: "921124469397",
      appId: "1:921124469397:android:4dcb0020fee8cb5ca9f99c"
    };
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  const webAuth = getAuth(app);
  const webDb = getFirestore(app);
  sendEmailVerificationFn = webSendEmailVerification;
  
  // Create adapter for web Firebase to match native interface
  auth = () => webAuth;
  auth.GoogleAuthProvider = require('firebase/auth').GoogleAuthProvider;
  
  // Firestore adapter
  firestore = () => ({
    collection: (path: string) => ({
      doc: (id: string) => ({
        get: async () => {
          const docRef = firestoreDoc(webDb, path, id);
          const docSnap = await firestoreGetDoc(docRef);
          return {
            exists: docSnap.exists(),
            data: () => docSnap.data(),
          };
        },
        set: async (data: any) => {
          const docRef = firestoreDoc(webDb, path, id);
          return firestoreSetDoc(docRef, data);
        },
        update: async (data: any) => {
          const docRef = firestoreDoc(webDb, path, id);
          return firestoreUpdateDoc(docRef, data);
        },
      }),
    }),
    Timestamp: Timestamp,
  });
}

interface AuthContextType {
  user: any;
  userProfile: User | null;
  isGuest: boolean;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
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
        // Check if email is verified
        if (authUser.email && !authUser.emailVerified) {
          // User email is not verified, keep them signed out of profile
          setUserProfile(null);
        } else {
          // Load user profile from Firestore
          await loadUserProfile(authUser.uid);
        }
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
        const profile = userDoc.data() as User;
        
        // Check if user's email is verified in Firebase Auth and update profile if needed
        const currentUser = auth().currentUser;
        if (currentUser?.emailVerified && !profile.isVerified) {
          // Update the profile to mark as verified
          const updatedProfile = { ...profile, isVerified: true, updatedAt: firestore.Timestamp.now() };
          await firestore().collection('users').doc(userId).update({ isVerified: true, updatedAt: firestore.Timestamp.now() });
          setUserProfile(updatedProfile);
        } else {
          setUserProfile(profile);
        }
      } else {
        // Create new user profile matching superadmin schema
        const currentUser = auth().currentUser;
        const isVerified = currentUser?.emailVerified || false;
        
        const newUserProfile: User = {
          uid: userId,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || '',
          role: 'user',
          isVerified,
          isActive: true,
          lastLogin: firestore.Timestamp.now(),
          permissions: [],
          profile: {
            avatar: '',
            bio: '',
            phone: ''
          },
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
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      // Reload user to get latest email verification status
      await userCredential.user?.reload();
      const isEmailVerified = userCredential.user?.emailVerified || false;
      
      // Check if email is verified
      if (!isEmailVerified) {
        // Sign out the user since email is not verified
        await auth().signOut();
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
      }
      
      // Update isVerified in Firestore if email is verified but DB shows false
      if (userCredential.user && isEmailVerified) {
        const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          // Update isVerified if it's false but email is verified
          if (!userData?.isVerified) {
            await firestore().collection('users').doc(userCredential.user.uid).update({
              isVerified: true,
              updatedAt: firestore.Timestamp.now()
            });
            console.log('✅ Updated isVerified to true in Firestore');
          }
        }
      }
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
      console.log('Starting sign up process for:', email);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User created successfully:', userCredential.user?.uid);
      
      // Send email verification
      if (userCredential.user) {
        console.log('Sending verification email to:', userCredential.user.email);
        try {
          if (isWeb) {
            // Use web SDK method with action code settings
            const actionCodeSettings = {
              url: `${window.location.origin}/login`, // Redirect to login page after verification
              handleCodeInApp: false,
            };
            await sendEmailVerificationFn(userCredential.user, actionCodeSettings);
            console.log('✅ Verification email sent successfully (Web SDK)');
          } else {
            // Use React Native Firebase method
            // For native, we can use a deep link or web fallback
            const actionCodeSettings = {
              url: 'https://nibjobs.com/login', // Update with your actual domain
              handleCodeInApp: false,
              iOS: {
                bundleId: 'com.nibjobs.app', // Update with your iOS bundle ID
              },
              android: {
                packageName: 'com.nibjobs.app', // Update with your Android package name
                installApp: false,
              },
            };
            await userCredential.user.sendEmailVerification(actionCodeSettings);
            console.log('✅ Verification email sent successfully (Native SDK)');
          }
        } catch (emailError: any) {
          console.error('❌ Failed to send verification email:', emailError);
          throw new Error(`Failed to send verification email: ${emailError.message || emailError}`);
        }
      }
      
      // Create user profile in Firestore matching superadmin schema
      if (userCredential.user) {
        console.log('Creating user profile in Firestore...');
        const newUserProfile: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || '',
          role: 'user',
          isVerified: false,
          isActive: true,
          lastLogin: firestore.Timestamp.now(),
          permissions: [],
          profile: {
            avatar: '',
            bio: '',
            phone: ''
          },
          fcmTokens: [],
          selectedCategories: [],
          isNotificationsEnabled: false,
          createdAt: firestore.Timestamp.now(),
          updatedAt: firestore.Timestamp.now(),
        };
        
        await firestore().collection('users').doc(userCredential.user.uid).set(newUserProfile);
        console.log('✅ User profile created in Firestore');
        setUserProfile(newUserProfile);
      }
      
      console.log('✅ Sign up completed successfully');
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      if (isWeb) {
        throw new Error('Google sign-in is not yet supported on web');
      }
      
      // Import Google Sign-In
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      
      // Configure Google Sign-In
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Create user profile with 'reader' role for Google sign-in matching superadmin schema
      if (userCredential.user) {
        const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();
        
        if (!userDoc.exists) {
          const newUserProfile: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || '',
            displayName: userCredential.user.displayName || '',
            role: 'reader',
            isVerified: true, // Google users are automatically verified
            isActive: true,
            lastLogin: firestore.Timestamp.now(),
            permissions: [],
            profile: {
              avatar: userCredential.user.photoURL || '',
              bio: '',
              phone: ''
            },
            fcmTokens: [],
            selectedCategories: [],
            isNotificationsEnabled: false,
            createdAt: firestore.Timestamp.now(),
            updatedAt: firestore.Timestamp.now(),
          };
          
          await firestore().collection('users').doc(userCredential.user.uid).set(newUserProfile);
          setUserProfile(newUserProfile);
        } else {
          setUserProfile(userDoc.data() as User);
        }
      }
    } catch (error) {
      console.error('Google sign in failed:', error);
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

  const resendVerificationEmail = async () => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      if (isWeb) {
        // Use web SDK method with action code settings
        const actionCodeSettings = {
          url: `${window.location.origin}/login`, // Redirect to login page after verification
          handleCodeInApp: false,
        };
        await sendEmailVerificationFn(user, actionCodeSettings);
      } else {
        // Use React Native Firebase method with action code settings
        const actionCodeSettings = {
          url: 'https://nibjobs.com/login', // Update with your actual domain
          handleCodeInApp: false,
          iOS: {
            bundleId: 'com.nibjobs.app', // Update with your iOS bundle ID
          },
          android: {
            packageName: 'com.nibjobs.app', // Update with your Android package name
            installApp: false,
          },
        };
        await user.sendEmailVerification(actionCodeSettings);
      }
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  };

  const reloadUser = async () => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Reload the Firebase user to get updated emailVerified status
      await user.reload();
      const reloadedUser = auth().currentUser;
      
      // If email is now verified, update the profile
      if (reloadedUser?.emailVerified) {
        await loadUserProfile(reloadedUser.uid);
      }
    } catch (error) {
      console.error('Failed to reload user:', error);
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
    signInWithGoogle,
    signInAnonymously,
    signOut,
    updateUserProfile,
    resendVerificationEmail,
    reloadUser,
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