import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../config/firebase';

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

interface FormData {
  username: string;
  name: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  scrapingEnabled: boolean;
}

interface TelegramChannelFormModalProps {
  visible: boolean;
  onClose: () => void;
  onChannelAdded: () => void;
}

export default function TelegramChannelFormModal({ 
  visible, 
  onClose, 
  onChannelAdded 
}: TelegramChannelFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    name: '',
    imageUrl: '',
    category: 'general',
    isActive: true,
    scrapingEnabled: true
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<View>(null);

  const resetForm = () => {
    setFormData({
      username: '',
      name: '',
      imageUrl: '',
      category: 'general',
      isActive: true,
      scrapingEnabled: true
    });
    setSelectedImage(null);
    setSelectedFile(null);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageFile = (file: File) => {
    console.log('🖼️ Image file selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Alert.alert('Error', 'Image size should be less than 5MB');
      return false;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Alert.alert('Error', 'Please select a valid image file');
      return false;
    }
    
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    console.log('✅ Image file processed successfully, preview URL:', imageUrl);
    return true;
  };

  const pickImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageFile(file);
      }
    };
    input.click();
  };

  // Setup drag and drop for web
  useEffect(() => {
    if (Platform.OS === 'web' && dropZoneRef.current) {
      const dropZone = (dropZoneRef.current as any)._component || dropZoneRef.current;
      
      const handleWebDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      };

      const handleWebDragEnter = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      };

      const handleWebDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        if (target && !target.contains(e.relatedTarget as Node)) {
          setIsDragging(false);
        }
      };

      const handleWebDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = Array.from(e.dataTransfer?.files || []);
        if (files.length > 0) {
          handleImageFile(files[0]);
        }
      };

      if (dropZone && dropZone.addEventListener) {
        dropZone.addEventListener('dragover', handleWebDragOver);
        dropZone.addEventListener('dragenter', handleWebDragEnter);
        dropZone.addEventListener('dragleave', handleWebDragLeave);
        dropZone.addEventListener('drop', handleWebDrop);

        return () => {
          dropZone.removeEventListener('dragover', handleWebDragOver);
          dropZone.removeEventListener('dragenter', handleWebDragEnter);
          dropZone.removeEventListener('dragleave', handleWebDragLeave);
          dropZone.removeEventListener('drop', handleWebDrop);
        };
      }
    }
  }, [visible]);

  const uploadImage = async (channelUsername: string, file: File): Promise<string> => {
    try {
      console.log('🔄 Starting image upload...', {
        channelUsername,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Check authentication status
      const auth = getAuth();
      const user = auth.currentUser;
      console.log('👤 Current user:', user ? user.uid : 'Not authenticated');

      if (!user) {
        throw new Error('User must be authenticated to upload images');
      }

      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${channelUsername}-${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `channel-images/${fileName}`);
      
      console.log('📁 Storage reference created:', storageRef.fullPath);
      
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('✅ Upload completed:', uploadResult);
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('🔗 Download URL obtained:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload image: ${errorMessage}`);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.username.trim() || !formData.name.trim()) {
      Alert.alert('Error', 'Please fill in username and name');
      return;
    }

    // Clean username (remove @ if present)
    const cleanUsername = formData.username.replace('@', '').trim();
    if (cleanUsername.length === 0) {
      Alert.alert('Error', 'Please enter a valid username');
      return;
    }

    setLoading(true);

    try {
      // Check if channel already exists
      // TODO: Add duplicate check here

      // Upload image if selected
      let imageUrl = formData.imageUrl;
      if (selectedFile) {
        console.log('🖼️ Image selected, starting upload...', {
          fileName: selectedFile.name,
          fileSize: selectedFile.size
        });
        
        setUploading(true);
        try {
          imageUrl = await uploadImage(cleanUsername, selectedFile);
          console.log('✅ Image uploaded successfully:', imageUrl);
        } catch (error) {
          console.error('❌ Error uploading image:', error);
          Alert.alert('Warning', 'Channel will be added but image upload failed');
        }
        setUploading(false);
      } else {
        console.log('📷 No image selected for upload');
      }

      console.log('💾 Creating channel document with imageUrl:', imageUrl);

      // Create channel document
      const newChannel = {
        username: cleanUsername,
        name: formData.name.trim(),
        imageUrl: imageUrl || null,
        category: formData.category,
        isActive: formData.isActive,
        scrapingEnabled: formData.scrapingEnabled,
        totalJobsScraped: 0,
        lastScraped: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 Channel data to be saved:', newChannel);

      // Add to Firestore
      const channelsCollection = collection(db, 'telegramChannels');
      const docRef = await addDoc(channelsCollection, newChannel);

      console.log('✅ Channel saved with ID:', docRef.id);
      Alert.alert('Success', 'Telegram channel added successfully!');
      onChannelAdded();
      handleClose();

    } catch (error) {
      console.error('Error adding channel:', error);
      Alert.alert('Error', 'Failed to add channel. Please try again.');
    }

    setLoading(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Telegram Channel</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                placeholder="e.g., jobtelegram"
                placeholderTextColor={colors.warmGray}
                autoCapitalize="none"
              />
              <Text style={styles.helpText}>Enter without @ symbol</Text>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Channel Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Job Telegram Channel"
                placeholderTextColor={colors.warmGray}
              />
            </View>

            {/* Category Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="e.g., technology, marketing, general"
                placeholderTextColor={colors.warmGray}
              />
            </View>

            {/* Image Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Channel Image (Optional)</Text>
              <View 
                ref={dropZoneRef}
                style={[
                  styles.imagePickerButton,
                  isDragging && styles.imagePickerButtonDragging
                ]} 
              >
                <TouchableOpacity 
                  style={styles.imagePickerContent}
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  {selectedImage ? (
                    <View style={styles.selectedImageContainer}>
                      <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                      <Text style={styles.changeImageText}>
                        {isDragging ? 'Drop image here!' : 'Tap to change or drag & drop new image'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.imagePickerContent}>
                      <Text style={styles.imagePickerIcon}>
                        {isDragging ? '📤' : '📷'}
                      </Text>
                      <Text style={[
                        styles.imagePickerText,
                        isDragging && styles.imagePickerTextDragging
                      ]}>
                        {isDragging ? 'Drop image here!' : 'Tap to select or drag & drop image'}
                      </Text>
                      <Text style={styles.imagePickerHint}>
                        Supports: JPG, PNG, GIF • Max size: 5MB
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              {uploading && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color={colors.beeYellow} />
                  <Text style={styles.uploadingText}>Uploading image...</Text>
                </View>
              )}
            </View>

            {/* Active Status */}
            <View style={styles.switchGroup}>
              <Text style={styles.label}>Active Status</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Channel Active</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                  trackColor={{ false: colors.lightGray, true: colors.success }}
                  thumbColor={formData.isActive ? colors.white : colors.warmGray}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Scraping Enabled</Text>
                <Switch
                  value={formData.scrapingEnabled}
                  onValueChange={(value) => setFormData({ ...formData, scrapingEnabled: value })}
                  trackColor={{ false: colors.lightGray, true: colors.beeYellow }}
                  thumbColor={formData.scrapingEnabled ? colors.white : colors.warmGray}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Add Channel</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 0,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.deepNavy,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.warmGray,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.deepNavy,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
  helpText: {
    fontSize: 12,
    color: colors.warmGray,
    marginTop: 4,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
    transition: 'all 0.2s ease-in-out',
  },
  imagePickerButtonDragging: {
    borderColor: colors.beeYellow,
    backgroundColor: '#FFF9E6',
    transform: 'scale(1.02)',
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 14,
    color: colors.warmGray,
    marginBottom: 4,
  },
  imagePickerTextDragging: {
    color: colors.beeYellow,
    fontWeight: '600',
  },
  imagePickerHint: {
    fontSize: 11,
    color: colors.warmGray,
    opacity: 0.7,
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  changeImageText: {
    fontSize: 12,
    color: colors.beeYellow,
    fontWeight: '500',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadingText: {
    fontSize: 12,
    color: colors.warmGray,
    marginLeft: 8,
  },
  switchGroup: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.charcoal,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warmGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.warmGray,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.beeYellow,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  submitButtonText: {
    fontSize: 16,
    color: colors.deepNavy,
    fontWeight: '600',
  },
});