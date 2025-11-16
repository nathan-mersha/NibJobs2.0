import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Brand colors inspired by bee logo
const colors = {
  beeYellow: '#F4C430',      // Dark golden yellow
  honeyGold: '#D4AF37',      // Rich gold
  darkYellow: '#B8860B',     // Dark goldenrod
  deepNavy: '#1A1B3E',       // Deep navy blue
  charcoal: '#2C2C2C',       // Dark charcoal
  cream: '#FFF9E6',          // Warm cream
  white: '#FFFFFF',          // Pure white
  warmGray: '#6B6B6B',       // Warm gray
  lightGray: '#F5F5F5',      // Light gray
  softBlue: '#4A90E2',       // Complementary blue
  success: '#27AE60',        // Success green
  orange: '#FF8C00',         // Orange accent
};

// Job interface
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  description: string;
  requirements: string[];
  remote: boolean;
  urgent: boolean;
  views: number;
  applications: number;
  postedAt: Date;
}

// Mock job data with bee-themed companies
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior React Native Developer',
    company: 'HiveCode Technologies',
    location: 'San Francisco, CA',
    type: 'full-time',
    category: 'technology',
    salary: '$120,000 - $150,000',
    description: 'Join our buzzing tech team and build amazing mobile applications that connect thousands of users.',
    requirements: ['5+ years React Native experience', 'TypeScript proficiency', 'Mobile app deployment experience'],
    remote: true,
    urgent: false,
    views: 24,
    applications: 8,
    postedAt: new Date(),
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    company: 'Honey Design Studio',
    location: 'New York, NY',
    type: 'full-time',
    category: 'design',
    salary: '$85,000 - $110,000',
    description: 'Create sweet user experiences that make our products irresistible to users.',
    requirements: ['3+ years UX/UI experience', 'Figma expertise', 'Portfolio required', 'Design systems experience'],
    remote: true,
    urgent: true,
    views: 18,
    applications: 12,
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Digital Marketing Specialist',
    company: 'BuzzWorthy Marketing',
    location: 'Remote',
    type: 'full-time',
    category: 'marketing',
    salary: '$65,000 - $85,000',
    description: 'Help us create marketing campaigns that generate the right buzz in the market.',
    requirements: ['SEO/SEM experience', 'Social media marketing', 'Analytics tools proficiency', 'Content strategy'],
    remote: true,
    urgent: false,
    views: 32,
    applications: 15,
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Financial Analyst',
    company: 'Golden Investments',
    location: 'Chicago, IL',
    type: 'full-time',
    category: 'finance',
    salary: '$75,000 - $95,000',
    description: 'Analyze market trends and help our clients make golden investment decisions.',
    requirements: ['Finance degree', 'Excel proficiency', '2+ years experience', 'CFA preferred'],
    remote: false,
    urgent: false,
    views: 15,
    applications: 6,
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    title: 'Product Manager',
    company: 'SwarmTech Solutions',
    location: 'Austin, TX',
    type: 'full-time',
    category: 'management',
    salary: '$100,000 - $130,000',
    description: 'Lead product development and coordinate with our swarm of talented developers.',
    requirements: ['5+ years PM experience', 'Agile methodology', 'Technical background', 'Leadership skills'],
    remote: true,
    urgent: true,
    views: 28,
    applications: 9,
    postedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
  },
];

const HomeScreen: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const navigation = useNavigation();

  // Fetch jobs from Firestore with limit of 9
  const fetchJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'), limit(9));
      const querySnapshot = await getDocs(q);
      
      const fetchedJobs: Job[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedJobs.push({
          id: doc.id,
          title: data.title || '',
          company: data.company || '',
          location: data.location || '',
          type: data.type || 'full-time',
          category: data.category || '',
          salary: data.salary || '',
          description: data.description || '',
          requirements: data.requirements || [],
          remote: data.remote || false,
          urgent: data.urgent || false,
          views: data.views || 0,
          applications: data.applications || 0,
          postedAt: data.postedAt?.toDate() || new Date(),
        });
      });
      
      console.log('Fetched jobs count:', fetchedJobs.length);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to mock data if error
      const limitedMockJobs = mockJobs.slice(0, 9);
      console.log('Using mock data, count:', limitedMockJobs.length);
      setJobs(limitedMockJobs);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      technology: '💻',
      design: '🎨',
      marketing: '📈',
      finance: '💰',
      management: '👨‍💼',
      healthcare: '🏥',
      education: '🎓',
      default: '💼'
    };
    return icons[category] || icons.default;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return colors.success;
      case 'part-time': return colors.softBlue;
      case 'contract': return colors.orange;
      default: return colors.warmGray;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleViewMoreJobs = () => {
    if (user) {
      // Navigate to dashboard if user is logged in
      navigation.navigate('MainTabs' as never);
    } else {
      // Show alert and navigate to auth
      Alert.alert(
        'Sign Up or Login',
        'Create an account or login to access more features:\n\n✨ Customize your job search\n📄 Upload your CV\n🔔 Get personalized job alerts\n💼 Track your applications\n🎯 Save favorite jobs',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Sign Up / Login',
            onPress: () => navigation.navigate('Auth' as never)
          }
        ]
      );
    }
  };

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.companyRow}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          <View style={styles.companyInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.companyName}>{item.company}</Text>
          </View>
        </View>
        {item.urgent && (
          <View style={styles.urgentTag}>
            <Text style={styles.urgentTagText}>🔥</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>📍 {item.location}</Text>
          {item.remote && <Text style={styles.remoteTag}>🌐 Remote</Text>}
        </View>
        <Text style={styles.salaryText}>💰 {item.salary}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.badgeText}>{item.type}</Text>
          </View>
          <Text style={styles.timeText}>{formatTimeAgo(item.postedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.brandText}>🐝 NibJobs</Text>
          </View>
          {!user && (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Auth' as never)}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>Recent Job Opportunities</Text>
      </View>

      {/* Job list */}
      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.jobsList}
        ListFooterComponent={
          <TouchableOpacity style={styles.viewMoreButton} onPress={handleViewMoreJobs}>
            <Text style={styles.viewMoreText}>View More Jobs</Text>
            <Text style={styles.viewMoreIcon}>→</Text>
          </TouchableOpacity>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.beeYellow]}
            tintColor={colors.beeYellow}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.warmGray,
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  subtitle: {
    fontSize: 16,
    color: colors.warmGray,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: colors.beeYellow,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loginText: {
    color: colors.deepNavy,
    fontSize: 15,
    fontWeight: 'bold',
  },
  jobsList: {
    padding: 16,
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.deepNavy,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: colors.warmGray,
    fontWeight: '500',
  },
  urgentTag: {
    backgroundColor: colors.orange,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentTagText: {
    fontSize: 16,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.charcoal,
  },
  remoteTag: {
    fontSize: 12,
    color: colors.softBlue,
    fontWeight: '600',
  },
  salaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 12,
    color: colors.warmGray,
    fontWeight: '600',
  },
  viewMoreButton: {
    backgroundColor: colors.beeYellow,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  viewMoreIcon: {
    fontSize: 20,
    color: colors.deepNavy,
    fontWeight: 'bold',
  },
});

export default HomeScreen;