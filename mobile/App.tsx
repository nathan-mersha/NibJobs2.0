import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, ScrollView, FlatList } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import TelegramChannelsScreen from './src/screens/TelegramChannelsScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppFonts, fonts } from './src/utils/fonts';

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

// Brand colors - Updated with modern palette
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
  danger: '#E74C3C',
  // Modern sidebar colors
  sidebarBg: '#F8FAFC',        // Light gray-blue
  sidebarText: '#475569',      // Slate gray
  sidebarTextActive: '#0F172A', // Dark slate
  sidebarAccent: '#3B82F6',    // Modern blue
  sidebarAccentLight: '#EFF6FF', // Light blue
  sidebarBorder: '#E2E8F0',    // Subtle border
  sidebarHover: '#F1F5F9',     // Hover state
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
  const [user, setUser] = useState<any>(null);

  // URL query-based routing for maintaining state on refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromURL = urlParams.get('tab');
      if (tabFromURL && ['dashboard', 'categories', 'jobs', 'telegram', 'users', 'analytics'].includes(tabFromURL)) {
        setActiveTab(tabFromURL);
      }
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.replaceState({}, '', url.toString());
    }
  };

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
    { id: 'dashboard', title: 'Dashboard', icon: 'dashboard' },
    { id: 'categories', title: 'Job Categories', icon: 'category' },
    { id: 'jobs', title: 'Jobs', icon: 'work' },
    { id: 'telegram', title: 'Telegram Channels', icon: 'chat' },
    { id: 'users', title: 'Users', icon: 'people' },
    { id: 'analytics', title: 'Analytics', icon: 'analytics' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.adminContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarLogoContainer}>
              <View style={styles.logoIconContainer}>
                <Icon name="admin-panel-settings" size={20} color={colors.sidebarAccent} />
              </View>
              <Text style={styles.sidebarLogo}>Admin Panel</Text>
            </View>
            <View style={styles.userContainer}>
              <View style={styles.userAvatar}>
                <Icon name="person" size={16} color={colors.sidebarAccent} />
              </View>
              <Text style={styles.sidebarUser}>
                {user ? `${user.profile?.firstName || 'Admin'}` : 'Loading...'}
              </Text>
            </View>
          </View>

          {sidebarItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sidebarItem,
                activeTab === item.id && styles.sidebarItemActive
              ]}
              onPress={() => handleTabChange(item.id)}
            >
              <View style={[
                styles.iconContainer,
                activeTab === item.id && styles.iconContainerActive
              ]}>
                <Icon 
                  name={item.icon} 
                  size={18} 
                  color={activeTab === item.id ? colors.sidebarAccent : colors.sidebarText} 
                />
              </View>
              <Text style={[
                styles.sidebarText,
                activeTab === item.id && styles.sidebarTextActive
              ]}>
                {item.title}
              </Text>
              {activeTab === item.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutIconContainer}>
              <Icon name="logout" size={18} color={colors.danger} />
            </View>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'categories' && <CategoriesContent />}
          {activeTab === 'jobs' && <JobsContent />}
          {activeTab === 'telegram' && <TelegramChannelsScreen />}
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
  const [categories, setCategories] = useState<any[]>([]);

  const categoryIconMap: { [key: string]: string } = {
    technology: 'computer',
    design: 'design-services', 
    marketing: 'trending-up',
    finance: 'attach-money',
    healthcare: 'local-hospital'
  };

  useEffect(() => {
    // In a real app, fetch from Firestore
    setCategories([
      { id: 'technology', name: 'Technology', icon: 'computer', count: 1 },
      { id: 'design', name: 'Design & Creative', icon: 'design-services', count: 1 },
      { id: 'marketing', name: 'Marketing & Sales', icon: 'trending-up', count: 1 },
      { id: 'finance', name: 'Finance & Accounting', icon: 'attach-money', count: 0 },
      { id: 'healthcare', name: 'Healthcare', icon: 'local-hospital', count: 0 }
    ]);
  }, []);

  return (
    <View style={styles.contentContainer}>
      <View style={styles.contentHeader}>
        <Icon name="category" size={24} color={colors.beeYellow} />
        <Text style={styles.contentTitle}>Job Categories Management</Text>
      </View>
      
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={20} color={colors.white} />
        <Text style={styles.addButtonText}>Add New Category</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {categories.map((category) => (
          <View key={category.id} style={styles.listItem}>
            <View style={styles.listIconContainer}>
              <Icon name={category.icon} size={24} color={colors.beeYellow} />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>{category.name}</Text>
              <Text style={styles.listSubtitle}>{category.count} jobs</Text>
            </View>
            <View style={styles.listActions}>
              <TouchableOpacity style={styles.editButton}>
                <Icon name="edit" size={16} color={colors.softBlue} />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Icon name="delete" size={16} color={colors.danger} />
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
interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  contractType: string;
  location: string;
  salary?: string;
  jobSource: string;
  postedDate?: Date;
  createdAt?: Date;
  isRemote: boolean;
  tags: string[];
}

function JobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading jobs from Firestore...');
      
      // Query the jobs collection, ordered by creation date, limit to latest 50
      const jobsQuery = query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(jobsQuery);
      const jobsData: Job[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        jobsData.push({
          id: doc.id,
          title: data.title || 'No title',
          company: data.company || 'Unknown company',
          category: data.category || 'Other',
          contractType: data.contractType || 'Full-time',
          location: data.location || 'Not specified',
          salary: data.salary,
          jobSource: data.jobSource || 'Unknown',
          postedDate: data.postedDate ? data.postedDate.toDate() : null,
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
          isRemote: data.isRemote || false,
          tags: data.tags || []
        });
      });
      
      console.log(`✅ Loaded ${jobsData.length} jobs from Firestore`);
      setJobs(jobsData);
      setError(null);
      
    } catch (err) {
      console.error('❌ Error loading jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to pad array to make complete rows of 4
  const padArrayForGrid = (array: Job[]) => {
    const paddedArray = [...array];
    const remainder = paddedArray.length % 4;
    if (remainder !== 0) {
      // Add empty placeholder objects to complete the row
      const placeholdersNeeded = 4 - remainder;
      for (let i = 0; i < placeholdersNeeded; i++) {
        paddedArray.push(null as any); // Add null placeholders
      }
    }
    return paddedArray;
  };

  const renderJobCard = ({ item: job }: { item: Job | null }) => {
    // If it's a placeholder (null), return an empty view
    if (!job) {
      return <View style={[styles.jobCard, styles.placeholderCard]} />;
    }
    
    return (
      <View style={styles.jobCard}>
        {/* Job Icon */}
        <View style={styles.jobIconContainer}>
          <Text style={styles.jobIcon}>💼</Text>
        </View>
        
        {/* Job Details */}
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.jobCompany} numberOfLines={1}>
            {job.company}
          </Text>
          <Text style={styles.jobCategory} numberOfLines={1}>
            📂 {job.category}
          </Text>
          
          {job.location && (
            <Text style={styles.jobLocation} numberOfLines={1}>
              📍 {job.location}
            </Text>
          )}
          
          {job.salary && (
            <Text style={styles.jobSalary} numberOfLines={1}>
              💰 {job.salary}
            </Text>
          )}
          
          {/* Badges */}
          <View style={styles.jobBadgesContainer}>
            <View style={[styles.jobBadge, { backgroundColor: colors.beeYellow }]}>
              <Text style={styles.jobBadgeText}>{job.contractType}</Text>
            </View>
            {job.isRemote && (
              <View style={[styles.jobBadge, { backgroundColor: colors.success }]}>
                <Text style={[styles.jobBadgeText, { color: colors.white }]}>Remote</Text>
              </View>
            )}
          </View>
          
          {/* Job Source & Date */}
          <Text style={styles.jobSource} numberOfLines={1}>
            📡 {job.jobSource}
          </Text>
          <Text style={styles.jobDate} numberOfLines={1}>
            ⏰ {job.createdAt ? job.createdAt.toLocaleDateString() : 'Unknown date'}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <View style={styles.contentContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={styles.contentTitle}>💼 Jobs ({jobs.length})</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.beeYellow }]}
          onPress={loadJobs}
        >
          <Text style={[styles.addButtonText, { color: colors.deepNavy }]}>
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={{ padding: 15, backgroundColor: colors.danger, borderRadius: 8, marginBottom: 15 }}>
          <Text style={{ color: colors.white, fontWeight: 'bold' }}>❌ Error loading jobs</Text>
          <Text style={{ color: colors.white }}>{error}</Text>
        </View>
      )}
      
      {loading && jobs.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: colors.warmGray }}>📋 Loading jobs from database...</Text>
        </View>
      ) : jobs.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: colors.warmGray }}>🔍 No jobs found</Text>
          <Text style={{ fontSize: 14, color: colors.warmGray, textAlign: 'center', marginTop: 5 }}>
            Run the Telegram scraping to populate jobs from channels
          </Text>
        </View>
      ) : (
        <FlatList
          data={padArrayForGrid(jobs)}
          renderItem={renderJobCard}
          keyExtractor={(item: Job | null, index: number) => item?.id || `placeholder-${index}`}
          numColumns={4}
          columnWrapperStyle={styles.jobRow}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          style={styles.jobsGrid}
        />
      )}
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
  const [user, setUser] = useState<any>(null);
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing || !fontsLoaded) {
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
    fontFamily: fonts.bold,
    color: colors.deepNavy,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
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
    width: 280,
    backgroundColor: colors.sidebarBg,
    paddingVertical: 24,
    borderRightWidth: 1,
    borderRightColor: colors.sidebarBorder,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sidebarHeader: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.sidebarBorder,
    marginBottom: 16,
  },
  sidebarLogo: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.sidebarTextActive,
    marginLeft: 12,
  },
  sidebarUser: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.sidebarText,
    marginLeft: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 1,
    borderRadius: 10,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: colors.sidebarAccentLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.sidebarAccent,
  },
  sidebarIcon: {
    fontSize: 22,
    marginRight: 16,
  },
  sidebarText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.sidebarText,
    flex: 1,
  },
  sidebarTextActive: {
    color: colors.sidebarTextActive,
    fontFamily: fonts.bold,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 'auto',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sidebarBorder,
  },
  logoutIcon: {
    fontSize: 22,
    marginRight: 16,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.danger,
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
    fontFamily: fonts.medium,
  },
  comingSoon: {
    fontSize: 18,
    fontFamily: fonts.regular,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: 100,
    fontStyle: 'italic',
  },
  // Missing styles - Modern Sidebar Design
  sidebarLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.sidebarAccentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.sidebarAccentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: colors.white,
  },
  activeIndicator: {
    position: 'absolute',
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sidebarAccent,
  },
  logoutIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  listIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  // Job Grid Styles
  jobsGrid: {
    flex: 1,
  },
  jobRow: {
    justifyContent: 'space-between',
    marginHorizontal: -6, // Negative margin to offset card margins
  },
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    margin: 6,
    flex: 1,
    maxWidth: '23%', // Slightly less than 25% to account for margins
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  jobIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  jobIcon: {
    fontSize: 24,
    color: colors.deepNavy,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.deepNavy,
    marginBottom: 4,
    textAlign: 'center',
  },
  jobCompany: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.warmGray,
    marginBottom: 4,
    textAlign: 'center',
  },
  jobCategory: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.softBlue,
    marginBottom: 4,
    textAlign: 'center',
  },
  jobLocation: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.warmGray,
    marginBottom: 2,
    textAlign: 'center',
  },
  jobSalary: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.success,
    marginBottom: 6,
    textAlign: 'center',
  },
  jobBadgesContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 6,
  },
  jobBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
    minWidth: 50,
  },
  jobBadgeText: {
    fontSize: 9,
    fontFamily: fonts.medium,
    color: colors.deepNavy,
    textAlign: 'center',
  },
  jobSource: {
    fontSize: 9,
    fontFamily: fonts.regular,
    color: colors.warmGray,
    marginBottom: 2,
    textAlign: 'center',
  },
  jobDate: {
    fontSize: 9,
    fontFamily: fonts.regular,
    color: colors.warmGray,
    textAlign: 'center',
  },
});