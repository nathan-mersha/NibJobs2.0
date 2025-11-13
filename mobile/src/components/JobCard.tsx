import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Job } from '@nibjobs/shared';
import { formatTimeAgo, formatSalary } from '@nibjobs/shared';

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

const { width } = Dimensions.get('window');

const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const formatJobDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatTimeAgo(date);
    } catch {
      return 'Recently posted';
    }
  };

  const getContractTypeBadgeColor = (contractType: string) => {
    switch (contractType) {
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
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899'
    ];
    
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.company} numberOfLines={1}>
            {job.company || job.jobSource}
          </Text>
        </View>
        <Text style={styles.timeAgo}>
          {formatJobDate(job.createdAt)}
        </Text>
      </View>

      <View style={styles.badgesContainer}>
        <View style={[styles.badge, { backgroundColor: getCategoryBadgeColor(job.category) }]}>
          <Text style={styles.badgeText}>{job.category}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getContractTypeBadgeColor(job.contractType) }]}>
          <Text style={styles.badgeText}>{job.contractType}</Text>
        </View>
        {job.isRemote && (
          <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
            <Text style={styles.badgeText}>Remote</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.leftDetails}>
          {job.location && (
            <Text style={styles.detailText}>📍 {job.location}</Text>
          )}
          {job.salary && (
            <Text style={styles.detailText}>
              💰 {formatSalary(job.salary, job.currency)}
            </Text>
          )}
        </View>
      </View>

      {job.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {job.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {job.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{job.tags.length - 3} more</Text>
          )}
        </View>
      )}

      <Text style={styles.description} numberOfLines={3}>
        {job.description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 24,
  },
  company: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftDetails: {
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default JobCard;