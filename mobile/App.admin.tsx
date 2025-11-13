import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Brand colors
const colors = {
  beeYellow: '#F4C430',
  honeyGold: '#D4AF37',
  darkYellow: '#B8860B',
  deepNavy: '#1A1B3E',
  charcoal: '#2C2C2C',
  cream: '#FFF9E6',
  white: '#FFFFFF',
  warmGray: '#6B6B6B',
  lightGray: '#F5F5F5',
  softBlue: '#4A90E2',
  success: '#27AE60',
  danger: '#E74C3C'
};

// Login Screen
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('nathanmersha@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'superadmin') {
        navigation.replace('AdminPanel');
      } else {
        Alert.alert('Access Denied', 'You do not have admin privileges');
        await signOut(auth);
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.logo}>🐝 NibJobs Admin</Text>
        <Text style={styles.subtitle}>Administrator Login</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter admin email"
            placeholderTextColor={colors.warmGray}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.warmGray}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Super Admin Access Only
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Admin Panel Screen with Sidebar
function AdminPanelScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        if (userDoc.exists()) {
          setUser({ ...authUser, ...userDoc.data() });
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  const sidebarItems = [
    { id: 'dashboard', title: 'Dashboard', icon: '📊' },
    { id: 'categories', title: 'Job Categories', icon: '📋' },
    { id: 'jobs', title: 'Jobs', icon: '💼' },
    { id: 'users', title: 'Users', icon: '👥' },
    { id: 'analytics', title: 'Analytics', icon: '📈' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.adminContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarLogo}>🐝 Admin</Text>
            <Text style={styles.sidebarUser}>
              {user ? `👨‍💼 ${user.profile?.firstName || 'Admin'}` : 'Loading...'}
            </Text>
          </View>

          {sidebarItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sidebarItem,
                activeTab === item.id && styles.sidebarItemActive
              ]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text style={styles.sidebarIcon}>{item.icon}</Text>
              <Text style={[
                styles.sidebarText,
                activeTab === item.id && styles.sidebarTextActive
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'categories' && <CategoriesContent />}
          {activeTab === 'jobs' && <JobsContent />}
          {activeTab === 'users' && <UsersContent />}
          {activeTab === 'analytics' && <AnalyticsContent />}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Dashboard Content
function DashboardContent() {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>📊 Admin Dashboard</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>10</Text>
          <Text style={styles.statLabel}>Job Categories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Admin Users</Text>
        </View>
      </View>
      
      <Text style={styles.welcomeText}>
        Welcome to the NibJobs Admin Panel! 🐝
        {'\n\n'}
        Use the sidebar to manage job categories, jobs, and users.
      </Text>
    </View>
  );
}

// Categories Content
function CategoriesContent() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // In a real app, fetch from Firestore
    setCategories([
      { id: 'technology', name: 'Technology', icon: '💻', count: 1 },
      { id: 'design', name: 'Design & Creative', icon: '🎨', count: 1 },
      { id: 'marketing', name: 'Marketing & Sales', icon: '📈', count: 1 },
      { id: 'finance', name: 'Finance & Accounting', icon: '💰', count: 0 },
      { id: 'healthcare', name: 'Healthcare', icon: '🏥', count: 0 }
    ]);
  }, []);

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>📋 Job Categories Management</Text>
      
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add New Category</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {categories.map((category) => (
          <View key={category.id} style={styles.listItem}>
            <Text style={styles.listIcon}>{category.icon}</Text>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>{category.name}</Text>
              <Text style={styles.listSubtitle}>{category.count} jobs</Text>
            </View>
            <View style={styles.listActions}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Jobs Content
function JobsContent() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // In a real app, fetch from Firestore
    setJobs([
      { id: '1', title: 'Senior Frontend Developer', company: 'BeeTech Solutions', category: 'Technology', status: 'Active' },
      { id: '2', title: 'UX Designer', company: 'Golden Hive Studios', category: 'Design', status: 'Active' },
      { id: '3', title: 'Digital Marketing Specialist', company: 'HoneyWork Corp', category: 'Marketing', status: 'Active' }
    ]);
  }, []);

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>💼 Jobs Management</Text>
      
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add New Job</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {jobs.map((job) => (
          <View key={job.id} style={styles.listItem}>
            <Text style={styles.listIcon}>💼</Text>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>{job.title}</Text>
              <Text style={styles.listSubtitle}>{job.company} • {job.category}</Text>
              <Text style={[styles.statusBadge, { color: colors.success }]}>{job.status}</Text>
            </View>
            <View style={styles.listActions}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Users Content
function UsersContent() {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>👥 User Management</Text>
      <Text style={styles.comingSoon}>Coming Soon...</Text>
    </View>
  );
}

// Analytics Content
function AnalyticsContent() {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>📈 Analytics</Text>
      <Text style={styles.comingSoon}>Coming Soon...</Text>
    </View>
  );
}

// Navigation Setup
const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🐝 NibJobs</Text>
          <Text style={styles.loadingSubtext}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.beeYellow,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: colors.deepNavy,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: colors.cream,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.deepNavy,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.warmGray,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.deepNavy,
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: colors.beeYellow,
    fontSize: 16,
    color: colors.deepNavy,
  },
  loginButton: {
    backgroundColor: colors.deepNavy,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: colors.warmGray,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    textAlign: 'center',
    color: colors.warmGray,
    marginTop: 20,
    fontStyle: 'italic',
  },
  adminContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: colors.deepNavy,
    paddingVertical: 20,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.beeYellow,
    marginBottom: 20,
  },
  sidebarLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.beeYellow,
    marginBottom: 5,
  },
  sidebarUser: {
    fontSize: 14,
    color: colors.white,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  sidebarItemActive: {
    backgroundColor: colors.beeYellow,
  },
  sidebarIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sidebarText: {
    fontSize: 16,
    color: colors.white,
  },
  sidebarTextActive: {
    color: colors.deepNavy,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 'auto',
    marginHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.danger,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  contentContainer: {
    flex: 1,
    padding: 30,
  },
  contentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderLeftWidth: 4,
    borderLeftColor: colors.beeYellow,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  statLabel: {
    fontSize: 14,
    color: colors.warmGray,
    marginTop: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.warmGray,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: colors.beeYellow,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: colors.deepNavy,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  listIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 5,
  },
  listSubtitle: {
    fontSize: 14,
    color: colors.warmGray,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  listActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: colors.softBlue,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  comingSoon: {
    fontSize: 18,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: 100,
    fontStyle: 'italic',
  },
});