import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, ScrollView, FlatList, Image, Animated, Dimensions } from 'react-native';
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
const lightColors = {
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

// Dark theme colors
const darkColors = {
  beeYellow: '#FFD700',
  honeyGold: '#FFA500',
  darkYellow: '#FF8C00',
  deepNavy: '#E2E8F0',
  charcoal: '#F8F9FA',
  cream: '#1A1D23',
  white: '#0F1114',
  warmGray: '#9CA3AF',
  lightGray: '#1F2937',
  softBlue: '#60A5FA',
  success: '#10B981',
  danger: '#F87171',
  // Modern sidebar colors (dark)
  sidebarBg: '#1F2937',
  sidebarText: '#9CA3AF',
  sidebarTextActive: '#F9FAFB',
  sidebarAccent: '#60A5FA',
  sidebarAccentLight: '#1E3A8A',
  sidebarBorder: '#374151',
  sidebarHover: '#374151',
};

// Multi-language translations
const translations = {
  en: {
    appTitle: 'NibJobs',
    searchPlaceholder: 'Search jobs...',
    login: 'Login',
    signUp: 'Sign Up',
    exploreChannels: '🚀 Explore Telegram Channels',
    swipeHint: '← Swipe to explore more channels →',
    recentJobs: 'Recent Jobs',
    jobsFound: 'jobs found',
    loading: 'Loading jobs...',
    categories: 'Categories',
    contractType: 'Contract Type',
    location: 'Location',
    remoteJobs: 'Remote Jobs',
    clearFilters: 'Clear Filters',
    adminLogin: 'Administrator Login',
    email: 'Email',
    password: 'Password',
    loginButton: 'Login',
    loginError: 'Please enter email and password',
    invalidCredentials: 'Invalid email or password',
    telegramChannel: 'Telegram Channel',
    members: 'members',
    darkMode: 'Dark Mode',
    language: 'Language',
    downloadPlayStore: 'Play Store',
    downloadAppStore: 'App Store'
  },
  am: { // Amharic
    appTitle: 'ንብ ስራዎች',
    searchPlaceholder: 'ስራዎችን ይፈልጉ...',
    login: 'ግባ',
    signUp: 'መመዝገብ',
    exploreChannels: '🚀 የቴሌግራም ቻናሎችን አስሱ',
    swipeHint: '← ተጨማሪ ቻናሎችን ለማስሳት ይንሸራተቱ →',
    recentJobs: 'የቅርብ ጊዜ ስራዎች',
    jobsFound: 'ስራዎች ተገኝተዋል',
    loading: 'ስራዎች በመጫን ላይ...',
    categories: 'ምድቦች',
    contractType: 'የኮንትራት አይነት',
    location: 'አካባቢ',
    remoteJobs: 'የርቀት ስራዎች',
    clearFilters: 'ማጣሪያዎችን አጽዳ',
    adminLogin: 'የአስተዳዳሪ መግቢያ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    loginButton: 'ግባ',
    loginError: 'እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ',
    invalidCredentials: 'ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል',
    telegramChannel: 'የቴሌግራም ቻናል',
    members: 'አባላት',
    darkMode: 'ጨለማ ገጽታ',
    language: 'ቋንቋ',
    downloadPlayStore: 'ፕሌይ ስቶር',
    downloadAppStore: 'አፕ ስቶር'
  },
  ti: { // Tigrigna
    appTitle: 'ንብ ስራሕቲ',
    searchPlaceholder: 'ስራሕቲ ድለ...',
    login: 'እተ',
    signUp: 'ምዝገባ',
    exploreChannels: '🚀 የቴሌግራም መርሔታት ርኣ',
    swipeHint: '← ተወሳኺ መርሔታት ንምርኣይ ኣንሸራሽር →',
    recentJobs: 'ናይ ሓዳሽ ስራሕቲ',
    jobsFound: 'ስራሕቲ ተረኺቦም',
    loading: 'ስራሕቲ ይጽዓኑ ኣለዉ...',
    categories: 'ምድባት',
    contractType: 'ዓይነት ሰንዱ',
    location: 'ቦታ',
    remoteJobs: 'ናይ ርሑቕ ስራሕቲ',
    clearFilters: 'መጻርያታት ሰርዝ',
    adminLogin: 'ናይ ኣመሓዳሪ መእተዊ',
    email: 'ኢመይል',
    password: 'መሕለፊ ቃል',
    loginButton: 'እተ',
    loginError: 'ኢመይልን መሕለፊ ቃልን ኣእቱ',
    invalidCredentials: 'ዘይቅኑዕ ኢመይል ወይ መሕለፊ ቃል',
    telegramChannel: 'የቴሌግራም መርሔ',
    members: 'ኣባላት',
    darkMode: 'ጸልማት ገጽታ',
    language: 'ቋንቋ',
    downloadPlayStore: 'ፕሌይ ስቶር',
    downloadAppStore: 'አፕ ስቶር'
  },
  or: { // Oromifa
    appTitle: 'Niib Hojii',
    searchPlaceholder: 'Hojii barbaadi...',
    login: 'Seeni',
    signUp: 'Galmaa\'i',
    exploreChannels: '🚀 Chaanalii Telegram qoradhaa',
    swipeHint: '← Chaanalii dabalataa argachuuf garagali →',
    recentJobs: 'Hojii Yeroo Dhiyoo',
    jobsFound: 'hojiin argame',
    loading: 'Hojiin ni fe\'ama...',
    categories: 'Gosa',
    contractType: 'Gosa Kontraata',
    location: 'Bakka',
    remoteJobs: 'Hojii Fagoo',
    clearFilters: 'Calalchiisa haqxi',
    adminLogin: 'Seensa Bulchiinsa',
    email: 'Imeelii',
    password: 'Jecha Icciitii',
    loginButton: 'Seeni',
    loginError: 'Imeelii fi jecha icciitii galchi',
    invalidCredentials: 'Imeelii ykn jecha icciitii dogoggoraa',
    telegramChannel: 'Chaanalii Telegram',
    members: 'miseensa',
    darkMode: 'Haala Dukkana',
    language: 'Afaan',
    downloadPlayStore: 'Play Store',
    downloadAppStore: 'App Store'
  }
};

// Helper function to get current colors based on theme
const getColors = (isDarkMode: boolean) => isDarkMode ? darkColors : lightColors;

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
        {/* Header */}
        <View style={styles.loginHeader}>
          <Image source={require('./assets/favicon.png')} style={styles.loginLogoImage} />
          <Text style={styles.loginTitle}>NibJobs</Text>
          <Text style={styles.loginSubtitle}>Administrator Login</Text>
        </View>
        
        {/* Login Form */}
        <View style={styles.loginForm}>
          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <Icon name="email" size={20} color={colors.warmGray} style={styles.inputIcon} />
              <TextInput
                style={styles.modernInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={colors.warmGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <Icon name="lock" size={20} color={colors.warmGray} style={styles.inputIcon} />
              <TextInput
                style={styles.modernInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.warmGray}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.modernLoginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingButtonContent}>
                <Text style={styles.modernLoginButtonText}>Signing In...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.modernLoginButtonText}>Sign In</Text>
                <Icon name="arrow-forward" size={20} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity 
          style={styles.backToHome}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="arrow-back" size={16} color={colors.softBlue} />
          <Text style={styles.backToHomeText}>Back to Home</Text>
        </TouchableOpacity>
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
    // Clear URL parameters when logging out
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, '/');
    }
    navigation.replace('Home');
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
                <Image source={require('./assets/favicon.png')} style={styles.sidebarLogoImage} />
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
        <View style={styles.adminMainContent}>
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
        Welcome to the NibJobs Admin Panel! 
        Looking for the latest job opportunities? You're in the right place.
        {'\n\n'}
        Use the sidebar to manage job categories, jobs, and users.
      </Text>
    </View>
  );
}

// Categories Content
function CategoriesContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getIconFromEmoji = (emoji: string): string => {
    const emojiIconMap: { [key: string]: string } = {
      '💻': 'computer',
      '📢': 'trending-up',
      '💰': 'attach-money',
      '🏥': 'local-hospital',
      '🎓': 'school',
      '🌍': 'public'
    };
    return emojiIconMap[emoji] || 'category';
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching categories from Firebase...');
      
      // Use a simpler query first - just get all categories without ordering
      // Once the index is built, we can add back the orderBy clauses
      const categoriesQuery = collection(db, 'categories');
      
      console.log('📡 Executing query...');
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      console.log('📊 Query results:', {
        empty: categoriesSnapshot.empty,
        size: categoriesSnapshot.size,
        docs: categoriesSnapshot.docs.length
      });
      
      const fetchedCategories = categoriesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📝 Category doc:', { id: doc.id, data });
        return {
          id: doc.id,
          ...data,
          icon: getIconFromEmoji(data.icon || '📁')
        };
      });
      
      // Sort manually in the client for now
      fetchedCategories.sort((a: any, b: any) => {
        if (a.level !== b.level) {
          return (a.level || 0) - (b.level || 0); // Sort by level first
        }
        return (a.order || 0) - (b.order || 0); // Then by order
      });
      
      console.log('✅ Fetched categories:', fetchedCategories);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to load categories: ${errorMessage}`);
      // Fallback to empty array
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.contentContainer}>
      <View style={styles.contentHeader}>
        <Icon name="category" size={24} color={colors.beeYellow} />
        <Text style={styles.contentTitle}>Job Categories Management</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="category" size={48} color={colors.warmGray} />
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtext}>Categories will appear here once they are created</Text>
            </View>
          ) : (
            categories.map((category) => (
              <View key={category.id} style={[
                styles.listItem,
                category.level === 1 && styles.subcategoryItem
              ]}>
                <View style={styles.listIconContainer}>
                  <Icon name={category.icon} size={24} color={category.color || colors.beeYellow} />
                </View>
                <View style={styles.listInfo}>
                  <Text style={[
                    styles.listTitle,
                    category.level === 1 && styles.subcategoryTitle
                  ]}>
                    {category.level === 1 ? '  • ' : ''}{category.name}
                  </Text>
                  <Text style={styles.listSubtitle}>
                    {category.jobCount || 0} jobs
                    {category.level === 0 && ` • ${category.path}`}
                    {category.level === 1 && ` • ${category.fullPath}`}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
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
        <Icon name="work" size={20} color={colors.deepNavy} />
      </View>        {/* Job Details */}
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
            <View style={[styles.jobBadge, { backgroundColor: lightColors.beeYellow }]}>
              <Text style={styles.jobBadgeText}>{job.contractType}</Text>
            </View>
            {job.isRemote && (
              <View style={[styles.jobBadge, { backgroundColor: lightColors.success }]}>
                <Text style={[styles.jobBadgeText, { color: lightColors.white }]}>Remote</Text>
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
        <Text style={styles.contentTitle}>Jobs ({jobs.length})</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: lightColors.beeYellow }]}
          onPress={loadJobs}
        >
          <Text style={[styles.addButtonText, { color: lightColors.deepNavy }]}>
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={{ padding: 15, backgroundColor: lightColors.danger, borderRadius: 8, marginBottom: 15 }}>
          <Text style={{ color: lightColors.white, fontWeight: 'bold' }}>❌ Error loading jobs</Text>
          <Text style={{ color: lightColors.white }}>{error}</Text>
        </View>
      )}
      
      {loading && jobs.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: lightColors.warmGray }}>📋 Loading jobs from database...</Text>
        </View>
      ) : jobs.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: lightColors.warmGray }}>🔍 No jobs found</Text>
          <Text style={{ fontSize: 14, color: lightColors.warmGray, textAlign: 'center', marginTop: 5 }}>
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

// Home Screen Component
function HomeScreen({ navigation }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [telegramChannels, setTelegramChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  
  // Theme and Language states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // 'en', 'am', 'ti', 'or'
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 60, right: 20 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const languageButtonRef = useRef<TouchableOpacity>(null);
  const channelScrollViewRef = useRef<ScrollView>(null);
  
  // Responsive design
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const isMobile = dimensions.width < 480;
  const isTablet = dimensions.width >= 480 && dimensions.width < 768;
  const isDesktop = dimensions.width >= 768;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  // Helper variables for current theme and language
  const colors = getColors(isDarkMode);
  const t = translations[currentLanguage as keyof typeof translations];
  
  // Language options for dropdown
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'am', label: 'አማርኛ' },
    { code: 'ti', label: 'ትግርኛ' },
    { code: 'or', label: 'Afaan Oromoo' }
  ];
  
  const getCurrentLanguage = () => {
    return languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];
  };
  
  // Dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: colors.white,
    },
    toolbar: {
      ...styles.toolbar,
      backgroundColor: colors.white,
    },
    appTitle: {
      ...styles.appTitle,
      color: colors.deepNavy,
    },
    searchContainer: {
      ...styles.searchContainer,
      backgroundColor: colors.lightGray,
    },
    searchInput: {
      ...styles.searchInput,
      color: colors.deepNavy,
    },
    leftContent: {
      ...styles.leftContent,
      backgroundColor: colors.cream,
    },
    channelsSection: {
      ...styles.channelsSection,
      backgroundColor: colors.white,
    },
    channelCard: {
      ...styles.channelCard,
      backgroundColor: colors.cream,
      borderColor: colors.beeYellow,
    },
    jobsSection: {
      ...styles.jobsSection,
      backgroundColor: colors.white,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      color: colors.deepNavy,
    },
    // Job card styles
    jobCard: {
      ...styles.jobCard,
      backgroundColor: colors.white,
      borderColor: colors.lightGray,
    },
    // Filter sidebar styles
    filterSidebar: {
      ...styles.filterSidebar,
      backgroundColor: colors.white,
      borderLeftColor: colors.sidebarBorder,
    },
    filterTitle: {
      ...styles.filterTitle,
      color: colors.deepNavy,
    },
    filterLabel: {
      ...styles.filterLabel,
      color: colors.deepNavy,
    },
    filterOption: {
      ...styles.filterOption,
      backgroundColor: colors.lightGray,
    },
    filterOptionText: {
      ...styles.filterOptionText,
      color: colors.deepNavy,
    },
    jobsCount: {
      ...styles.jobsCount,
      color: colors.warmGray,
    },
    // Job card text styles
    jobTitle: {
      ...styles.jobTitle,
      color: colors.deepNavy,
    },
    jobCompany: {
      ...styles.jobCompany,
      color: colors.warmGray,
    },
    jobCategory: {
      ...styles.jobCategory,
      color: colors.softBlue,
    },
    jobLocation: {
      ...styles.jobLocation,
      color: colors.warmGray,
    },
    jobSalary: {
      ...styles.jobSalary,
      color: colors.success,
    },
    jobBadgeText: {
      ...styles.jobBadgeText,
      color: colors.deepNavy,
    },
    jobSource: {
      ...styles.jobSource,
      color: colors.warmGray,
    },
    jobDate: {
      ...styles.jobDate,
      color: colors.warmGray,
    },
    // Download button styles
    downloadButton: {
      ...styles.downloadButton,
      backgroundColor: colors.beeYellow,
    },
    downloadButtonText: {
      ...styles.downloadButtonText,
      color: colors.deepNavy,
    },
    
    // Modern Header Dynamic Styles
    modernHeader: {
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    modernBrandText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.deepNavy,
    },
    modernNavText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.warmGray,
    },
    
    // Hero Section Dynamic Styles
    heroSection: {
      backgroundColor: colors.white,
    },
    heroTitle: {
      fontSize: 48,
      fontWeight: '800',
      color: colors.deepNavy,
      marginBottom: 16,
      lineHeight: 56,
    },
    heroSubtitle: {
      fontSize: 18,
      color: colors.warmGray,
      marginBottom: 32,
      lineHeight: 28,
    },
    modernSearchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.lightGray,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 4,
      gap: 16,
      marginBottom: 32,
    },
    modernSearchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.deepNavy,
      paddingVertical: 12,
    },
    heroStatNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.deepNavy,
      marginBottom: 4,
    },
    heroStatLabel: {
      fontSize: 14,
      color: colors.warmGray,
    },
    heroImageText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.warmGray,
      marginTop: 12,
    },
    
    // Mobile Menu Dynamic Styles
    mobileMenu: {
      position: 'absolute',
      top: 80,
      left: 20,
      right: 20,
      backgroundColor: colors.white,
      borderRadius: 12,
      shadowColor: colors.charcoal,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    mobileMenuTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.deepNavy,
    },
    mobileMenuItemText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.deepNavy,
    },
    mobileMenuSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.warmGray,
      marginBottom: 12,
    },
    sectionSubtitle: {
      fontSize: 20,
      color: '#6c757d',
      fontFamily: fonts.regular,
      textAlign: 'center',
      maxWidth: 700,
      alignSelf: 'center',
      lineHeight: 32,
    },
    aboutText: {
      fontSize: 17,
      lineHeight: 30,
      color: '#495057',
      fontFamily: fonts.regular,
      marginBottom: 0,
      textAlign: 'center',
    },
    aboutFeatureTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: '#212529',
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    aboutFeatureDescription: {
      fontSize: 15,
      lineHeight: 24,
      color: '#6c757d',
      fontFamily: fonts.regular,
    },
    pricingTierName: {
      fontSize: 28,
      fontWeight: '700',
      color: '#212529',
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    pricingPrice: {
      fontSize: 56,
      fontWeight: '800',
      color: '#212529',
      marginBottom: 4,
      letterSpacing: -1,
    },
    pricingPeriod: {
      fontSize: 16,
      color: '#6c757d',
      fontFamily: fonts.regular,
      letterSpacing: 0.3,
    },
    pricingFeatureText: {
      fontSize: 15,
      lineHeight: 24,
      color: '#495057',
      fontFamily: fonts.regular,
      flex: 1,
    },
  });
  
  // Theme and language handlers
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const changeLanguage = (langCode: string) => {
    setCurrentLanguage(langCode);
    setIsLanguageDropdownOpen(false); // Close dropdown after selection
  };
  
  const toggleLanguageDropdown = () => {
    if (!isLanguageDropdownOpen && languageButtonRef.current) {
      languageButtonRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height + 5, // 5px below the button
          right: window.innerWidth - x - width, // Align right edge with button's right edge
        });
      });
    }
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  useEffect(() => {
    fetchJobs();
    fetchTelegramChannels();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [allJobs, searchText, selectedCategory, selectedContractType, selectedLocation, isRemote]);

  // Auto-scroll effect for infinite channel scroll
  useEffect(() => {
    if (telegramChannels.length === 0) return;
    
    let scrollPosition = 0;
    const scrollSpeed = 1; // pixels per interval
    const intervalTime = 30; // milliseconds
    
    const autoScroll = setInterval(() => {
      if (channelScrollViewRef.current) {
        scrollPosition += scrollSpeed;
        
        // Calculate total content width (channels * card width)
        const cardWidth = 120; // Width of simplified card
        const totalWidth = telegramChannels.length * cardWidth;
        
        // Reset to beginning when reaching the end for infinite loop effect
        if (scrollPosition >= totalWidth / 2) {
          scrollPosition = 0;
        }
        
        channelScrollViewRef.current.scrollTo({
          x: scrollPosition,
          animated: false,
        });
      }
    }, intervalTime);
    
    return () => clearInterval(autoScroll);
  }, [telegramChannels]);

  const filterJobs = () => {
    let filtered = [...allJobs];

    // Search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(job => 
        (job.title || '').toLowerCase().includes(searchLower) ||
        (job.company || '').toLowerCase().includes(searchLower) ||
        (job.description || '').toLowerCase().includes(searchLower) ||
        (job.category || '').toLowerCase().includes(searchLower) ||
        (job.location || '').toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(job => 
        job.categoryId === selectedCategory || 
        job.mainCategoryId === selectedCategory ||
        job.category === selectedCategory
      );
    }

    // Contract type filter
    if (selectedContractType) {
      filtered = filtered.filter(job => job.contractType === selectedContractType);
    }

    // Location filter
    if (selectedLocation) {
      if (selectedLocation === 'Remote') {
        filtered = filtered.filter(job => job.isRemote === true);
      } else {
        filtered = filtered.filter(job => 
          (job.location || '').toLowerCase().includes(selectedLocation.toLowerCase())
        );
      }
    }

    // Remote filter
    if (isRemote) {
      filtered = filtered.filter(job => job.isRemote === true);
    }

    setFilteredJobs(filtered);
    setJobs(filtered);
  };

  const fetchJobs = async () => {
    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      const fetchedJobs = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllJobs(fetchedJobs);
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTelegramChannels = async () => {
    try {
      const channelsQuery = query(
        collection(db, 'telegramChannels')
        // Removed limit to show all telegram channels
      );
      const channelsSnapshot = await getDocs(channelsQuery);
      const fetchedChannels = channelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTelegramChannels(fetchedChannels);
    } catch (error) {
      console.error('Error fetching telegram channels:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesQuery = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const fetchedCategories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort manually in the client
      fetchedCategories.sort((a: any, b: any) => {
        if (a.level !== b.level) {
          return (a.level || 0) - (b.level || 0);
        }
        return (a.order || 0) - (b.order || 0);
      });
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogin = () => {
    console.log('HandleLogin called, navigation:', navigation);
    try {
      // Clear any URL parameters before navigating to login
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (navigation && navigation.navigate) {
        navigation.navigate('Login');
      } else {
        console.error('Navigation object is not available or navigate method missing');
      }
    } catch (error) {
      console.error('Error navigating to Login:', error);
    }
  };

  const handleSearch = () => {
    // Search is handled by useEffect when searchText changes
    filterJobs();
  };

  const handleGooglePlayDownload = () => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kelem.nibjobs&pcampaignid=web_share';
    if (typeof window !== 'undefined') {
      window.open(playStoreUrl, '_blank');
    }
  };

  const handleAppStoreDownload = () => {
    const appStoreUrl = 'https://apps.apple.com/app/nibjobs/id123456789'; // Replace with actual App Store ID when available
    if (typeof window !== 'undefined') {
      window.open(appStoreUrl, '_blank');
    }
  };

  const renderJobCard = ({ item: job }: any) => (
    <TouchableOpacity style={dynamicStyles.jobCard} activeOpacity={0.8}>
      <View style={styles.jobCardHeader}>
        <View style={styles.jobIconCircle}>
          <Icon name="work-outline" size={20} color={colors.beeYellow} />
        </View>
        {job.contractType && (
          <View style={styles.jobTypeBadge}>
            <Text style={styles.jobTypeBadgeText}>{job.contractType}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.jobCardContent}>
        <Text style={dynamicStyles.jobTitle} numberOfLines={2}>{job.title || 'Job Title'}</Text>
        <Text style={dynamicStyles.jobCompany} numberOfLines={1}>{job.company || 'Company'}</Text>
        
        <View style={styles.jobMetaRow}>
          <View style={styles.jobMetaItem}>
            <Icon name="location-on" size={14} color={colors.warmGray} />
            <Text style={dynamicStyles.jobLocation} numberOfLines={1}>{job.location || 'Location'}</Text>
          </View>
        </View>
        
        {job.salary && (
          <View style={styles.jobSalaryRow}>
            <Icon name="payments" size={14} color={colors.success} />
            <Text style={dynamicStyles.jobSalary} numberOfLines={1}>{job.salary}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.jobCardFooter}>
        <Text style={dynamicStyles.jobDate}>
          {job.createdAt ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
        </Text>
        <Icon name="arrow-forward" size={16} color={colors.beeYellow} />
      </View>
    </TouchableOpacity>
  );

  const renderChannelCard = ({ item: channel }: any) => (
    <TouchableOpacity style={styles.channelCard} activeOpacity={0.9}>
      <View style={styles.channelAvatarContainer}>
        {channel.imageUrl ? (
          <Image
            source={{ uri: channel.imageUrl }}
            style={styles.channelAvatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.channelAvatarPlaceholder}>
            <Icon name="telegram" size={32} color={colors.white} />
          </View>
        )}
      </View>
      
      <Text style={styles.channelName} numberOfLines={2}>
        {channel.name || channel.username || 'Channel'}
      </Text>
    </TouchableOpacity>
  );

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Modern Minimalist Header */}
      <View style={dynamicStyles.modernHeader}>
        <View style={styles.modernHeaderContent}>
          {/* Mobile Menu Button & Logo */}
          <View style={styles.modernLogoSection}>
            {isMobile && (
              <TouchableOpacity 
                style={styles.modernIconButton} 
                onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Icon 
                  name={isMobileMenuOpen ? "close" : "menu"} 
                  size={20} 
                  color={colors.deepNavy} 
                />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.modernLogoContainer}>
              <View style={styles.modernLogoBadge}>
                <Image source={require('./assets/favicon.png')} style={styles.modernLogo} />
              </View>
              <Text style={dynamicStyles.modernBrandText}>NibJobs</Text>
            </TouchableOpacity>
            
            {!isMobile && (
              <View style={styles.modernNavigation}>
                <TouchableOpacity style={styles.modernNavItem}>
                  <Text style={dynamicStyles.modernNavText}>Jobs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modernNavItem}>
                  <Text style={dynamicStyles.modernNavText}>Companies</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Right Actions */}
          <View style={styles.modernHeaderRight}>
            <View style={styles.modernQuickActions}>
              <TouchableOpacity style={styles.modernIconButton} onPress={toggleTheme}>
                <Icon 
                  name={isDarkMode ? "wb-sunny" : "nightlight-round"} 
                  size={20} 
                  color={colors.deepNavy} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                ref={languageButtonRef}
                style={styles.modernLanguageButton} 
                onPress={toggleLanguageDropdown}
              >
                <Text style={styles.modernLanguageText}>{getCurrentLanguage().code.toUpperCase()}</Text>
                <Icon 
                  name={isLanguageDropdownOpen ? "expand-less" : "expand-more"} 
                  size={16} 
                  color={colors.deepNavy} 
                />
              </TouchableOpacity>
            </View>

            {!isMobile && (
              <View style={styles.modernDownloadButtons}>
                <TouchableOpacity onPress={handleGooglePlayDownload}>
                  <Image source={require('./assets/getit_on_googleplay.svg')} style={styles.modernDownloadButton} />
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity style={styles.modernPrimaryButton} onPress={handleLogin}>
              <Icon name="person" size={18} color={colors.white} />
              <Text style={styles.modernPrimaryButtonText}>{t.login}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && isMobile && (
        <View style={styles.mobileMenuOverlay}>
          <TouchableOpacity 
            style={styles.mobileMenuBackdrop}
            onPress={() => setIsMobileMenuOpen(false)}
          />
          <View style={dynamicStyles.mobileMenu}>
            <View style={styles.mobileMenuHeader}>
              <Text style={dynamicStyles.mobileMenuTitle}>Menu</Text>
              <TouchableOpacity 
                style={styles.modernIconButton}
                onPress={() => setIsMobileMenuOpen(false)}
              >
                <Icon name="close" size={20} color={colors.deepNavy} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mobileMenuContent}>
              <TouchableOpacity style={styles.mobileMenuItem}>
                <Icon name="work" size={20} color={colors.beeYellow} />
                <Text style={dynamicStyles.mobileMenuItemText}>Jobs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mobileMenuItem}>
                <Icon name="business" size={20} color={colors.beeYellow} />
                <Text style={dynamicStyles.mobileMenuItemText}>Companies</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mobileMenuItem}>
                <Icon name="telegram" size={20} color={colors.beeYellow} />
                <Text style={dynamicStyles.mobileMenuItemText}>Channels</Text>
              </TouchableOpacity>
              
              <View style={styles.mobileMenuDivider} />
              
              <View style={styles.mobileMenuDownloads}>
                <Text style={dynamicStyles.mobileMenuSectionTitle}>Download App</Text>
                <TouchableOpacity onPress={handleGooglePlayDownload} style={styles.mobileMenuDownloadItem}>
                  <Image source={require('./assets/getit_on_googleplay.svg')} style={styles.mobileDownloadButton} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Full-screen language dropdown overlay - positioned outside toolbar for maximum z-index */}
      {isLanguageDropdownOpen && (
        <View style={styles.fullScreenDropdownOverlay}>
          {/* Invisible touch area to close dropdown */}
          <TouchableOpacity 
            style={styles.fullScreenTouchArea}
            onPress={() => setIsLanguageDropdownOpen(false)}
            activeOpacity={1}
          />
          
          {/* Language dropdown positioned absolutely */}
          <View style={[styles.absoluteLanguageDropdown, { top: dropdownPosition.top, right: dropdownPosition.right }]}>
            {languageOptions.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.languageOptionActive,
                  index === languageOptions.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => changeLanguage(language.code)}
              >
                <Text style={styles.languageLabel}>{language.label}</Text>
                {currentLanguage === language.code && (
                  <Icon name="check" size={16} color={colors.beeYellow} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        <ScrollView 
          style={dynamicStyles.leftContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Hero Section */}
          <View style={dynamicStyles.heroSection}>
            <View style={styles.heroContent}>
              <View style={styles.heroTextSection}>
                <Text style={dynamicStyles.heroTitle}>Find Your Dream Job</Text>
                <Text style={dynamicStyles.heroSubtitle}>
                  Discover amazing opportunities from top companies in Ethiopia
                </Text>
                
                {/* Modern Search Bar */}
                <View style={dynamicStyles.modernSearchContainer}>
                  <Icon name="search" size={24} color={colors.warmGray} />
                  <TextInput
                    style={dynamicStyles.modernSearchInput}
                    placeholder="Search jobs, companies, or skills..."
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearch}
                  />
                  <TouchableOpacity style={styles.modernSearchButton} onPress={handleSearch}>
                    <Icon name="arrow-forward" size={20} color={colors.white} />
                  </TouchableOpacity>
                </View>
                
                {/* Google Play Download Button */}
                <TouchableOpacity 
                  onPress={handleGooglePlayDownload} 
                  activeOpacity={0.8}
                >
                  <Image 
                    source={require('./assets/getit_on_googleplay.svg')} 
                    style={styles.heroDownloadImage} 
                  />
                </TouchableOpacity>
                
                {/* Quick Stats */}
                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <Text style={dynamicStyles.heroStatNumber}>{jobs.length}+</Text>
                    <Text style={dynamicStyles.heroStatLabel}>Jobs Available</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={dynamicStyles.heroStatNumber}>{telegramChannels.length}+</Text>
                    <Text style={dynamicStyles.heroStatLabel}>Job Channels</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={dynamicStyles.heroStatNumber}>1000+</Text>
                    <Text style={dynamicStyles.heroStatLabel}>Companies</Text>
                  </View>
                </View>
              </View>
              
              {!isMobile && (
                <View style={styles.heroImageSection}>
                  <Image 
                    source={require('./assets/mascot.png')} 
                    style={styles.heroMascotImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          </View>

          {/* Telegram Channels Horizontal Scroll */}
          <View style={dynamicStyles.channelsSection}>
            <View style={styles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>{t.exploreChannels}</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                Join thousands of job seekers on Telegram
              </Text>
            </View>
            <View style={styles.channelsContainer}>
              <ScrollView 
                ref={channelScrollViewRef}
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.channelsScroll}
                contentContainerStyle={styles.channelsScrollContainer}
                scrollEventThrottle={16}
              >
                {/* Duplicate channels for infinite scroll effect */}
                {[...telegramChannels, ...telegramChannels].map((channel, index) => (
                  <View key={`${channel.id || 'ch'}-${index}`} style={styles.channelCardWrapper}>
                    {renderChannelCard({ item: channel })}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* About Us Section */}
          <View style={styles.aboutSection}>
            <View style={styles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>About NibJobs</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                Connecting Ethiopia's Talent with Opportunities
              </Text>
            </View>
            
            <View style={styles.aboutContent}>
              <View style={styles.aboutTextContainer}>
                <Text style={dynamicStyles.aboutText}>
                  NibJobs is Ethiopia's premier job portal, dedicated to bridging the gap between talented professionals and exciting career opportunities across the nation. We understand the unique challenges of the Ethiopian job market and provide innovative solutions to help both job seekers and employers succeed.
                </Text>
                
                <View style={styles.aboutFeatures}>
                  <View style={styles.aboutFeature}>
                    <Icon name="verified" size={24} color={colors.beeYellow} />
                    <View style={styles.aboutFeatureText}>
                      <Text style={dynamicStyles.aboutFeatureTitle}>Verified Opportunities</Text>
                      <Text style={dynamicStyles.aboutFeatureDescription}>
                        All job listings are verified to ensure authenticity and reliability
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.aboutFeature}>
                    <Icon name="business" size={24} color={colors.beeYellow} />
                    <View style={styles.aboutFeatureText}>
                      <Text style={dynamicStyles.aboutFeatureTitle}>Top Companies</Text>
                      <Text style={dynamicStyles.aboutFeatureDescription}>
                        Connect with leading employers across various industries
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.aboutFeature}>
                    <Icon name="notifications-active" size={24} color={colors.beeYellow} />
                    <View style={styles.aboutFeatureText}>
                      <Text style={dynamicStyles.aboutFeatureTitle}>Instant Alerts</Text>
                      <Text style={dynamicStyles.aboutFeatureDescription}>
                        Get notified immediately when relevant jobs are posted
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.aboutFeature}>
                    <Icon name="language" size={24} color={colors.beeYellow} />
                    <View style={styles.aboutFeatureText}>
                      <Text style={dynamicStyles.aboutFeatureTitle}>Multilingual Support</Text>
                      <Text style={dynamicStyles.aboutFeatureDescription}>
                        Available in English, Amharic, Tigrinya, and Oromiffa
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Jobs Section with Filters */}
          <View style={dynamicStyles.jobsSection}>
            <View style={styles.jobsSectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>{t.recentJobs}</Text>
              <Text style={dynamicStyles.jobsCount}>{jobs.length} {t.jobsFound}</Text>
            </View>
            
            <View style={styles.jobsMainContainer}>
              {/* Filter Sidebar */}
              <View style={styles.filterSidebarInline}>
                <Text style={dynamicStyles.filterTitle}>Filter Jobs</Text>
                
                {/* Category Filter */}
                <View style={styles.filterSection}>
                  <Text style={dynamicStyles.filterLabel}>Category</Text>
                  <ScrollView style={styles.filterScrollView} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity 
                      style={[dynamicStyles.filterOption, selectedCategory === '' && styles.filterOptionActive]}
                      onPress={() => setSelectedCategory('')}
                    >
                      <Text style={[dynamicStyles.filterOptionText, selectedCategory === '' && styles.filterOptionTextActive]}>
                        All Categories
                      </Text>
                    </TouchableOpacity>
                    {categories.filter(cat => cat.level === 0).map((category) => (
                      <TouchableOpacity 
                        key={category.id}
                        style={[dynamicStyles.filterOption, selectedCategory === category.id && styles.filterOptionActive]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <Text style={[dynamicStyles.filterOptionText, selectedCategory === category.id && styles.filterOptionTextActive]}>
                          {category.icon} {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Contract Type Filter */}
                <View style={styles.filterSection}>
                  <Text style={dynamicStyles.filterLabel}>Contract Type</Text>
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                    <TouchableOpacity 
                      key={type}
                      style={[dynamicStyles.filterOption, selectedContractType === type && styles.filterOptionActive]}
                      onPress={() => setSelectedContractType(selectedContractType === type ? '' : type)}
                    >
                      <Text style={[dynamicStyles.filterOptionText, selectedContractType === type && styles.filterOptionTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Remote Work Filter */}
                <View style={styles.filterSection}>
                  <Text style={dynamicStyles.filterLabel}>Work Location</Text>
                  <TouchableOpacity 
                    style={[dynamicStyles.filterOption, isRemote && styles.filterOptionActive]}
                    onPress={() => setIsRemote(!isRemote)}
                  >
                    <Text style={[dynamicStyles.filterOptionText, isRemote && styles.filterOptionTextActive]}>
                      🌍 Remote Only
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Popular Locations */}
                <View style={styles.filterSection}>
                  <Text style={dynamicStyles.filterLabel}>Location</Text>
                  {['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa', 'Mekelle', 'Remote'].map((location) => (
                    <TouchableOpacity 
                      key={location}
                      style={[dynamicStyles.filterOption, selectedLocation === location && styles.filterOptionActive]}
                      onPress={() => setSelectedLocation(selectedLocation === location ? '' : location)}
                    >
                      <Text style={[dynamicStyles.filterOptionText, selectedLocation === location && styles.filterOptionTextActive]}>
                        📍 {location}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Clear Filters */}
                <TouchableOpacity style={styles.clearFiltersButton} onPress={() => {
                  setSelectedCategory('');
                  setSelectedContractType('');
                  setSelectedLocation('');
                  setIsRemote(false);
                  setSearchText('');
                }}>
                  <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                </TouchableOpacity>
              </View>

              {/* Jobs Grid */}
              <View style={styles.jobsGridContainer}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading jobs...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={jobs}
                    renderItem={renderJobCard}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.jobsGrid}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.jobsGridRow}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
            <View style={styles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>Choose Your Plan</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                Select the perfect plan for your needs
              </Text>
            </View>
            
            <View style={styles.pricingGrid}>
              {/* Free Tier */}
              <View style={styles.pricingCard}>
                <View style={styles.pricingHeader}>
                  <Icon name="star-outline" size={40} color={colors.warmGray} style={styles.pricingIcon} />
                  <Text style={dynamicStyles.pricingTierName}>Free</Text>
                  <Text style={dynamicStyles.pricingPrice}>0 br</Text>
                  <Text style={dynamicStyles.pricingPeriod}>per month</Text>
                </View>
                
                <View style={styles.pricingFeatures}>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      3 custom job notifications per day on mobile app
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Basic job search and browsing
                    </Text>
                  </View>
                  <View style={[styles.pricingFeature, styles.pricingFeatureDisabled]}>
                    <Icon name="cancel" size={20} color={colors.danger} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Cannot post job ads
                    </Text>
                  </View>
                  <View style={[styles.pricingFeature, styles.pricingFeatureDisabled]}>
                    <Icon name="cancel" size={20} color={colors.danger} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Limited to 3 notifications daily
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={[styles.pricingButton, styles.pricingButtonOutline]}>
                  <Text style={[styles.pricingButtonText, styles.pricingButtonOutlineText]}>
                    Get Started
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Standard Tier */}
              <View style={[styles.pricingCard, styles.pricingCardPopular]}>
                <View style={styles.pricingBadge}>
                  <Text style={styles.pricingBadgeText}>POPULAR</Text>
                </View>
                
                <View style={styles.pricingHeader}>
                  <Icon name="star" size={40} color={colors.beeYellow} style={styles.pricingIcon} />
                  <Text style={dynamicStyles.pricingTierName}>Standard</Text>
                  <Text style={dynamicStyles.pricingPrice}>10 br</Text>
                  <Text style={dynamicStyles.pricingPeriod}>per month</Text>
                </View>
                
                <View style={styles.pricingFeatures}>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Up to 50 custom job notifications per day
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Priority in search results
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Advanced filtering options
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Resume visibility boost
                    </Text>
                  </View>
                  <View style={[styles.pricingFeature, styles.pricingFeatureDisabled]}>
                    <Icon name="cancel" size={20} color={colors.danger} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Cannot post job ads
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.pricingButton}>
                  <Text style={styles.pricingButtonText}>
                    Choose Standard
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Company Tier */}
              <View style={styles.pricingCard}>
                <View style={styles.pricingHeader}>
                  <Icon name="business" size={40} color={colors.deepNavy} style={styles.pricingIcon} />
                  <Text style={dynamicStyles.pricingTierName}>Company</Text>
                  <Text style={dynamicStyles.pricingPrice}>500 br</Text>
                  <Text style={dynamicStyles.pricingPeriod}>per month</Text>
                </View>
                
                <View style={styles.pricingFeatures}>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Post unlimited job ads
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Accept and manage resumes
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Detailed job market statistics
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Applicant tracking system
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Company branding & logo display
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Featured job placements
                    </Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={dynamicStyles.pricingFeatureText}>
                      Priority support & account manager
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.pricingButton}>
                  <Text style={styles.pricingButtonText}>
                    Contact Sales
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={styles.footerContent}>
              {/* Footer Top */}
              <View style={styles.footerTop}>
                {/* Company Info */}
                <View style={styles.footerColumn}>
                  <View style={styles.footerLogoSection}>
                    <Image source={require('./assets/favicon.png')} style={styles.footerLogo} />
                    <Text style={styles.footerBrandName}>NibJobs</Text>
                  </View>
                  <Text style={styles.footerDescription}>
                    Ethiopia's premier job portal connecting talented professionals with exciting career opportunities.
                  </Text>
                  <View style={styles.footerSocial}>
                    <TouchableOpacity style={styles.footerSocialButton}>
                      <Icon name="facebook" size={20} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerSocialButton}>
                      <Icon name="telegram" size={20} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerSocialButton}>
                      <Icon name="language" size={20} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick Links */}
                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>For Job Seekers</Text>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Browse Jobs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Job Alerts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Career Advice</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Resume Tips</Text>
                  </TouchableOpacity>
                </View>

                {/* Employers */}
                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>For Employers</Text>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Post a Job</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Pricing Plans</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Employer Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Recruitment Tips</Text>
                  </TouchableOpacity>
                </View>

                {/* Company */}
                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>Company</Text>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>About Us</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Contact</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Terms of Service</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer Bottom */}
              <View style={styles.footerBottom}>
                <Text style={styles.footerCopyright}>
                  © {new Date().getFullYear()} NibJobs. All rights reserved.
                </Text>
                <View style={styles.footerBottomLinks}>
                  <TouchableOpacity>
                    <Text style={styles.footerBottomLinkText}>Privacy</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerDivider}>•</Text>
                  <TouchableOpacity>
                    <Text style={styles.footerBottomLinkText}>Terms</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerDivider}>•</Text>
                  <TouchableOpacity>
                    <Text style={styles.footerBottomLinkText}>Cookies</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

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
          <Image source={require('./assets/favicon.png')} style={styles.loadingLogoImage} />
          <Text style={styles.loadingText}>NibJobs</Text>
          <Text style={styles.loadingSubtext}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightColors.beeYellow,
  },
  loadingText: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: lightColors.deepNavy,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: lightColors.deepNavy,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: lightColors.white,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginLogo: {
    fontSize: 60,
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: lightColors.deepNavy,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: lightColors.warmGray,
  },
  loginForm: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  modernInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: lightColors.deepNavy,
  },
  modernLoginButton: {
    backgroundColor: lightColors.beeYellow,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: lightColors.beeYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: lightColors.warmGray,
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernLoginButtonText: {
    color: lightColors.deepNavy,
    fontSize: 16,
    fontFamily: fonts.bold,
    marginRight: 8,
  },
  backToHome: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 8,
  },
  backToHomeText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: lightColors.softBlue,
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  adminContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: lightColors.sidebarBg,
    paddingVertical: 24,
    borderRightWidth: 1,
    borderRightColor: lightColors.sidebarBorder,
    shadowColor: lightColors.charcoal,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sidebarHeader: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.sidebarBorder,
    marginBottom: 16,
  },
  sidebarLogo: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: lightColors.sidebarTextActive,
    marginLeft: 12,
  },
  sidebarUser: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: lightColors.sidebarText,
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
    backgroundColor: lightColors.sidebarAccentLight,
    borderLeftWidth: 3,
    borderLeftColor: lightColors.sidebarAccent,
  },
  sidebarIcon: {
    fontSize: 22,
    marginRight: 16,
  },
  sidebarText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: lightColors.sidebarText,
    flex: 1,
  },
  sidebarTextActive: {
    color: lightColors.sidebarTextActive,
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
    backgroundColor: lightColors.white,
    borderWidth: 1,
    borderColor: lightColors.sidebarBorder,
  },
  logoutIcon: {
    fontSize: 22,
    marginRight: 16,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: lightColors.danger,
  },
  adminMainContent: {
    flex: 1,
    backgroundColor: lightColors.lightGray,
  },
  contentContainer: {
    flex: 1,
    padding: 30,
  },
  contentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: lightColors.deepNavy,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: lightColors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderLeftWidth: 4,
    borderLeftColor: lightColors.beeYellow,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: lightColors.deepNavy,
  },
  statLabel: {
    fontSize: 14,
    color: lightColors.warmGray,
    marginTop: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: lightColors.warmGray,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: lightColors.beeYellow,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: lightColors.deepNavy,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    backgroundColor: lightColors.white,
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
    color: lightColors.deepNavy,
    marginBottom: 5,
  },
  listSubtitle: {
    fontSize: 14,
    color: lightColors.warmGray,
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
    backgroundColor: lightColors.softBlue,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: lightColors.danger,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionText: {
    color: lightColors.white,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  comingSoon: {
    fontSize: 18,
    fontFamily: fonts.regular,
    color: lightColors.warmGray,
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
    backgroundColor: lightColors.sidebarAccentLight,
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
    backgroundColor: lightColors.sidebarAccentLight,
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
    backgroundColor: lightColors.white,
  },
  activeIndicator: {
    position: 'absolute',
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: lightColors.sidebarAccent,
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
    backgroundColor: lightColors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  // Job Grid Styles
  jobsGrid: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  jobsGridRow: {
    gap: 16,
    justifyContent: 'space-between',
  },
  jobRow: {
    justifyContent: 'space-between',
    marginHorizontal: -4, // Negative margin to offset card margins
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 0,
    margin: 0,
    marginBottom: 16,
    flex: 1,
    minWidth: 0,
    maxWidth: '32%',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  jobIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff3cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTypeBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobTypeBadgeText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#495057',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobCardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  jobMetaRow: {
    marginTop: 12,
    gap: 8,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobSalaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  jobCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
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
    color: lightColors.deepNavy,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#212529',
    marginBottom: 6,
    lineHeight: 22,
  },
  jobCompany: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#6c757d',
    marginBottom: 0,
  },
  jobCategory: {
    fontSize: 9,
    fontFamily: fonts.regular,
    color: lightColors.softBlue,
    marginBottom: 3,
    textAlign: 'center',
  },
  jobLocation: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#6c757d',
    flex: 1,
  },
  jobSalary: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#198754',
    flex: 1,
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
    color: lightColors.deepNavy,
    textAlign: 'center',
  },
  jobSource: {
    fontSize: 9,
    fontFamily: fonts.regular,
    color: lightColors.warmGray,
    marginBottom: 2,
    textAlign: 'center',
  },
  jobDate: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#6c757d',
  },
  // Category Management Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: lightColors.warmGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: lightColors.warmGray,
    textAlign: 'center',
  },
  subcategoryItem: {
    backgroundColor: lightColors.lightGray,
    borderLeftWidth: 4,
    borderLeftColor: lightColors.beeYellow,
    marginLeft: 20,
  },
  subcategoryTitle: {
    fontSize: 14,
    color: lightColors.charcoal,
  },
  // Home Screen Styles
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: lightColors.white,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.sidebarBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  appTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: lightColors.deepNavy,
  },
  toolbarCenter: {
    flex: 2,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: lightColors.deepNavy,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  toolbarButtonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: lightColors.deepNavy,
    marginLeft: 4,
  },
  // Download app buttons
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: lightColors.beeYellow,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  downloadButtonText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: lightColors.deepNavy,
    marginLeft: 4,
  },
  downloadButtonImage: {
    height: 40,
    width: 135,
    marginHorizontal: 4,
  },
  downloadButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  // Icon-only theme switcher
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: lightColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  // Language dropdown styles
  languageDropdownContainer: {
    position: 'relative',
    marginHorizontal: 8,
    // Removed z-index since we're using full-screen overlay now
  },
  languageDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: lightColors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightColors.warmGray,
  },
  languageCode: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: lightColors.deepNavy,
    marginRight: 4,
  },
  languageDropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    backgroundColor: lightColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightColors.warmGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10, // Higher elevation for Android
    minWidth: 160,
    zIndex: 10000, // Highest z-index to ensure it's on top
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.lightGray,
  },
  languageOptionActive: {
    backgroundColor: lightColors.cream,
  },
  languageLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: lightColors.deepNavy,
    flex: 1,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  // Full-screen dropdown overlay styles
  fullScreenDropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999, // Extremely high z-index to ensure it's on top
  },
  fullScreenTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  absoluteLanguageDropdown: {
    position: 'absolute',
    // top and right will be set dynamically via inline styles
    backgroundColor: lightColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightColors.warmGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20, // Very high elevation for Android
    minWidth: 160,
    zIndex: 9999999, // Maximum z-index
  },
  homeContent: {
    flex: 1,
    backgroundColor: lightColors.cream,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  leftContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  channelsSection: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 60,
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  channelsContainer: {
    width: '100%',
    marginTop: 32,
  },
  channelsScroll: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  channelsScrollContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 40,
    fontFamily: fonts.bold,
    color: '#212529',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  channelsHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: lightColors.warmGray,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  channelCardWrapper: {
    marginRight: 10,
  },
  channelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    width: 110,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  channelCardTop: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  channelAvatarContainer: {
    marginBottom: 8,
  },
  channelAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  channelAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0088cc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  channelVerifiedBadge: {
    position: 'absolute',
    top: 20,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelCardContent: {
    padding: 16,
    paddingTop: 12,
    flex: 1,
  },
  channelName: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#212529',
    textAlign: 'center',
    lineHeight: 16,
  },
  channelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  channelMemberCount: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#6c757d',
  },
  channelCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#fff3cd',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  channelJoinText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#212529',
    letterSpacing: 0.3,
  },
  channelDefaultIcon: {
    backgroundColor: lightColors.beeYellow,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelFaviconImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  channelImageContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  channelImageCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: lightColors.beeYellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  channelImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  channelEmoji: {
    fontSize: 24,
  },
  jobsSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 40,
    paddingHorizontal: 24,
    flex: 1,
  },
  jobsSectionHeader: {
    textAlign: 'center',
    marginBottom: 32,
  },
  jobsMainContainer: {
    flexDirection: 'row',
    gap: 24,
    flex: 1,
    alignItems: 'flex-start',
  },
  filterSidebarInline: {
    width: 260,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobsGridContainer: {
    flex: 1,
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobsCount: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: lightColors.warmGray,
  },
  filterSidebar: {
    width: 300,
    backgroundColor: lightColors.white,
    borderLeftWidth: 1,
    borderLeftColor: lightColors.sidebarBorder,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: lightColors.deepNavy,
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: lightColors.deepNavy,
    marginBottom: 12,
  },
  filterScrollView: {
    maxHeight: 150,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: lightColors.lightGray,
  },
  filterOptionActive: {
    backgroundColor: lightColors.beeYellow,
  },
  filterOptionText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: lightColors.deepNavy,
  },
  filterOptionTextActive: {
    color: lightColors.white,
    fontFamily: fonts.bold,
  },
  clearFiltersButton: {
    backgroundColor: lightColors.danger,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  clearFiltersText: {
    color: lightColors.white,
    fontSize: 14,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  // Brand Image Styles
  appIconImage: {
    width: 28,
    height: 28,
    marginRight: 8,
    resizeMode: 'contain',
  },
  loginLogoImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  loadingLogoImage: {
    width: 60,
    height: 60,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  sidebarLogoImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  
  // Modern Header Styles
  modernHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  modernLogoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modernLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 32,
  },
  modernLogoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: lightColors.beeYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modernLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  modernNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  modernNavItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modernHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modernQuickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modernIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernLanguageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: lightColors.lightGray,
    gap: 4,
  },
  modernLanguageText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.deepNavy,
  },
  modernDownloadButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modernDownloadButton: {
    height: 32,
    resizeMode: 'contain',
  },
  modernPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: lightColors.deepNavy,
    gap: 8,
  },
  modernPrimaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.white,
  },
  
  // Hero Section Styles
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 60,
    gap: 60,
  },
  heroTextSection: {
    flex: 1,
  },
  heroImageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMascotImage: {
    width: 300,
    height: 300,
  },
  heroImagePlaceholder: {
    width: 300,
    height: 200,
    borderRadius: 20,
    backgroundColor: lightColors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: lightColors.beeYellow,
    borderStyle: 'dashed',
  },
  modernSearchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lightColors.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    marginTop: 32,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroDownloadImage: {
    height: 50,
    width: 170,
    marginTop: 32,
    resizeMode: 'cover',
  },
  
  // Mobile Menu Styles
  mobileMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  mobileMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mobileMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: lightColors.white,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.lightGray,
  },
  mobileMenuContent: {
    flex: 1,
    paddingVertical: 16,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: lightColors.lightGray,
    marginVertical: 16,
    marginHorizontal: 20,
  },
  mobileMenuDownloads: {
    paddingHorizontal: 20,
  },
  mobileMenuDownloadItem: {
    marginVertical: 8,
  },
  mobileDownloadButton: {
    height: 40,
    resizeMode: 'contain',
  },
  
  // About Us Section Styles
  aboutSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 80,
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 56,
  },
  aboutContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  aboutTextContainer: {
    width: '100%',
  },
  aboutFeatures: {
    marginTop: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'space-between',
  },
  aboutFeature: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
    minWidth: 280,
    maxWidth: 500,
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: lightColors.beeYellow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutFeatureText: {
    flex: 1,
  },
  pricingSection: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 80,
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  pricingGrid: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    gap: 32,
    marginTop: 56,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pricingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    flex: 1,
    minWidth: 300,
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  pricingCardPopular: {
    borderColor: lightColors.beeYellow,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
    shadowColor: lightColors.beeYellow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  pricingBadge: {
    position: 'absolute',
    top: -16,
    right: 32,
    backgroundColor: lightColors.beeYellow,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: lightColors.beeYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pricingBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#ffffff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  pricingIcon: {
    marginBottom: 20,
  },
  pricingFeatures: {
    gap: 20,
    marginBottom: 32,
  },
  pricingFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pricingFeatureDisabled: {
    opacity: 0.3,
  },
  pricingButton: {
    backgroundColor: lightColors.beeYellow,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: lightColors.beeYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  pricingButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#495057',
    shadowColor: 'transparent',
  },
  pricingButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  pricingButtonOutlineText: {
    color: '#495057',
  },
  // Footer Styles
  footerSection: {
    backgroundColor: '#212529',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  footerContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  footerTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 48,
    marginBottom: 48,
    justifyContent: 'space-between',
  },
  footerColumn: {
    flex: 1,
    minWidth: 200,
  },
  footerLogoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  footerLogo: {
    width: 32,
    height: 32,
  },
  footerBrandName: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: '#ffffff',
  },
  footerDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#adb5bd',
    lineHeight: 22,
    marginBottom: 20,
  },
  footerSocial: {
    flexDirection: 'row',
    gap: 12,
  },
  footerSocialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#343a40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerColumnTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  footerLink: {
    paddingVertical: 8,
  },
  footerLinkText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#adb5bd',
  },
  footerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#343a40',
    flexWrap: 'wrap',
    gap: 16,
  },
  footerCopyright: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#6c757d',
  },
  footerBottomLinks: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  footerBottomLinkText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#6c757d',
  },
  footerDivider: {
    fontSize: 14,
    color: '#6c757d',
  },
});

