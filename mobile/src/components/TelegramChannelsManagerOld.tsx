import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

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

interface TelegramChannelsResponse {
  success: boolean;
  channels?: TelegramChannel[];
}

interface ScrapeResponse {
  success: boolean;
  totalJobs: number;
  results: any[];
}

export function TelegramChannelsManager() {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannel, setNewChannel] = useState({
    username: '',
    name: '',
    imageUrl: '',
    category: 'general'
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Firebase services imported from centralized config

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
  }, []);

  // Store selected file for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload channel image to Firebase Storage
  const uploadChannelImage = async (channelUsername: string, file: File): Promise<string> => {
    try {
      // Create storage reference
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const imageRef = ref(storage, `telegram-channels/${channelUsername}/channel-image.${fileExtension}`);
      
      // Upload the file
      await uploadBytes(imageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Handle image selection (web-based file input)
  const selectImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'Image size must be less than 5MB');
          return;
        }
        
        // Store file and create preview URL
        setSelectedFile(file);
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
      }
    };
    input.click();
  };

  // Load channels from Firebase
  const loadChannels = async () => {
    setLoading(true);
    try {
      const channelsCollection = collection(db, 'telegramChannels');
      const channelsSnapshot = await getDocs(channelsCollection);
      
      const channelsList: TelegramChannel[] = channelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TelegramChannel));
      
      setChannels(channelsList);
    } catch (error) {
      console.error('Error loading channels:', error);
      Alert.alert('Error', 'Failed to load Telegram channels');
    }
    setLoading(false);
  };

  // Add new channel
  const addChannel = async () => {
    if (!newChannel.username.trim() || !newChannel.name.trim()) {
      Alert.alert('Error', 'Please fill in username and name');
      return;
    }

    setLoading(true);
    try {
      // Check if channel already exists
      const channelsCollection = collection(db, 'telegramChannels');
      const existingChannels = await getDocs(channelsCollection);
      const existingUsernames = existingChannels.docs.map(doc => doc.data().username);
      
      const cleanUsername = newChannel.username.replace('@', '');
      if (existingUsernames.includes(cleanUsername)) {
        Alert.alert('Error', `Channel @${cleanUsername} already exists`);
        setLoading(false);
        return;
      }

      // Upload image if selected
      let imageUrl = '';
      if (selectedFile) {
        setUploading(true);
        try {
          imageUrl = await uploadChannelImage(cleanUsername, selectedFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Warning', 'Channel added but image upload failed');
        }
        setUploading(false);
      }

      // Create new channel document
      const newChannelDoc = {
        username: cleanUsername,
        name: newChannel.name,
        imageUrl: imageUrl,
        category: newChannel.category,
        isActive: true,
        scrapingEnabled: true,
        totalJobsScraped: 0,
        lastScraped: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(channelsCollection, newChannelDoc);
      
      Alert.alert('Success', 'Channel added successfully!');
      setNewChannel({ username: '', name: '', imageUrl: '', category: 'general' });
      setSelectedImage(null);
      setSelectedFile(null);
      setShowAddModal(false);
      loadChannels(); // Refresh the list
    } catch (error) {
      console.error('Error adding channel:', error);
      Alert.alert('Error', 'Failed to add channel');
    }
    setLoading(false);
  };

  // Test Telegram Bot connectivity
  const testTelegramConnection = async () => {
    console.log('🧪 testTelegramConnection function called! Starting Telegram connection test...');
    
    Alert.alert(
      'Test Telegram Connection',
      'Test if the Telegram bot can connect and access channels?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test Connection', 
          onPress: async () => {
            console.log('🔄 Test Connection button pressed');
            setLoading(true);
            
            try {
              console.log('📡 Calling Firebase function: testTelegramConnection');
              const testConnection = httpsCallable(functions, 'testTelegramConnection');
              
              console.log('⏳ Executing function...');
              const result = await testConnection();
              
              console.log('📝 Function result:', result);
              const data = result.data as any;
              
              if (data.success && data.botValid) {
                Alert.alert(
                  'Telegram Connection Successful! 🤖',
                  `Bot: @${data.botInfo.username}\nUpdates received: ${data.updatesReceived}\nChannel messages found: ${data.channelMessages.length}`,
                  [
                    { text: 'View Details', onPress: () => {
                      console.log('📋 Full connection test results:', data);
                    }},
                    { text: 'OK' }
                  ]
                );
              } else {
                console.log('❌ Connection test failed:', data);
                Alert.alert(
                  'Connection Test Failed ❌',
                  `Errors:\n${data.errors.join('\n')}\n\nBot Valid: ${data.botValid}`,
                  [
                    { text: 'View Details', onPress: () => {
                      console.log('📋 Failed test details:', data);
                    }},
                    { text: 'OK' }
                  ]
                );
              }
            } catch (error) {
              console.error('💥 Error during connection test:', error);
              Alert.alert(
                'Connection Test Error',
                `Failed to execute test:\n\n${error}\n\nCheck browser console for details.`,
                [
                  { text: 'Open Console', onPress: () => {
                    console.log('🔍 Open browser console (F12) to see detailed error logs');
                  }},
                  { text: 'OK' }
                ]
              );
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Test channel message fetching
  const testChannelMessages = async () => {
    // Get first active channel or prompt for channel name
    const activeChannel = channels.find(ch => ch.isActive);
    const channelUsername = activeChannel ? activeChannel.username : 'jobtelegram';
    
    Alert.alert(
      'Test Channel Messages',
      `Test fetching messages from @${channelUsername}?\n\nNote: The bot must be added to the channel or the channel must be public.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test Channel', 
          onPress: async () => {
            setLoading(true);
            try {
              const testChannel = httpsCallable(functions, 'testChannelMessages');
              const result = await testChannel({ channelUsername });
              
              const data = result.data as any;
              
              if (data.success) {
                Alert.alert(
                  'Channel Test Successful! 📱',
                  `Channel: @${data.channelUsername}\nMessages found: ${data.messagesFound}`,
                  [
                    { text: 'View Messages', onPress: () => {
                      console.log('Channel messages:', data.messages);
                    }},
                    { text: 'OK' }
                  ]
                );
              } else {
                Alert.alert(
                  'Channel Test Failed ❌',
                  `Channel: @${data.channelUsername}\n\nErrors:\n${data.errors.join('\n')}`
                );
              }
            } catch (error) {
              console.error('Error during channel test:', error);
              Alert.alert('Error', `Channel test failed: ${error}`);
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Test AI-powered scraping with mock data
  const testAIScraping = async () => {
    Alert.alert(
      'AI Scraping Test',
      'Test the AI-powered job extraction system with mock Telegram messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start AI Test', 
          onPress: async () => {
            setLoading(true);
            try {
              const testTelegramScraping = httpsCallable(functions, 'testTelegramScraping');
              const result = await testTelegramScraping();
              
              const data = result.data as any;
              
              if (data.success) {
                Alert.alert(
                  'AI Scraping Test Complete! 🤖',
                  `Successfully extracted ${data.jobsExtracted} jobs from ${data.messagesProcessed} test messages.\n\nNew jobs have been added to the jobs collection with AI-powered extraction.`,
                  [
                    { text: 'View Jobs', onPress: () => {
                      // Could navigate to jobs list or open Firebase console
                      console.log('Extracted jobs:', data.extractedJobs);
                    }},
                    { text: 'OK' }
                  ]
                );
              } else {
                Alert.alert(
                  'Test Failed',
                  `AI scraping test encountered errors:\n${data.errors.join('\n')}`
                );
              }
              
              loadChannels(); // Refresh to show any updated stats
            } catch (error) {
              console.error('Error during AI scraping test:', error);
              Alert.alert('Error', `AI scraping test failed: ${error}`);
            }
            setLoading(false);
          }
        }
      ]
    );
  };



  // Run the main scraping function for all channels
  const runDailyScraping = async () => {
    Alert.alert(
      'Daily Channel Scraping',
      'This will scrape jobs from ALL channels in your database using user account authentication. This is the main production function.\n\nIt will:\n• Connect with your Telegram account\n• Process all channels in telegramChannels collection\n• Extract jobs using AI\n• Save results to Firestore',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Daily Scraping', 
          onPress: async () => {
            setLoading(true);
            try {
              console.log('🚀 Starting daily scraping for all channels...');
              const scrapeAllChannels = httpsCallable(functions, 'scrapeAllChannelsToday');
              const result = await scrapeAllChannels();
              
              console.log('📊 Daily scraping result:', result);
              const data = result.data as any;
              
              if (data.success) {
                Alert.alert(
                  'Daily Scraping Complete! 🎉',
                  `✅ Processed ${data.totalChannelsProcessed} channels\n🎯 Extracted ${data.totalJobsExtracted} jobs today\n⚡ All jobs saved to Firestore with AI categorization`,
                  [
                    { text: 'View Channel Results', onPress: () => {
                      console.log('📊 Channel processing results:', data.channelResults);
                      // Show detailed results for each channel
                      data.channelResults.forEach((channel: any, index: number) => {
                        console.log(`Channel ${index + 1}: @${channel.username} - ${channel.jobsExtracted} jobs from ${channel.messagesFound} messages`);
                      });
                    }},
                    { text: 'OK' }
                  ]
                );
              } else {
                Alert.alert(
                  'Daily Scraping Issues ⚠️',
                  `Connected: ${data.connected ? '✅' : '❌'}\nChannels processed: ${data.totalChannelsProcessed}\nJobs extracted: ${data.totalJobsExtracted}\n\nIssues:\n${data.errors.join('\n')}`,
                  [
                    { text: 'View Details', onPress: () => {
                      console.log('📋 Daily scraping details:', data);
                    }},
                    { text: 'OK' }
                  ]
                );
              }
              
              // Refresh channels to show updated stats
              loadChannels();
            } catch (error) {
              console.error('💥 Error during daily scraping:', error);
              Alert.alert('Daily Scraping Error', `Failed to execute daily scraping: ${error}`);
            }
            setLoading(false);
          }
        }
      ]
    );
  };



  // Trigger manual scraping
  const triggerManualScrape = async () => {
    const activeChannels = channels
      .filter(ch => ch.isActive && ch.scrapingEnabled)
      .map(ch => ch.username);

    if (activeChannels.length === 0) {
      Alert.alert('No Channels', 'No active channels available for scraping');
      return;
    }

    Alert.alert(
      'Manual Scraping',
      `Start scraping ${activeChannels.length} active channels?\n\nNote: This is a simulation until Telegram bot is configured.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Scraping', 
          onPress: async () => {
            setLoading(true);
            try {
              // Simulate scraping for now (replace with actual API call when ready)
              const totalJobs = Math.floor(Math.random() * 50) + 10;
              
              // Update channel statistics
              for (const channel of channels.filter(ch => ch.isActive && ch.scrapingEnabled)) {
                const channelRef = doc(db, 'telegramChannels', channel.id);
                const jobsFound = Math.floor(Math.random() * 10) + 1;
                await updateDoc(channelRef, {
                  totalJobsScraped: (channel.totalJobsScraped || 0) + jobsFound,
                  lastScraped: serverTimestamp(),
                  updatedAt: serverTimestamp()
                });
              }
              
              Alert.alert(
                'Scraping Simulation Complete',
                `Simulated scraping ${totalJobs} jobs from ${activeChannels.length} channels.\n\nConfigure Telegram bot token to enable real scraping.`
              );
              loadChannels(); // Refresh to show updated stats
            } catch (error) {
              console.error('Error during manual scraping:', error);
              Alert.alert('Error', 'Manual scraping simulation failed');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Telegram Channels</Text>
      
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddModal(true)}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>+ Add Channel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.refreshButton} onPress={loadChannels}>
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Test Actions */}
      <View style={styles.testActions}>
        <TouchableOpacity 
          style={styles.telegramTestButton} 
          onPress={testTelegramConnection}
          disabled={loading}
        >
          <Text style={styles.telegramTestButtonText}>
            {loading ? '🔄 Testing...' : '🤖 Test Bot Connection'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.channelTestButton} 
          onPress={testChannelMessages}
          disabled={loading}
        >
          <Text style={styles.channelTestButtonText}>
            {loading ? '🔄 Testing...' : '📱 Test Channel Access'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.aiTestButton} 
          onPress={testAIScraping}
          disabled={loading}
        >
          <Text style={styles.aiTestButtonText}>
            {loading ? '🔄 Testing...' : '🧠 Test AI Extraction'}
          </Text>
        </TouchableOpacity>
        

      </View>

      {/* Production Scraping */}
      <View style={styles.productionActions}>
        <TouchableOpacity 
          style={styles.productionButton} 
          onPress={runDailyScraping}
          disabled={loading}
        >
          <Text style={styles.productionButtonText}>
            {loading ? '🔄 Processing...' : '🎯 Run Daily Scraping'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Scraping */}
      <View style={styles.scrapeActions}>
        <TouchableOpacity 
          style={styles.scrapeButton} 
          onPress={triggerManualScrape}
          disabled={loading}
        >
          <Text style={styles.scrapeButtonText}>
            {loading ? '🔄 Working...' : '🚀 Start Full Scraping'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Channels List */}
      <ScrollView style={styles.channelsList}>
        {channels.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No channels configured</Text>
            <Text style={styles.emptySubtext}>Add your first Telegram channel to start scraping jobs</Text>
          </View>
        ) : (
          channels.map((channel) => (
            <View key={channel.id} style={styles.channelCard}>
              <View style={styles.channelHeader}>
                <View style={styles.channelIcon}>
                  {channel.imageUrl ? (
                    <Image 
                      source={{ uri: channel.imageUrl }} 
                      style={styles.channelImage}
                    />
                  ) : (
                    <View style={styles.defaultIconContainer}>
                      <Text style={styles.defaultIconText}>📱</Text>
                    </View>
                  )}
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>@{channel.username}</Text>
                  <Text style={styles.channelTitle}>{channel.name}</Text>
                  <Text style={styles.channelMeta}>
                    {channel.category} • {channel.totalJobsScraped} jobs scraped
                  </Text>
                </View>
                
                <View style={styles.channelControls}>
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Active</Text>
                    <Switch
                      value={channel.isActive}
                      onValueChange={async (value) => {
                        // Update channel active status in Firestore
                        try {
                          const channelRef = doc(db, 'telegramChannels', channel.id);
                          await updateDoc(channelRef, {
                            isActive: value,
                            updatedAt: serverTimestamp()
                          });
                          
                          // Update local state
                          const updatedChannels = channels.map(ch => 
                            ch.id === channel.id ? { ...ch, isActive: value } : ch
                          );
                          setChannels(updatedChannels);
                        } catch (error) {
                          console.error('Error updating channel active status:', error);
                          Alert.alert('Error', 'Failed to update channel status');
                        }
                      }}
                      trackColor={{ false: colors.lightGray, true: colors.success }}
                      thumbColor={channel.isActive ? colors.white : colors.warmGray}
                    />
                  </View>
                  
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Scraping</Text>
                    <Switch
                      value={channel.scrapingEnabled}
                      onValueChange={async (value) => {
                        // Update channel scraping status in Firestore
                        try {
                          const channelRef = doc(db, 'telegramChannels', channel.id);
                          await updateDoc(channelRef, {
                            scrapingEnabled: value,
                            updatedAt: serverTimestamp()
                          });
                          
                          // Update local state
                          const updatedChannels = channels.map(ch => 
                            ch.id === channel.id ? { ...ch, scrapingEnabled: value } : ch
                          );
                          setChannels(updatedChannels);
                        } catch (error) {
                          console.error('Error updating channel scraping status:', error);
                          Alert.alert('Error', 'Failed to update scraping status');
                        }
                      }}
                      trackColor={{ false: colors.lightGray, true: colors.beeYellow }}
                      thumbColor={channel.scrapingEnabled ? colors.white : colors.warmGray}
                    />
                  </View>
                </View>
              </View>
              
              {channel.lastScraped && (
                <Text style={styles.lastScraped}>
                  Last scraped: {new Date(channel.lastScraped).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Channel Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Telegram Channel</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Channel Username</Text>
              <TextInput
                style={styles.input}
                value={newChannel.username}
                onChangeText={(text) => setNewChannel({...newChannel, username: text.replace('@', '')})}
                placeholder="e.g., jobsindubai"
                placeholderTextColor={colors.warmGray}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={newChannel.name}
                onChangeText={(text) => setNewChannel({...newChannel, name: text})}
                placeholder="e.g., Jobs in Dubai"
                placeholderTextColor={colors.warmGray}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Channel Image</Text>
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={selectImage}
              >
                {selectedImage ? (
                  <Image 
                    source={{ uri: selectedImage }} 
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>📷</Text>
                    <Text style={styles.placeholderSubtext}>Tap to select image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={newChannel.category}
                onChangeText={(text) => setNewChannel({...newChannel, category: text})}
                placeholder="e.g., technology, marketing, general"
                placeholderTextColor={colors.warmGray}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalAddButton} 
                onPress={addChannel}
                disabled={loading}
              >
                <Text style={styles.modalAddText}>
                  {loading ? 'Adding...' : 'Add Channel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  addButton: {
    backgroundColor: colors.beeYellow,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  addButtonText: {
    color: colors.deepNavy,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrapeButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  scrapeButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: colors.deepNavy,
    fontWeight: 'bold',
  },
  channelsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.warmGray,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  channelCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.beeYellow,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 5,
  },
  channelTitle: {
    fontSize: 16,
    color: colors.charcoal,
    marginBottom: 5,
  },
  channelMeta: {
    fontSize: 12,
    color: colors.warmGray,
  },
  channelControls: {
    alignItems: 'flex-end',
  },
  switchContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 12,
    color: colors.warmGray,
    marginBottom: 5,
  },
  lastScraped: {
    fontSize: 12,
    color: colors.success,
    marginTop: 10,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.deepNavy,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.deepNavy,
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: colors.cream,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.deepNavy,
    borderWidth: 1,
    borderColor: colors.beeYellow,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.deepNavy,
    fontWeight: 'bold',
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: colors.deepNavy,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalAddText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  channelIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: colors.beeYellow,
  },
  iconText: {
    fontSize: 24,
  },
  channelImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.lightGray,
  },
  defaultIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultIconText: {
    fontSize: 20,
  },
  imagePickerButton: {
    height: 120,
    backgroundColor: colors.cream,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.beeYellow,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: colors.warmGray,
    textAlign: 'center',
  },
  testActions: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  scrapeActions: {
    marginBottom: 20,
  },
  telegramTestButton: {
    backgroundColor: colors.deepNavy,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  telegramTestButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 11,
  },
  channelTestButton: {
    backgroundColor: colors.warmGray,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  channelTestButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 11,
  },
  aiTestButton: {
    backgroundColor: colors.honeyGold,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  aiTestButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 11,
  },
  productionActions: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  productionButton: {
    backgroundColor: colors.deepNavy,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productionButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});