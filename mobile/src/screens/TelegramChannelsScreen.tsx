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
import { collection, getDocs, query, orderBy, writeBatch, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import TelegramChannelFormModal from '../components/TelegramChannelFormModal';
import TelegramChannelsList from '../components/TelegramChannelsList';
import { NibJobsIcon } from '../assets';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

export default function TelegramChannelsScreen({ colors = defaultColors }: { colors?: any }) {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'scraping' | 'completed' | 'error'>('idle');
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [scrapingMessage, setScrapingMessage] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [scrapingDetails, setScrapingDetails] = useState<{
    totalChannels: number;
    processedChannels: number;
    currentChannel: string | null;
    totalJobsExtracted: number;
    errors: string[];
  }>({
    totalChannels: 0,
    processedChannels: 0,
    currentChannel: null,
    totalJobsExtracted: 0,
    errors: []
  });

  const manualScrapeChannels = httpsCallable(functions, 'runTelegramScrapingNowV2');

  // Listen for real-time progress updates
  useEffect(() => {
    if (!currentSessionId) return;

    console.log('📡 Setting up progress listener for session:', currentSessionId);
    
    const progressDocRef = doc(db, 'scrapingProgress', currentSessionId);
    const unsubscribe = onSnapshot(progressDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log('📊 Progress update:', data);
        
        setScrapingDetails({
          totalChannels: data.totalChannels || 0,
          processedChannels: data.processedChannels || 0,
          currentChannel: data.currentChannel,
          totalJobsExtracted: data.totalJobsExtracted || 0,
          errors: data.errors || []
        });

        // Calculate progress percentage
        const progress = data.totalChannels > 0 
          ? Math.round((data.processedChannels / data.totalChannels) * 100)
          : 0;
        setScrapingProgress(progress);

        // Update message
        if (data.status === 'running') {
          setScrapingMessage(
            data.currentChannel 
              ? `Processing ${data.currentChannel}... (${data.processedChannels}/${data.totalChannels})`
              : `Scraping in progress... (${data.processedChannels}/${data.totalChannels})`
          );
        } else if (data.status === 'completed') {
          setScrapingMessage(`✅ Completed! Extracted ${data.totalJobsExtracted} jobs from ${data.totalChannels} channels`);
          setScrapingStatus('completed');
          
          // Show completion alert with results
          const errorDetails = data.errors?.length 
            ? `\n\n⚠️ Encountered ${data.errors.length} error(s):\n${data.errors.slice(0, 3).join('\n')}${data.errors.length > 3 ? `\n... and ${data.errors.length - 3} more` : ''}`
            : '';
          
          Alert.alert(
            data.errors?.length ? 'Scraping Completed with Warnings ⚠️' : 'Scraping Complete! 🎉',
            `Processed: ${data.totalChannels} channels\nJobs found: ${data.totalJobsExtracted}\nMessages processed: ${data.totalMessagesProcessed || 0}${errorDetails}`,
            [
              { text: 'View Console', onPress: () => console.log('Full scraping result:', data) },
              { text: 'OK', style: 'default' }
            ]
          );
          
          // Refresh channels to show updated stats
          loadChannels();
          
          // Auto-hide progress after 5 seconds
          setTimeout(() => {
            setScrapingStatus('idle');
            setScrapingProgress(0);
            setScrapingMessage('');
            setCurrentSessionId(null);
          }, 5000);
        } else if (data.status === 'failed') {
          setScrapingMessage(`❌ Scraping failed: ${data.error || 'Unknown error'}`);
          setScrapingStatus('error');
          
          // Show error alert
          Alert.alert(
            'Scraping Failed',
            `Scraping failed: ${data.error || 'Unknown error'}\n\nCheck console for details.`,
            [{ text: 'OK' }]
          );
          
          setTimeout(() => {
            setScrapingStatus('idle');
            setScrapingProgress(0);
            setScrapingMessage('');
            setCurrentSessionId(null);
          }, 3000);
        }
      }
    }, (error) => {
      console.error('❌ Progress listener error:', error);
    });

    return () => unsubscribe();
  }, [currentSessionId]);

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
    setScrapingMessage('Initializing scraper...');

    try {
      console.log('🚀 Starting manual scrape...');
      const result = await manualScrapeChannels();
      console.log('📊 Scraping result:', result);
      
      const data = result.data as any;
      
      // Set the session ID to start listening for progress
      if (data?.sessionId) {
        console.log('� Starting progress tracking for session:', data.sessionId);
        setCurrentSessionId(data.sessionId);
      }
      
      if (data?.success) {
        // Function returned immediately - scraping is running in background
        console.log('✅ Scraping started in background:', data);
        
        // Log any errors that occurred during scraping (will be updated via progress listener)
        if (data.errors && data.errors.length > 0) {
          console.error('⚠️ Scraping completed with errors:', data.errors);
          data.errors.forEach((err: string, index: number) => {
            console.error(`  Error ${index + 1}:`, err);
          });
        }
        
        setScrapingMessage(`Scraping ${data.channelsToProcess} channels in progress...`);
        
        // Note: Final results will be shown by the progress listener when status becomes 'completed'
        
        // Refresh channels to show updated stats later
        setTimeout(() => loadChannels(), 5000);
      } else {
        setScrapingMessage('❌ Scraping failed - check console for details');
        setScrapingStatus('error');
        
        console.error('❌ Scraping failed. Full response:', data);
        
        Alert.alert(
          'Scraping Failed',
          'The scraping process failed. Please check the console for detailed error logs.',
          [{ text: 'OK' }]
        );
        
        setTimeout(() => {
          setScrapingStatus('idle');
          setScrapingProgress(0);
          setScrapingMessage('');
        }, 3000);
      }

    } catch (error: any) {
      console.error('❌ Manual scraping failed with exception:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
      });
      
      setScrapingStatus('error');
      
      const errorMessage = error.message || String(error);
      const errorCode = error.code || 'unknown';
      const errorDetails = error.details || {};
      
      setScrapingMessage(`❌ Error: ${errorMessage}`);
      
      Alert.alert(
        'Scraping Failed',
        `An error occurred during scraping:\n\nError: ${errorMessage}\nCode: ${errorCode}\n\nCheck console for full details.`,
        [
          { 
            text: 'View Console', 
            onPress: () => {
              console.log('=== FULL ERROR DETAILS ===');
              console.error('Error object:', error);
              console.error('Error details:', errorDetails);
            }
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
      
      setTimeout(() => {
        setScrapingStatus('idle');
        setScrapingProgress(0);
        setScrapingMessage('');
      }, 5000);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.lightGray }]}>
        <View style={styles.headerContent}>
          <Image source={NibJobsIcon} style={styles.headerIcon} />
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.deepNavy }]}>Telegram Channels</Text>
            <Text style={[styles.headerSubtitle, { color: colors.warmGray }]}>
              Manage job scraping sources
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.beeYellow }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={[styles.addButtonText, { color: '#000000' }]}>+ Add Channel</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={[styles.content, { backgroundColor: colors.lightGray }]}
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
          <Text style={[styles.sectionTitle, { color: colors.deepNavy }]}>Overview</Text>
          <View style={styles.overviewCards}>
            <View style={[styles.overviewCard, styles.overviewCardPrimary, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="layers" size={28} color={colors.beeYellow} />
              </View>
              <Text style={[styles.overviewValue, { color: colors.deepNavy }]}>{channels.length}</Text>
              <Text style={[styles.overviewLabel, { color: colors.warmGray }]}>Total Channels</Text>
            </View>
            <View style={[styles.overviewCard, styles.overviewCardSuccess, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="check-circle" size={28} color={colors.success} />
              </View>
              <Text style={[styles.overviewValue, { color: colors.deepNavy }]}>
                {channels.filter(c => c.isActive && c.scrapingEnabled).length}
              </Text>
              <Text style={[styles.overviewLabel, { color: colors.warmGray }]}>Active Channels</Text>
            </View>
            <View style={[styles.overviewCard, styles.overviewCardInfo, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="briefcase" size={28} color={colors.honeyGold} />
              </View>
              <Text style={[styles.overviewValue, { color: colors.deepNavy }]}>
                {channels.reduce((total, ch) => total + ch.totalJobsScraped, 0)}
              </Text>
              <Text style={[styles.overviewLabel, { color: colors.warmGray }]}>Total Jobs Scraped</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.deepNavy }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonPrimary, { backgroundColor: colors.white, borderColor: colors.lightGray }]}
              onPress={() => setShowAddModal(true)}
            >
              <View style={styles.actionButtonContent}>
                <View style={[styles.actionIconCircle, { backgroundColor: colors.beeYellow }]}>
                  <Icon name="add" size={24} color="#000000" />
                </View>
                <Text style={[styles.actionButtonText, { color: colors.deepNavy }]}>Add Channel</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary, { backgroundColor: colors.white, borderColor: colors.lightGray }]}
              onPress={handleRefresh}
            >
              <View style={styles.actionButtonContent}>
                <View style={[styles.actionIconCircle, { backgroundColor: colors.success }]}>
                  <Icon name="refresh" size={24} color={colors.white} />
                </View>
                <Text style={[styles.actionButtonText, { color: colors.deepNavy }]}>Refresh List</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.actionButtonWarning,
                { backgroundColor: colors.white, borderColor: colors.lightGray },
                scrapingStatus === 'scraping' && styles.actionButtonDisabled
              ]}
              onPress={scrapingStatus === 'idle' ? handleManualScrape : undefined}
              disabled={scrapingStatus === 'scraping'}
            >
              <View style={styles.actionButtonContent}>
                <View style={[styles.actionIconCircle, { backgroundColor: colors.honeyGold }]}>
                  {scrapingStatus === 'scraping' ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Icon name="play-circle" size={24} color={colors.white} />
                  )}
                </View>
                <Text style={[styles.actionButtonText, { color: colors.deepNavy }]}>
                  {scrapingStatus === 'scraping' ? 'Scraping...' : 'Start Scrape'}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSuccess, { backgroundColor: colors.white, borderColor: colors.lightGray }]}
              onPress={enableAllChannelsForScraping}
            >
              <View style={styles.actionButtonContent}>
                <View style={[styles.actionIconCircle, { backgroundColor: colors.success }]}>
                  <Icon name="check-circle" size={24} color={colors.white} />
                </View>
                <Text style={[styles.actionButtonText, { color: colors.deepNavy }]}>Enable All</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scraping Progress Status */}
        {scrapingStatus !== 'idle' && (
          <View style={[styles.progressSection, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
            <Text style={[styles.progressTitle, { color: colors.deepNavy }]}>🔄 Scraping Status</Text>
            
            {/* Progress Bar */}
            <View style={[styles.progressContainer, { backgroundColor: colors.lightGray }]}>
              <View style={[styles.progressBar, { width: `${scrapingProgress}%`, backgroundColor: colors.beeYellow }]} />
              <Text style={[styles.progressPercentage, { color: colors.deepNavy }]}>{scrapingProgress}%</Text>
            </View>
            
            {/* Progress Message */}
            <Text style={[styles.progressMessage, { color: colors.warmGray }]}>{scrapingMessage}</Text>
            
            {/* Detailed Progress Info */}
            {scrapingStatus === 'scraping' && scrapingDetails.totalChannels > 0 && (
              <View style={[styles.progressDetails, { backgroundColor: colors.lightGray, borderColor: colors.lightGray }]}>
                <View style={styles.progressDetailRow}>
                  <Text style={[styles.progressDetailLabel, { color: colors.warmGray }]}>📺 Total Channels:</Text>
                  <Text style={[styles.progressDetailValue, { color: colors.deepNavy }]}>{scrapingDetails.totalChannels}</Text>
                </View>
                <View style={styles.progressDetailRow}>
                  <Text style={[styles.progressDetailLabel, { color: colors.warmGray }]}>✅ Processed:</Text>
                  <Text style={[styles.progressDetailValue, { color: colors.deepNavy }]}>
                    {scrapingDetails.processedChannels} / {scrapingDetails.totalChannels}
                  </Text>
                </View>
                {scrapingDetails.currentChannel && (
                  <View style={styles.progressDetailRow}>
                    <Text style={[styles.progressDetailLabel, { color: colors.warmGray }]}>🔍 Current:</Text>
                    <Text style={[styles.progressDetailValue, styles.currentChannel, { color: colors.beeYellow }]}>
                      {scrapingDetails.currentChannel}
                    </Text>
                  </View>
                )}
                <View style={styles.progressDetailRow}>
                  <Text style={[styles.progressDetailLabel, { color: colors.warmGray }]}>💼 Jobs Found:</Text>
                  <Text style={[styles.progressDetailValue, styles.jobsCount, { color: colors.success }]}>
                    {scrapingDetails.totalJobsExtracted}
                  </Text>
                </View>
                {scrapingDetails.errors && scrapingDetails.errors.length > 0 && (
                  <View style={styles.progressDetailRow}>
                    <Text style={[styles.progressDetailLabel, { color: colors.warmGray }]}>⚠️ Errors:</Text>
                    <Text style={[styles.progressDetailValue, styles.errorCount, { color: colors.danger }]}>
                      {scrapingDetails.errors.length}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Error List - Show if there are errors */}
            {scrapingDetails.errors && scrapingDetails.errors.length > 0 && (
              <View style={[styles.errorSection, { backgroundColor: colors.lightGray }]}>
                <Text style={[styles.errorSectionTitle, { color: colors.danger }]}>⚠️ Errors Encountered:</Text>
                <ScrollView style={styles.errorList} nestedScrollEnabled>
                  {scrapingDetails.errors.slice(0, 5).map((error, index) => (
                    <View key={index} style={[styles.errorItem, { backgroundColor: colors.white }]}>
                      <Text style={[styles.errorNumber, { color: colors.warmGray }]}>{index + 1}.</Text>
                      <Text style={[styles.errorText, { color: colors.danger }]} numberOfLines={2}>{error}</Text>
                    </View>
                  ))}
                  {scrapingDetails.errors.length > 5 && (
                    <Text style={[styles.errorMore, { color: colors.warmGray }]}>
                      ... and {scrapingDetails.errors.length - 5} more errors (check console)
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}
            
            {scrapingProgress > 0 && (
              <Text style={[styles.progressPercent, { color: colors.beeYellow }]}>{scrapingProgress}%</Text>
            )}
          </View>
        )}

        {/* Channels List */}
        <View style={styles.channelsSection}>
          <TelegramChannelsList
            channels={channels}
            onChannelsUpdate={handleChannelsUpdate}
            loading={loading}
            colors={colors}
          />
        </View>
      </ScrollView>

      {/* Add Channel Modal */}
      <TelegramChannelFormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onChannelAdded={handleChannelAdded}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
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
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  overviewSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: 16,
  },
  overviewCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  overviewCardPrimary: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
  },
  overviewCardSuccess: {
    backgroundColor: '#F0FAF4',
    borderWidth: 2,
  },
  overviewCardInfo: {
    backgroundColor: '#FFF8EC',
    borderWidth: 2,
  },
  overviewIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -1,
  },
  overviewLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 150,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
  },
  actionButtonPrimary: {
    backgroundColor: '#FFF9E6',
  },
  actionButtonSecondary: {
    backgroundColor: '#FFF8EC',
  },
  actionButtonWarning: {
    backgroundColor: '#FFF8E6',
  },
  actionButtonSuccess: {
    backgroundColor: '#F0FAF4',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  progressSection: {
    padding: 20,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  progressContainer: {
    height: 12,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  progressPercentage: {
    position: 'absolute',
    right: 8,
    top: -1,
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressMessage: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressDetails: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  progressDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  progressDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  progressDetailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  currentChannel: {
    fontWeight: '800',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  jobsCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  errorCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  errorSection: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  errorSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorList: {
    maxHeight: 150,
  },
  errorItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingVertical: 4,
  },
  errorNumber: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
    minWidth: 20,
  },
  errorText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  errorMore: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  channelsSection: {
    marginBottom: 24,
  },
});