import React, { useState, useEffect } from 'react';
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
import { JOB_CATEGORIES } from '@nibjobs/shared';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const CategorySelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile, updateUserProfile, isGuest } = useAuth();
  const { requestPermission, hasPermission } = useNotification();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setSelectedCategories(userProfile.selectedCategories || []);
      setNotificationsEnabled(userProfile.isNotificationsEnabled || false);
    }
  }, [userProfile]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const selectAllCategories = () => {
    setSelectedCategories([...JOB_CATEGORIES]);
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Request permission when enabling notifications
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive job alerts.'
        );
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const savePreferences = async () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to save notification preferences.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => navigation.navigate('Auth', { redirectTo: 'CategorySelection' })
          }
        ]
      );
      return;
    }

    if (notificationsEnabled && selectedCategories.length === 0) {
      Alert.alert(
        'No Categories Selected',
        'Please select at least one category to receive notifications.'
      );
      return;
    }

    try {
      setSaving(true);
      
      await updateUserProfile({
        selectedCategories,
        isNotificationsEnabled: notificationsEnabled,
      });

      Alert.alert(
        'Preferences Saved',
        notificationsEnabled 
          ? `You'll receive notifications for ${selectedCategories.length} categories`
          : 'Notifications have been disabled',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (category: string) => {
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notification Preferences</Text>
          <Text style={styles.subtitle}>
            Choose which job categories you'd like to receive notifications for
          </Text>
        </View>

        {/* Notification Toggle */}
        <View style={styles.section}>
          <View style={styles.notificationToggle}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Enable Notifications</Text>
              <Text style={styles.toggleDescription}>
                Get notified when new jobs match your selected categories
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                notificationsEnabled && styles.toggleActive
              ]}
              onPress={toggleNotifications}
            >
              <View style={[
                styles.toggleHandle,
                notificationsEnabled && styles.toggleHandleActive
              ]} />
            </TouchableOpacity>
          </View>

          {!hasPermission && notificationsEnabled && (
            <View style={styles.permissionWarning}>
              <Text style={styles.permissionWarningText}>
                ⚠️ Notification permission not granted. Please check your device settings.
              </Text>
            </View>
          )}
        </View>

        {/* Category Selection */}
        {notificationsEnabled && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Job Categories</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity onPress={selectAllCategories}>
                  <Text style={styles.actionText}>Select All</Text>
                </TouchableOpacity>
                <Text style={styles.actionSeparator}>•</Text>
                <TouchableOpacity onPress={clearAllCategories}>
                  <Text style={styles.actionText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.selectionCount}>
              {selectedCategories.length} of {JOB_CATEGORIES.length} categories selected
            </Text>

            <View style={styles.categoriesGrid}>
              {JOB_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryItem,
                      isSelected && {
                        backgroundColor: getCategoryColor(category),
                        borderColor: getCategoryColor(category),
                      }
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🕒</Text>
            <Text style={styles.infoText}>We check for new jobs daily at midnight UTC</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🎯</Text>
            <Text style={styles.infoText}>You'll only get notifications for jobs in your selected categories</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔇</Text>
            <Text style={styles.infoText}>You can disable notifications anytime from your profile</Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled
          ]}
          onPress={savePreferences}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Preferences'}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 20,
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  toggle: {
    width: 56,
    height: 32,
    backgroundColor: '#d1d5db',
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#22c55e',
  },
  toggleHandle: {
    width: 28,
    height: 28,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleHandleActive: {
    transform: [{ translateX: 24 }],
  },
  permissionWarning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  permissionWarningText: {
    fontSize: 14,
    color: '#92400e',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  actionSeparator: {
    marginHorizontal: 8,
    color: '#d1d5db',
  },
  selectionCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    flex: 1,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CategorySelectionScreen;