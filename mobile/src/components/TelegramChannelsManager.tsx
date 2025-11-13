import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';

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
  lastScraped?: Date;
}

export default function TelegramChannelsManager() {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [scrapingLogs, setScrapingLogs] = useState<string[]>([]);
  const [scrapingStatus, setScrapingStatus] = useState<{
    isRunning: boolean;
    currentStep: string;
    progress: number;
    startTime?: Date;
    lastActivity?: Date;
  }>({
    isRunning: false,
    currentStep: '',
    progress: 0
  });

  // Load channels from Firestore
  const loadChannels = async () => {
    try {
      setLoading(true);
      const channelsSnapshot = await getDocs(collection(db, 'telegramChannels'));
      const channelsData = channelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TelegramChannel[];
      
      setChannels(channelsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading channels:', error);
      Alert.alert('Error', 'Failed to load telegram channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  // Helper function to add logs
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setScrapingLogs(prev => [...prev.slice(-20), logMessage]); // Keep last 20 logs
    console.log(logMessage);
  };

  // Helper function to update scraping status
  const updateStatus = (step: string, progress: number = 0) => {
    setScrapingStatus(prev => ({
      ...prev,
      currentStep: step,
      progress,
      lastActivity: new Date()
    }));
    addLog(step);
  };

  const handleManualTrigger = async () => {
    console.log('🔍 DEBUG: Manual trigger button clicked');
    
    // Initialize scraping state
    setLoading(true);
    setScrapingLogs([]);
    setScrapingStatus({
      isRunning: true,
      currentStep: 'Initializing...',
      progress: 0,
      startTime: new Date()
    });
    
    try {
      console.log('🔍 DEBUG: Starting manual trigger execution');
      addLog('🚀 Starting manual Telegram scraping...');
      updateStatus('📋 Connecting to Firebase Functions...', 10);
      
      const runScrapingNow = httpsCallable(functions, 'runTelegramScrapingNow');
      updateStatus('🔐 Calling function...', 50);
      const result = await runScrapingNow();
      
      console.log('📊 Result:', result);
      Alert.alert('Result', JSON.stringify(result.data, null, 2));
      
    } catch (error) {
      console.error('💥 Error:', error);
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
      setScrapingStatus(prev => ({ ...prev, isRunning: false }));
    }
  };


  const handleScheduledScraping = async () => {
    Alert.alert(
      'Scheduled Telegram Scraping',
      'This function runs automatically at 9 AM UTC daily. It:\n\n🔐 Uses your Telegram user credentials\n📋 Queries all active channels\n📥 Fetches latest 10 messages per channel\n🤖 Uses OpenAI for job extraction\n💾 Saves jobs to Firestore\n🚫 Avoids duplicates',
      [
        { text: 'View Implementation', onPress: () => {
          console.log('🔍 Function Implementation Details:');
          console.log('1. 🔐 Telegram Authentication: Uses TELEGRAM_SESSION_STRING, API_ID, API_HASH');
          console.log('2. 📋 Channel Query: WHERE isActive==true AND scrapingEnabled==true');
          console.log('3. 📥 Message Fetching: Latest 10 messages per channel via MTProto API');
          console.log('4. 🤖 AI Processing: OpenAI GPT-3.5-turbo for job extraction');
          console.log('5. 💾 Data Storage: Firestore jobs collection with deduplication');
          console.log('6. 📊 Statistics: Updates channel stats (totalJobsScraped, lastScraped)');
        }},
        { text: 'OK' }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 Telegram Scraping System</Text>
        <Text style={styles.subtitle}>
          Automated job scraping using Telegram User API + OpenAI
        </Text>
      </View>

      {/* System Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>🤖 System Status</Text>
        <Text style={styles.statusText}>
          ✅ Scheduled Function: Active (9 AM UTC daily)
        </Text>
        <Text style={styles.statusText}>
          🔐 Authentication: Telegram User API 
        </Text>
        <Text style={styles.statusText}>
          📊 Active Channels: {channels.filter(c => c.isActive && c.scrapingEnabled).length}
        </Text>
        <Text style={styles.statusText}>
          🔄 Last Updated: {lastUpdate.toLocaleString()}
        </Text>
      </View>

      {/* Channel Statistics */}
      <View style={styles.channelsContainer}>
        <Text style={styles.channelsTitle}>📋 Active Channels</Text>
        
        {loading ? (
          <Text style={styles.loadingText}>Loading channels...</Text>
        ) : channels.length === 0 ? (
          <Text style={styles.noChannelsText}>No channels configured</Text>
        ) : (
          channels
            .filter(c => c.isActive && c.scrapingEnabled)
            .map(channel => (
              <View key={channel.id} style={styles.channelItem}>
                <View style={styles.channelHeader}>
                  <Text style={styles.channelName}>@{channel.username}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Active</Text>
                  </View>
                </View>
                <Text style={styles.channelDetails}>
                  {channel.name} • {channel.category}
                </Text>
                <Text style={styles.channelStats}>
                  📊 Jobs Scraped: {channel.totalJobsScraped || 0}
                </Text>
                {channel.lastScraped && (
                  <Text style={styles.channelStats}>
                    🕐 Last Scraped: {new Date(channel.lastScraped).toLocaleString()}
                  </Text>
                )}
              </View>
            ))
        )}
        
        {channels.filter(c => !c.isActive || !c.scrapingEnabled).length > 0 && (
          <>
            <Text style={styles.inactiveTitle}>💤 Inactive Channels</Text>
            {channels
              .filter(c => !c.isActive || !c.scrapingEnabled)
              .map(channel => (
                <View key={channel.id} style={[styles.channelItem, styles.inactiveChannel]}>
                  <Text style={styles.inactiveChannelName}>@{channel.username}</Text>
                  <Text style={styles.channelDetails}>{channel.name}</Text>
                </View>
              ))
            }
          </>
        )}
      </View>

      {/* Real-time Scraping Status & Logs */}
      {(scrapingStatus.isRunning || scrapingLogs.length > 0) && (
        <View style={styles.loggingContainer}>
          <Text style={styles.loggingTitle}>🔍 Scraping Activity</Text>
          
          {/* Current Status */}
          {scrapingStatus.isRunning && (
            <View style={styles.statusPanel}>
              <Text style={styles.currentStatus}>
                Status: {scrapingStatus.currentStep}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${scrapingStatus.progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {scrapingStatus.progress}% Complete
              </Text>
              {scrapingStatus.startTime && (
                <Text style={styles.timeText}>
                  ⏱️ Started: {scrapingStatus.startTime.toLocaleTimeString()}
                </Text>
              )}
            </View>
          )}
          
          {/* Live Logs */}
          {scrapingLogs.length > 0 && (
            <View style={styles.logsPanel}>
              <Text style={styles.logsTitle}>📋 Activity Logs</Text>
              <ScrollView 
                style={styles.logsScroll}
                showsVerticalScrollIndicator={true}
              >
                {scrapingLogs.map((log, index) => (
                  <Text key={index} style={styles.logEntry}>
                    {log}
                  </Text>
                ))}
              </ScrollView>
              <TouchableOpacity 
                style={styles.clearLogsButton}
                onPress={() => setScrapingLogs([])}
              >
                <Text style={styles.clearLogsText}>🗑️ Clear Logs</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleScheduledScraping}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            ℹ️ About Scheduled Function
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.manualButton}
          onPress={handleManualTrigger}
          disabled={loading}
        >
          <Text style={styles.manualButtonText}>
            {loading ? '� Scraping in Progress...' : '🚀 Run Scraping NOW'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadChannels}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>
            {loading ? '🔄 Loading...' : '🔄 Refresh Channels'}
          </Text>
        </TouchableOpacity>

        {/* Test Button */}
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: colors.warning }]}
          onPress={async () => {
            try {
              console.log('🧪 Testing callable function...');
              const testCallable = httpsCallable(functions, 'testCallable');
              const result = await testCallable();
              console.log('🧪 Test result:', result);
              const data = result.data as any;
              Alert.alert('Test Success', `Callable function works!\n\nAuthenticated: ${data.authenticated}\nUID: ${data.uid || 'None'}`);
            } catch (error) {
              console.error('🧪 Test failed:', error);
              const errorMsg = error instanceof Error ? error.message : String(error);
              Alert.alert('Test Failed', `Error: ${errorMsg}\n\nThis shows why the scraping button isn't working.`);
            }
          }}
        >
          <Text style={styles.refreshButtonText}>🧪 Test Function</Text>
        </TouchableOpacity>

        {/* Populate Categories Button */}
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: colors.success }]}
          onPress={async () => {
            try {
              setLoading(true);
              console.log('🏗️ Populating job categories...');
              
              const populateCategories = httpsCallable(functions, 'populateJobCategories');
              const result = await populateCategories();
              console.log('🏗️ Categories result:', result);
              
              const data = result.data as any;
              Alert.alert(
                'Success!', 
                `Categories populated successfully!\n\nCreated: ${data.created}\nUpdated: ${data.updated}\nTotal: ${data.totalCategories}`
              );
            } catch (error) {
              console.error('🏗️ Categories failed:', error);
              const errorMsg = error instanceof Error ? error.message : String(error);
              Alert.alert('Error', `Failed to populate categories: ${errorMsg}`);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>
            {loading ? '🏗️ Creating...' : '🏗️ Populate Categories'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>🔧 How It Works</Text>
        <Text style={styles.infoText}>
          1. 🕘 Runs daily at 9 AM UTC automatically
        </Text>
        <Text style={styles.infoText}>
          2. 🔐 Connects with your Telegram user account
        </Text>
        <Text style={styles.infoText}>
          3. 📋 Queries all active channels from Firestore
        </Text>
        <Text style={styles.infoText}>
          4. 📥 Fetches latest 10 messages from each channel
        </Text>
        <Text style={styles.infoText}>
          5. 🤖 Uses OpenAI to extract job information
        </Text>
        <Text style={styles.infoText}>
          6. 💾 Saves validated jobs to Firestore
        </Text>
        <Text style={styles.infoText}>
          7. 🚫 Automatically prevents duplicate jobs
        </Text>
      </View>

      {/* Requirements */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.infoTitle}>⚙️ Environment Variables Required</Text>
        <Text style={styles.requirementText}>
          • TELEGRAM_API_ID: Your Telegram app ID
        </Text>
        <Text style={styles.requirementText}>
          • TELEGRAM_API_HASH: Your Telegram app hash  
        </Text>
        <Text style={styles.requirementText}>
          • TELEGRAM_SESSION_STRING: User session for auth
        </Text>
        <Text style={styles.requirementText}>
          • OPENAI_API_KEY: OpenAI API for job extraction
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    padding: 20,
    backgroundColor: colors.deepNavy,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.beeYellow,
    textAlign: 'center',
  },
  statusContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: colors.charcoal,
    marginBottom: 6,
  },
  channelsContainer: {
    margin: 16,
    marginTop: 0,
  },
  channelsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 12,
  },
  channelItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  statusBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  channelDetails: {
    fontSize: 14,
    color: colors.warmGray,
    marginBottom: 4,
  },
  channelStats: {
    fontSize: 12,
    color: colors.charcoal,
    marginTop: 2,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.warmGray,
    fontStyle: 'italic',
    padding: 20,
  },
  noChannelsText: {
    textAlign: 'center',
    color: colors.warmGray,
    fontStyle: 'italic',
    padding: 20,
  },
  inactiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warmGray,
    marginTop: 16,
    marginBottom: 8,
  },
  inactiveChannel: {
    opacity: 0.6,
    backgroundColor: colors.lightGray,
  },
  inactiveChannelName: {
    fontSize: 14,
    color: colors.warmGray,
    fontWeight: 'bold',
  },
  actionContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.deepNavy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualButton: {
    backgroundColor: colors.beeYellow,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  manualButtonText: {
    color: colors.deepNavy,
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.charcoal,
    marginBottom: 8,
    lineHeight: 20,
  },
  requirementsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
  },
  requirementText: {
    fontSize: 13,
    color: colors.charcoal,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  // Logging and status styles
  loggingContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.beeYellow,
  },
  loggingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusPanel: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.cream,
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.beeYellow,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.warmGray,
    textAlign: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.warmGray,
    fontStyle: 'italic',
  },
  logsPanel: {
    backgroundColor: colors.charcoal,
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  logsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  logsScroll: {
    maxHeight: 120,
    marginBottom: 8,
  },
  logEntry: {
    fontSize: 11,
    color: colors.cream,
    fontFamily: 'monospace',
    marginBottom: 2,
    lineHeight: 16,
  },
  clearLogsButton: {
    backgroundColor: colors.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  clearLogsText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
});