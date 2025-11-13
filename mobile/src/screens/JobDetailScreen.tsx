import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { isWeb, webFirebaseStub } from '../utils/platform';

// Conditional Firebase import
let firestore: any = null;
if (!isWeb) {
  firestore = require('@react-native-firebase/firestore').default;
} else {
  firestore = webFirebaseStub.firestore;
}
import { Job, formatTimeAgo, formatSalary } from '@nibjobs/shared';
import { RootStackParamList } from '../types/navigation';

// Components
import LoadingSpinner from '../components/LoadingSpinner';

type JobDetailRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;

const JobDetailScreen: React.FC = () => {
  const route = useRoute<JobDetailRouteProp>();
  const navigation = useNavigation();
  const { jobId } = route.params;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawPost, setShowRawPost] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobDoc = await firestore().collection('jobs').doc(jobId).get();
      
      if (jobDoc.exists) {
        setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);
      } else {
        Alert.alert('Error', 'Job not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to load job:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!job) return;

    try {
      if (job.applyLink) {
        // Open external apply link
        const canOpen = await Linking.canOpenURL(job.applyLink);
        if (canOpen) {
          await Linking.openURL(job.applyLink);
        } else {
          Alert.alert('Error', 'Unable to open application link');
        }
      } else if (job.telegramMessageUrl) {
        // Open Telegram message
        const canOpen = await Linking.canOpenURL(job.telegramMessageUrl);
        if (canOpen) {
          await Linking.openURL(job.telegramMessageUrl);
        } else {
          Alert.alert('Error', 'Unable to open Telegram link');
        }
      } else {
        Alert.alert('No Apply Link', 'No application link available for this job');
      }
    } catch (error) {
      console.error('Failed to open link:', error);
      Alert.alert('Error', 'Failed to open application link');
    }
  };

  const handleShare = async () => {
    if (!job) return;

    try {
      const shareContent = {
        title: `Job: ${job.title}`,
        message: `Check out this job: ${job.title} at ${job.company || job.jobSource}\n\n${job.description.substring(0, 200)}...`,
        url: job.telegramMessageUrl || '',
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const formatJobDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatTimeAgo(date);
    } catch {
      return 'Recently posted';
    }
  };

  const getBadgeColor = (type: 'category' | 'contract', value: string) => {
    if (type === 'contract') {
      switch (value) {
        case 'Full-time':
          return '#22c55e';
        case 'Part-time':
          return '#3b82f6';
        case 'Contract':
          return '#f59e0b';
        case 'Freelance':
          return '#8b5cf6';
        case 'Internship':
          return '#ec4899';
        default:
          return '#6b7280';
      }
    }
    
    // Category color (same logic as JobCard)
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899'
    ];
    
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Job not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.company || job.jobSource}</Text>
          <Text style={styles.timeAgo}>Posted {formatJobDate(job.createdAt)}</Text>
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: getBadgeColor('category', job.category) }]}>
            <Text style={styles.badgeText}>{job.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getBadgeColor('contract', job.contractType) }]}>
            <Text style={styles.badgeText}>{job.contractType}</Text>
          </View>
          {job.isRemote && (
            <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
              <Text style={styles.badgeText}>Remote</Text>
            </View>
          )}
          {job.experienceLevel && (
            <View style={[styles.badge, { backgroundColor: '#6b7280' }]}>
              <Text style={styles.badgeText}>{job.experienceLevel} Level</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          {job.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Location:</Text>
              <Text style={styles.detailValue}>{job.location}</Text>
            </View>
          )}
          {job.salary && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💰 Salary:</Text>
              <Text style={styles.detailValue}>{formatSalary(job.salary, job.currency)}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🏢 Source:</Text>
            <Text style={styles.detailValue}>{job.jobSource}</Text>
          </View>
        </View>

        {/* Skills/Tags */}
        {job.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.tagsContainer}>
              {job.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Raw Post */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.rawPostToggle}
            onPress={() => setShowRawPost(!showRawPost)}
          >
            <Text style={styles.rawPostToggleText}>
              {showRawPost ? 'Hide' : 'Show'} Original Post
            </Text>
          </TouchableOpacity>
          
          {showRawPost && (
            <View style={styles.rawPostContainer}>
              <Text style={styles.rawPostText}>{job.rawPost}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>
            {job.applyLink ? 'Apply Now' : 'View on Telegram'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 32,
  },
  company: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 14,
    color: '#9ca3af',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 8,
    backgroundColor: '#ffffff',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#4b5563',
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  rawPostToggle: {
    paddingVertical: 8,
  },
  rawPostToggleText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  rawPostContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rawPostText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
});

export default JobDetailScreen;