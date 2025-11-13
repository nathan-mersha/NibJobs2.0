import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

// Web-compatible Firebase stub for development
export const webFirebaseStub = {
  auth: () => ({
    onAuthStateChanged: (callback: (user: any) => void) => {
      // Mock user for web development
      const mockUser = {
        uid: 'web-user-123',
        email: 'web@example.com',
        isAnonymous: false,
      };
      setTimeout(() => callback(mockUser), 100);
      return () => {}; // unsubscribe function
    },
    signInWithEmailAndPassword: async (email: string, password: string) => {
      return { user: { uid: 'web-user-123', email, isAnonymous: false } };
    },
    createUserWithEmailAndPassword: async (email: string, password: string) => {
      return { user: { uid: 'web-user-123', email, isAnonymous: false } };
    },
    signInAnonymously: async () => {
      return { user: { uid: 'web-guest-123', email: null, isAnonymous: true } };
    },
    signOut: async () => {
      return Promise.resolve();
    },
    currentUser: {
      uid: 'web-user-123',
      email: 'web@example.com',
      isAnonymous: false,
    },
  }),
  firestore: () => ({
    collection: (path: string) => ({
      doc: (id?: string) => ({
        set: async (data: any) => Promise.resolve(),
        get: async () => ({ 
          exists: true, 
          data: () => ({ 
            id: id || 'mock-doc-id'
          })
        }),
        update: async (data: any) => Promise.resolve(),
        onSnapshot: (callback: (doc: any) => void) => {
          setTimeout(() => callback({ 
            exists: true, 
            data: () => ({ id: id || 'mock-doc-id' })
          }), 100);
          return () => {};
        },
      }),
      add: async (data: any) => Promise.resolve({ id: 'mock-doc-id' }),
      where: () => ({
        get: async () => ({ docs: [] }),
        onSnapshot: (callback: (snapshot: any) => void) => {
          setTimeout(() => callback({ docs: [] }), 100);
          return () => {};
        },
      }),
    }),
  }),
  messaging: () => ({
    requestPermission: async () => 'granted',
    getToken: async () => 'mock-fcm-token',
    onMessage: (callback: (message: any) => void) => () => {},
    onNotificationOpenedApp: (callback: (message: any) => void) => () => {},
  }),
};