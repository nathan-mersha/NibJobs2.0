// Firebase mock for web development

export default () => ({
  // Mock auth
  onAuthStateChanged: (callback) => {
    const mockUser = { uid: 'web-user', email: 'web@example.com', isAnonymous: false };
    setTimeout(() => callback(mockUser), 100);
    return () => {}; // unsubscribe
  },
  signInWithEmailAndPassword: async () => ({ user: { uid: 'web-user' } }),
  createUserWithEmailAndPassword: async () => ({ user: { uid: 'web-user' } }),
  signInAnonymously: async () => ({ user: { uid: 'web-guest', isAnonymous: true } }),
  signOut: async () => {},
  currentUser: { uid: 'web-user', email: 'web@example.com' },
});

// Mock firestore
export const firestore = () => ({
  collection: () => ({
    doc: () => ({
      set: async () => {},
      get: async () => ({ exists: true, data: () => ({}) }),
      update: async () => {},
      onSnapshot: (callback) => {
        setTimeout(() => callback({ exists: true, data: () => ({}) }), 100);
        return () => {};
      },
    }),
    add: async () => ({ id: 'mock-id' }),
    where: () => ({
      get: async () => ({ docs: [] }),
      onSnapshot: (callback) => {
        setTimeout(() => callback({ docs: [] }), 100);
        return () => {};
      },
    }),
  }),
});

// Mock messaging
export const messaging = () => ({
  requestPermission: async () => 'granted',
  getToken: async () => 'mock-token',
  onMessage: () => () => {},
  onNotificationOpenedApp: () => () => {},
});

// Export types mock
export const FirebaseAuthTypes = {};

module.exports = {
  default: () => ({}),
  firestore,
  messaging,
  FirebaseAuthTypes,
};