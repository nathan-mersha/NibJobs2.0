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

const defaultColors = {
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
  colors?: any;
}

export default function TelegramChannelsList({ 
  channels, 
  onChannelsUpdate, 
  loading,
  colors = defaultColors
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
      <View style={[styles.channelCard, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
        {/* Delete Button - Positioned absolutely */}
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={() => deleteChannel(channel)}
          disabled={isUpdating}
        >
          <Text style={[styles.deleteButtonText, { color: colors.white }]}>🗑️</Text>
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
              <Text style={[styles.channelUsername, { color: colors.deepNavy }]}>@{channel.username}</Text>
              <Text style={[styles.channelName, { color: colors.charcoal }]}>{channel.name}</Text>
              <Text style={[styles.channelCategory, { color: colors.warmGray }]}>{channel.category}</Text>
            </View>
          </View>
        </View>

        {/* Channel Stats */}
        <View style={[styles.channelStats, { borderTopColor: colors.lightGray, borderBottomColor: colors.lightGray }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.deepNavy }]}>{channel.totalJobsScraped}</Text>
            <Text style={[styles.statLabel, { color: colors.charcoal }]}>Jobs Scraped</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.deepNavy }]}>{formatDate(channel.lastScraped)}</Text>
            <Text style={[styles.statLabel, { color: colors.charcoal }]}>Last Scraped</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.deepNavy }]}>{formatDate(channel.createdAt)}</Text>
            <Text style={[styles.statLabel, { color: colors.charcoal }]}>Added</Text>
          </View>
        </View>

        {/* Channel Controls */}
        <View style={styles.channelControls}>
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: colors.deepNavy }]}>Active</Text>
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
            <Text style={[styles.switchLabel, { color: colors.deepNavy }]}>Scraping</Text>
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
            channel.isActive ? { ...styles.activeBadge, backgroundColor: colors.cream, borderColor: colors.beeYellow } : { ...styles.inactiveBadge, backgroundColor: colors.lightGray }
          ]}>
            <Text style={[
              styles.statusBadgeText,
              channel.isActive ? { ...styles.activeBadgeText, color: colors.success } : { ...styles.inactiveBadgeText, color: colors.danger }
            ]}>
              {channel.isActive ? '✅ Active' : '❌ Inactive'}
            </Text>
          </View>
          
          <View style={[
            styles.statusBadge, 
            channel.scrapingEnabled ? { ...styles.scrapingBadge, backgroundColor: colors.cream, borderColor: colors.beeYellow } : { ...styles.noScrapingBadge, backgroundColor: colors.lightGray }
          ]}>
            <Text style={[
              styles.statusBadgeText,
              channel.scrapingEnabled ? { ...styles.scrapingBadgeText, color: colors.deepNavy } : { ...styles.noScrapingBadgeText, color: colors.warmGray }
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.white }]}>
        <ActivityIndicator size="large" color={colors.beeYellow} />
        <Text style={[styles.loadingText, { color: colors.warmGray }]}>Loading channels...</Text>
      </View>
    );
  }

  if (channels.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.white }]}>
        <Text style={styles.emptyIcon}>📱</Text>
        <Text style={[styles.emptyTitle, { color: colors.deepNavy }]}>No Channels Yet</Text>
        <Text style={[styles.emptyDescription, { color: colors.warmGray }]}>
          Add your first Telegram channel to start scraping job posts
        </Text>
      </View>
    );
  }

  const activeChannels = channels.filter(c => c.isActive && c.scrapingEnabled);
  const inactiveChannels = channels.filter(c => !c.isActive || !c.scrapingEnabled);

  return (
    <View style={styles.container}>
      {/* Active Channels */}
      {activeChannels.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.deepNavy }]}>Active Channels ({activeChannels.length})</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.deepNavy }]}>Inactive Channels ({inactiveChannels.length})</Text>
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
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginHorizontal: -6, // Negative margin to offset card margins
  },
  channelCard: {
    borderRadius: 16,
    padding: 20,
    margin: 8,
    flex: 1,
    maxWidth: '23%', // Slightly less than 25% to account for margins
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  defaultImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  defaultImageText: {
    fontSize: 24,
  },
  channelInfo: {
    flex: 1,
    alignItems: 'center',
  },
  channelUsername: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  channelCategory: {
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    borderRadius: 6,
    opacity: 0.8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  channelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
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
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadges: {
    flexDirection: 'column',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  activeBadgeText: {
  },
  inactiveBadge: {
    backgroundColor: '#FFF2F2',
  },
  inactiveBadgeText: {
  },
  scrapingBadge: {
  },
  scrapingBadgeText: {
  },
  noScrapingBadge: {
  },
  noScrapingBadgeText: {
  },
});