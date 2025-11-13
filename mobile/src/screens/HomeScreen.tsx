import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';

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
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);

  // Filter jobs based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      console.log('Jobs refreshed!');
    }, 2000);
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

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard} activeOpacity={0.7}>
      {item.urgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>🔥 Urgent</Text>
        </View>
      )}
      
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleRow}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.companyName}>{item.company}</Text>
          </View>
        </View>
        
        <View style={styles.jobMeta}>
          <View style={[styles.jobType, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.jobTypeText}>{item.type}</Text>
          </View>
        </View>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.location}>{item.location}</Text>
          {item.remote && (
            <View style={styles.remoteBadge}>
              <Text style={styles.remoteText}>🌐 Remote</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.salary}>💰 {item.salary}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.jobFooter}>
          <View style={styles.statsRow}>
            <Text style={styles.stat}>👁 {item.views} views</Text>
            <Text style={styles.stat}>📋 {item.applications} applied</Text>
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(item.postedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs, companies, locations..."
              placeholderTextColor={colors.warmGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginText}>👤 Login</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredJobs.length}</Text>
            <Text style={styles.statLabel}>Jobs Found</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredJobs.filter(j => j.remote).length}</Text>
            <Text style={styles.statLabel}>Remote</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredJobs.filter(j => j.urgent).length}</Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </View>
        </View>
      </View>

      {/* Job list */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.jobsList}
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
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.cream,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.beeYellow,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.honeyGold,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.charcoal,
  },
  clearButton: {
    padding: 5,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.warmGray,
  },
  loginButton: {
    backgroundColor: colors.deepNavy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.beeYellow,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  statLabel: {
    fontSize: 12,
    color: colors.warmGray,
    marginTop: 2,
  },
  jobsList: {
    padding: 20,
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: colors.white,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  urgentBadge: {
    position: 'absolute',
    top: -5,
    right: 20,
    backgroundColor: colors.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 1,
  },
  urgentText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: colors.warmGray,
    fontWeight: '500',
  },
  jobMeta: {
    alignItems: 'flex-end',
  },
  jobType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  jobTypeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  jobDetails: {
    gap: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  location: {
    fontSize: 14,
    color: colors.warmGray,
    marginRight: 10,
  },
  remoteBadge: {
    backgroundColor: colors.softBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  remoteText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  salary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  description: {
    fontSize: 14,
    color: colors.charcoal,
    lineHeight: 20,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  stat: {
    fontSize: 12,
    color: colors.warmGray,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.beeYellow,
    fontWeight: 'bold',
  },
});

export default HomeScreen;