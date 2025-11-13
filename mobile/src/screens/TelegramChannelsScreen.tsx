import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { collection, getDocs, query, orderBy, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import TelegramChannelFormModal from '../components/TelegramChannelFormModal';
import TelegramChannelsList from '../components/TelegramChannelsList';
import { NibJobsIcon } from '../assets';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

export default function TelegramChannelsScreen() {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'scraping' | 'completed' | 'error'>('idle');
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [scrapingMessage, setScrapingMessage] = useState('');

  const manualScrapeChannels = httpsCallable(functions, 'runTelegramScrapingNow');

  const loadChannels = async () => {
    try {
      const channelsQuery = query(
        collection(db, 'telegramChannels'),
        orderBy('createdAt', 'desc')
      );
      
      const channelsSnapshot = await getDocs(channelsQuery);
      const channelsList: TelegramChannel[] = channelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TelegramChannel));
      
      setChannels(channelsList);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChannels();
  };

  const handleManualScrape = async () => {
    setScrapingStatus('scraping');
    setScrapingProgress(0);
    setScrapingMessage('Starting manual scraping...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setScrapingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      setScrapingMessage('Scraping all active channels for new jobs...');
      
      const result = await manualScrapeChannels();
      console.log('📊 Scraping result:', result);
      
      clearInterval(progressInterval);
      setScrapingProgress(100);
      
      const data = result.data as any;
      if (data?.success) {
        setScrapingMessage(`✅ Scraped ${data.channelsProcessed} channels, found ${data.totalJobsExtracted} jobs!`);
        
        // Show detailed results
        Alert.alert(
          'Scraping Complete! 🎉',
          `Processed: ${data.channelsProcessed} channels\nJobs found: ${data.totalJobsExtracted}\nMessages processed: ${data.totalMessagesProcessed}${data.channelDetails ? `\n\nChannels processed:\n${data.channelDetails.join('\n')}` : ''}${data.errors?.length ? `\n\n❌ Errors: ${data.errors.length}` : ''}`,
          [{ text: 'OK' }]
        );
      } else {
        setScrapingMessage('❌ Scraping failed - check console for details');
        Alert.alert(
          'Scraping Failed',
          'The scraping process failed. Please check the Firebase console logs for details.',
          [{ text: 'OK' }]
        );
      }
      setScrapingStatus('completed');
      
      
      // Refresh channels to show updated stats
      loadChannels();
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setScrapingStatus('idle');
        setScrapingProgress(0);
        setScrapingMessage('');
      }, 5000);

      // Refresh channels data
      await loadChannels();

      Alert.alert(
        'Scraping Completed',
        'Manual scraping completed successfully!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Manual scraping failed:', error);
      setScrapingStatus('error');
      setScrapingMessage('Scraping failed. Please try again.');
      
      setTimeout(() => {
        setScrapingStatus('idle');
        setScrapingProgress(0);
        setScrapingMessage('');
      }, 3000);

      Alert.alert(
        'Scraping Failed',
        'Failed to perform manual scraping. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleChannelAdded = () => {
    loadChannels();
  };

  const handleChannelsUpdate = () => {
    loadChannels();
  };

  const enableAllChannelsForScraping = async () => {
    try {
      const batch = writeBatch(db);
      let updatedCount = 0;

      for (const channel of channels) {
        if (!channel.isActive || !channel.scrapingEnabled) {
          const channelRef = doc(db, 'telegramChannels', channel.id);
          batch.update(channelRef, {
            isActive: true,
            scrapingEnabled: true,
            updatedAt: serverTimestamp()
          });
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        await batch.commit();
        Alert.alert(
          'Channels Updated! ✅',
          `${updatedCount} channels have been enabled for scraping.`,
          [{ text: 'OK' }]
        );
        loadChannels();
      } else {
        Alert.alert(
          'All Set! 👍',
          'All channels are already enabled for scraping.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error enabling channels:', error);
      Alert.alert(
        'Error',
        'Failed to update channel settings. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={NibJobsIcon} style={styles.headerIcon} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Telegram Channels</Text>
            <Text style={styles.headerSubtitle}>
              Manage job scraping sources
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Channel</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.beeYellow]}
            tintColor={colors.beeYellow}
          />
        }
      >
        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>📊 Overview</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{channels.length}</Text>
              <Text style={styles.overviewLabel}>Total Channels</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>
                {channels.filter(c => c.isActive && c.scrapingEnabled).length}
              </Text>
              <Text style={styles.overviewLabel}>Active Channels</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>
                {channels.reduce((total, ch) => total + ch.totalJobsScraped, 0)}
              </Text>
              <Text style={styles.overviewLabel}>Total Jobs</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setShowAddModal(true)}
            >
              <Icon name="add" size={24} color={colors.beeYellow} />
              <Text style={styles.quickActionText}>Add Channel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleRefresh}
            >
              <Icon name="refresh" size={24} color={colors.beeYellow} />
              <Text style={styles.quickActionText}>Refresh List</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.quickActionButton,
                scrapingStatus === 'scraping' && styles.quickActionButtonDisabled
              ]}
              onPress={scrapingStatus === 'idle' ? handleManualScrape : undefined}
              disabled={scrapingStatus === 'scraping'}
            >
              {scrapingStatus === 'scraping' ? (
                <ActivityIndicator size="small" color={colors.beeYellow} />
              ) : (
                <Icon name="rocket-launch" size={24} color={colors.beeYellow} />
              )}
              <Text style={styles.quickActionText}>
                {scrapingStatus === 'scraping' ? 'Scraping...' : 'Manual Scrape'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={enableAllChannelsForScraping}
            >
              <Icon name="check-circle" size={24} color={colors.success} />
              <Text style={styles.quickActionText}>Enable All Scraping</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scraping Progress Status */}
        {scrapingStatus !== 'idle' && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Scraping Status</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${scrapingProgress}%` }]} />
            </View>
            <Text style={styles.progressMessage}>{scrapingMessage}</Text>
            {scrapingProgress > 0 && (
              <Text style={styles.progressPercent}>{scrapingProgress}%</Text>
            )}
          </View>
        )}

        {/* Channels List */}
        <View style={styles.channelsSection}>
          <TelegramChannelsList
            channels={channels}
            onChannelsUpdate={handleChannelsUpdate}
            loading={loading}
          />
        </View>
      </ScrollView>

      {/* Add Channel Modal */}
      <TelegramChannelFormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onChannelAdded={handleChannelAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.warmGray,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.beeYellow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.deepNavy,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.deepNavy,
    marginBottom: 12,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  overviewLabel: {
    fontSize: 12,
    color: colors.warmGray,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  quickActionButtonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.lightGray,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.charcoal,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.beeYellow,
    borderRadius: 3,
  },
  progressMessage: {
    fontSize: 12,
    color: colors.warmGray,
    marginBottom: 4,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
    textAlign: 'right',
  },
  channelsSection: {
    marginBottom: 24,
  },
});