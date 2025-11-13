import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

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
  success: '#27AE60',
  danger: '#E74C3C',
  warning: '#F39C12'
};

interface TelegramChannel {
  id: string;
  username: string;
  name: string;
  imageUrl?: string;
  category: string;
  isActive: boolean;
  scrapingEnabled: boolean;
  totalJobsScraped: number;
  lastScraped: any | null;
  createdAt: any;
  updatedAt: any;
}

interface TelegramChannelsListProps {
  channels: TelegramChannel[];
  onChannelsUpdate: () => void;
  loading: boolean;
}

export default function TelegramChannelsList({ 
  channels, 
  onChannelsUpdate, 
  loading 
}: TelegramChannelsListProps) {
  const [updatingChannels, setUpdatingChannels] = useState<Set<string>>(new Set());

  const updateChannel = async (channelId: string, updates: Partial<TelegramChannel>) => {
    setUpdatingChannels(prev => new Set(prev).add(channelId));
    
    try {
      const channelRef = doc(db, 'telegramChannels', channelId);
      await updateDoc(channelRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      onChannelsUpdate();
    } catch (error) {
      console.error('Error updating channel:', error);
      Alert.alert('Error', 'Failed to update channel');
    } finally {
      setUpdatingChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    }
  };

  const deleteChannel = async (channel: TelegramChannel) => {
    Alert.alert(
      'Delete Channel',
      `Are you sure you want to delete @${channel.username}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setUpdatingChannels(prev => new Set(prev).add(channel.id));
            
            try {
              // Delete channel image if it exists
              if (channel.imageUrl) {
                try {
                  const imageRef = ref(storage, channel.imageUrl);
                  await deleteObject(imageRef);
                } catch (imageError) {
                  console.warn('Failed to delete channel image:', imageError);
                }
              }

              // Delete channel document
              const channelRef = doc(db, 'telegramChannels', channel.id);
              await deleteDoc(channelRef);
              
              onChannelsUpdate();
              Alert.alert('Success', 'Channel deleted successfully');
            } catch (error) {
              console.error('Error deleting channel:', error);
              Alert.alert('Error', 'Failed to delete channel');
            } finally {
              setUpdatingChannels(prev => {
                const newSet = new Set(prev);
                newSet.delete(channel.id);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    try {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    } catch {
      return 'Never';
    }
  };

  // Helper function to pad array to make complete rows of 4
  const padArrayForGrid = (array: TelegramChannel[]) => {
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

  const renderChannelCard = ({ item: channel }: { item: TelegramChannel | null }) => {
    // If it's a placeholder (null), return an empty view
    if (!channel) {
      return <View style={[styles.channelCard, styles.placeholderCard]} />;
    }

    const isUpdating = updatingChannels.has(channel.id);
    
    return (
      <View style={styles.channelCard}>
        {/* Delete Button - Positioned absolutely */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteChannel(channel)}
          disabled={isUpdating}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>

        {/* Channel Header */}
        <View style={styles.channelHeader}>
          <View style={styles.channelBasicInfo}>
            {/* Channel Image */}
            <View style={styles.channelImageContainer}>
              {channel.imageUrl ? (
                <Image 
                  source={{ uri: channel.imageUrl }} 
                  style={styles.channelImage}
                />
              ) : (
                <View style={styles.defaultImageContainer}>
                  <Text style={styles.defaultImageText}>📱</Text>
                </View>
              )}
            </View>
            
            {/* Channel Details */}
            <View style={styles.channelInfo}>
              <Text style={styles.channelUsername}>@{channel.username}</Text>
              <Text style={styles.channelName}>{channel.name}</Text>
              <Text style={styles.channelCategory}>{channel.category}</Text>
            </View>
          </View>
        </View>

        {/* Channel Stats */}
        <View style={styles.channelStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{channel.totalJobsScraped}</Text>
            <Text style={styles.statLabel}>Jobs Scraped</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDate(channel.lastScraped)}</Text>
            <Text style={styles.statLabel}>Last Scraped</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDate(channel.createdAt)}</Text>
            <Text style={styles.statLabel}>Added</Text>
          </View>
        </View>

        {/* Channel Controls */}
        <View style={styles.channelControls}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Active</Text>
            {isUpdating ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <Switch
                value={channel.isActive}
                onValueChange={(value) => updateChannel(channel.id, { isActive: value })}
                trackColor={{ false: colors.lightGray, true: colors.success }}
                thumbColor={channel.isActive ? colors.white : colors.warmGray}
              />
            )}
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Scraping</Text>
            {isUpdating ? (
              <ActivityIndicator size="small" color={colors.beeYellow} />
            ) : (
              <Switch
                value={channel.scrapingEnabled}
                onValueChange={(value) => updateChannel(channel.id, { scrapingEnabled: value })}
                trackColor={{ false: colors.lightGray, true: colors.beeYellow }}
                thumbColor={channel.scrapingEnabled ? colors.white : colors.warmGray}
              />
            )}
          </View>
        </View>

        {/* Status Badges */}
        <View style={styles.statusBadges}>
          <View style={[
            styles.statusBadge, 
            channel.isActive ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusBadgeText,
              channel.isActive ? styles.activeBadgeText : styles.inactiveBadgeText
            ]}>
              {channel.isActive ? '✅ Active' : '❌ Inactive'}
            </Text>
          </View>
          
          <View style={[
            styles.statusBadge, 
            channel.scrapingEnabled ? styles.scrapingBadge : styles.noScrapingBadge
          ]}>
            <Text style={[
              styles.statusBadgeText,
              channel.scrapingEnabled ? styles.scrapingBadgeText : styles.noScrapingBadgeText
            ]}>
              {channel.scrapingEnabled ? '🔄 Scraping' : '⏸️ Paused'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.beeYellow} />
        <Text style={styles.loadingText}>Loading channels...</Text>
      </View>
    );
  }

  if (channels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📱</Text>
        <Text style={styles.emptyTitle}>No Channels Yet</Text>
        <Text style={styles.emptyDescription}>
          Add your first Telegram channel to start scraping job posts
        </Text>
      </View>
    );
  }

  const activeChannels = channels.filter(c => c.isActive && c.scrapingEnabled);
  const inactiveChannels = channels.filter(c => !c.isActive || !c.scrapingEnabled);

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={styles.summaryStats}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{channels.length}</Text>
          <Text style={styles.summaryLabel}>Total Channels</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{activeChannels.length}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {channels.reduce((total, ch) => total + ch.totalJobsScraped, 0)}
          </Text>
          <Text style={styles.summaryLabel}>Total Jobs</Text>
        </View>
      </View>

      {/* Active Channels */}
      {activeChannels.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟢 Active Channels ({activeChannels.length})</Text>
          <FlatList
            data={padArrayForGrid(activeChannels)}
            renderItem={renderChannelCard}
            keyExtractor={(item, index) => item?.id || `placeholder-${index}`}
            numColumns={4}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Inactive Channels */}
      {inactiveChannels.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔴 Inactive Channels ({inactiveChannels.length})</Text>
          <FlatList
            data={padArrayForGrid(inactiveChannels)}
            renderItem={renderChannelCard}
            keyExtractor={(item, index) => item?.id || `placeholder-${index}`}
            numColumns={4}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.warmGray,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    backgroundColor: colors.cream,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.warmGray,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.deepNavy,
    marginBottom: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginHorizontal: -6, // Negative margin to offset card margins
  },
  channelCard: {
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
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  channelBasicInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  channelImageContainer: {
    marginBottom: 8,
    alignSelf: 'center',
  },
  channelImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultImageText: {
    fontSize: 16,
  },
  channelInfo: {
    flex: 1,
    alignItems: 'center',
  },
  channelUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.deepNavy,
    textAlign: 'center',
    marginBottom: 2,
  },
  channelName: {
    fontSize: 10,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 2,
  },
  channelCategory: {
    fontSize: 9,
    color: colors.warmGray,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.danger,
    opacity: 0.8,
  },
  deleteButtonText: {
    fontSize: 12,
    color: colors.white,
  },
  channelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.deepNavy,
  },
  statLabel: {
    fontSize: 8,
    color: colors.warmGray,
    marginTop: 1,
    textAlign: 'center',
  },
  channelControls: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 10,
    color: colors.charcoal,
    fontWeight: '500',
  },
  statusBadges: {
    flexDirection: 'column',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  activeBadgeText: {
    color: colors.success,
  },
  inactiveBadge: {
    backgroundColor: '#FFF2F2',
  },
  inactiveBadgeText: {
    color: colors.danger,
  },
  scrapingBadge: {
    backgroundColor: colors.cream,
  },
  scrapingBadgeText: {
    color: colors.darkYellow,
  },
  noScrapingBadge: {
    backgroundColor: colors.lightGray,
  },
  noScrapingBadgeText: {
    color: colors.warmGray,
  },
});