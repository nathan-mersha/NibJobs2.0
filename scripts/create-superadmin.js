import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBH0Im0qiRhTKEO-GUK30OB28YpYjM",
  authDomain: "nibjobs-dev.firebaseapp.com", 
  projectId: "nibjobs-dev",
  storageBucket: "nibjobs-dev.firebasestorage.app",
  messagingSenderId: "8133180402",
  appId: "1:8133180402:web:c92b62af9df6bb5a85e8a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createSuperAdmin() {
  try {
    console.log('🔐 Creating superadmin user...');
    
    const email = 'nathanmersha@gmail.com';
    const password = 'SuperAdmin@2025!'; // You can change this
    
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`✅ User account created with UID: ${user.uid}`);
    
    // Create user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: email,
      displayName: 'Nathan Mersha',
      role: 'superadmin',
      permissions: [
        'manage_jobs',
        'manage_categories', 
        'manage_users',
        'view_analytics',
        'system_admin'
      ],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: null,
      profile: {
        firstName: 'Nathan',
        lastName: 'Mersha',
        avatar: '👨‍💼',
        department: 'Administration',
        title: 'Super Administrator'
      }
    });
    
    console.log('✅ User profile created in Firestore');
    
    // Create admin settings
    const adminRef = doc(db, 'admin', 'settings');
    await setDoc(adminRef, {
      superAdminEmail: email,
      appVersion: '1.0.0',
      maintenanceMode: false,
      lastUpdated: Timestamp.now(),
      features: {
        jobCategories: true,
        jobManagement: true,
        userManagement: true,
        analytics: true
      }
    });
    
    console.log('✅ Admin settings created');
    
    console.log('🎉 Superadmin setup completed!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🚀 You can now login to the admin panel');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  User already exists, trying to update profile...');
      
      // Sign in and update profile
      const userCredential = await signInWithEmailAndPassword(auth, 'nathanmersha@gmail.com', 'SuperAdmin@2025!');
      const user = userCredential.user;
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: 'nathanmersha@gmail.com',
        displayName: 'Nathan Mersha',
        role: 'superadmin',
        permissions: [
          'manage_jobs',
          'manage_categories', 
          'manage_users',
          'view_analytics',
          'system_admin'
        ],
        isActive: true,
        updatedAt: Timestamp.now(),
        profile: {
          firstName: 'Nathan',
          lastName: 'Mersha',
          avatar: '👨‍💼',
          department: 'Administration',
          title: 'Super Administrator'
        }
      }, { merge: true });
      
      console.log('✅ Existing user profile updated');
    } else {
      console.error('❌ Error creating superadmin:', error);
      throw error;
    }
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('🚀 Setup complete! Ready for admin panel.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });