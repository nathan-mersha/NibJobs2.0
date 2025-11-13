import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile, isGuest, signOut } = useAuth();
  const { fcmToken, hasPermission } = useNotification();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
  };

  const handleCategoryPreferences = () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to manage notification preferences.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => navigation.navigate('Auth', { redirectTo: 'CategorySelection' })
          }
        ]
      );
    } else {
      navigation.navigate('CategorySelection');
    }
  };

  const handleSignIn = () => {
    navigation.navigate('Auth', {});
  };

  const renderGuestView = () => (
    <View style={styles.guestContainer}>
      <View style={styles.guestIcon}>
        <Text style={styles.guestIconText}>👤</Text>
      </View>
      <Text style={styles.guestTitle}>You're browsing as a guest</Text>
      <Text style={styles.guestSubtitle}>
        Sign in to get personalized job notifications and save your preferences
      </Text>
      
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.guestFeatures}>
        <Text style={styles.guestFeaturesTitle}>What you'll get:</Text>
        <View style={styles.guestFeature}>
          <Text style={styles.guestFeatureIcon}>🔔</Text>
          <Text style={styles.guestFeatureText}>Push notifications for new jobs</Text>
        </View>
        <View style={styles.guestFeature}>
          <Text style={styles.guestFeatureIcon}>🎯</Text>
          <Text style={styles.guestFeatureText}>Personalized job categories</Text>
        </View>
        <View style={styles.guestFeature}>
          <Text style={styles.guestFeatureIcon}>💾</Text>
          <Text style={styles.guestFeatureText}>Save favorite jobs (coming soon)</Text>
        </View>
      </View>
    </View>
  );

  const renderAuthenticatedView = () => (
    <>
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {(user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.email || 'User'}
            </Text>
            <Text style={styles.userStatus}>
              {user?.isAnonymous ? 'Anonymous User' : 'Registered User'}
            </Text>
          </View>
        </View>
      </View>

      {/* Notification Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[
              styles.statusValue,
              userProfile?.isNotificationsEnabled ? styles.statusEnabled : styles.statusDisabled
            ]}>
              {userProfile?.isNotificationsEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Categories</Text>
            <Text style={styles.statusValue}>
              {userProfile?.selectedCategories?.length || 0} selected
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Permission</Text>
            <Text style={[
              styles.statusValue,
              hasPermission ? styles.statusEnabled : styles.statusDisabled
            ]}>
              {hasPermission ? 'Granted' : 'Not Granted'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.preferencesButton}
          onPress={handleCategoryPreferences}
        >
          <Text style={styles.preferencesButtonText}>
            Manage Notification Preferences
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleCategoryPreferences}>
          <Text style={styles.settingLabel}>🔔 Notification Categories</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        {/* Future settings can be added here */}
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, styles.settingDisabled]}>💾 Saved Jobs (Coming Soon)</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, styles.settingDisabled]}>📊 Job Statistics (Coming Soon)</Text>
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {isGuest ? renderGuestView() : renderAuthenticatedView()}

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoTitle}>About NibJobs</Text>
          <Text style={styles.appInfoText}>
            Version 1.0.0 • Made with ❤️ for job seekers
          </Text>
          <Text style={styles.appInfoDescription}>
            Automatically discover job opportunities from Telegram channels with AI-powered extraction.
          </Text>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  
  // Guest View Styles
  guestContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  guestIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestIconText: {
    fontSize: 32,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 24,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  guestFeatures: {
    alignSelf: 'stretch',
  },
  guestFeaturesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  guestFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guestFeatureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  guestFeatureText: {
    fontSize: 16,
    color: '#4b5563',
  },

  // Authenticated View Styles
  userSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  
  statusCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  statusEnabled: {
    color: '#059669',
  },
  statusDisabled: {
    color: '#dc2626',
  },
  
  preferencesButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  preferencesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  settingDisabled: {
    color: '#9ca3af',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  
  signOutButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  
  appInfoSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 20,
    padding: 20,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  appInfoDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
});

export default ProfileScreen;