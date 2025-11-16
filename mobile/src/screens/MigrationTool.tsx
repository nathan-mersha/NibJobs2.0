import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../App'; // Import from your main App file

/**
 * Migration Tool Component
 * Add this to your app temporarily and access it from a hidden route
 * Navigate to: /migration
 */

export default function MigrationTool() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const migrateJobStatistics = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Starting job statistics migration...');

    try {
      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);
      addLog(`Found ${snapshot.size} jobs to update`);

      let updatedCount = 0;
      const updates = [];

      for (const jobDoc of snapshot.docs) {
        const jobData = jobDoc.data();
        
        // Generate realistic statistics
        const baseViews = Math.floor(Math.random() * 500) + 100;
        const recentApplicants = Math.floor(Math.random() * 15) + 1;
        const totalApplicants = Math.floor(Math.random() * 80) + recentApplicants + 10;
        const viewsLast24h = Math.floor(Math.random() * 150) + 30;

        const updateData = {
          recentApplicants,
          totalApplicants,
          viewsLast24h,
          applicants: jobData.applicants || totalApplicants,
          views: jobData.views || baseViews,
          statisticsUpdatedAt: new Date(),
        };

        const jobRef = doc(db, 'jobs', jobDoc.id);
        updates.push(updateDoc(jobRef, updateData));
        updatedCount++;
        
        addLog(`✓ Queued: ${jobData.title || jobDoc.id}`);
      }

      await Promise.all(updates);
      addLog(`✅ Successfully updated ${updatedCount} jobs!`);
      Alert.alert('Success', `Updated ${updatedCount} jobs with statistics`);

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const addSampleMatchScoreToCurrentJob = async () => {
    if (isRunning || !auth.currentUser) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    addLog('🎯 Adding sample match score calculation...');

    try {
      // Get a sample job
      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);
      
      if (snapshot.empty) {
        addLog('No jobs found');
        return;
      }

      const firstJob = snapshot.docs[0];
      addLog(`Testing with job: ${firstJob.data().title}`);
      
      // Sample match score (in real implementation, this would be calculated)
      const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      addLog(`✓ Match score would be: ${matchScore}%`);
      addLog('ℹ️  Match scores are calculated client-side, not stored in Firestore');
      addLog('ℹ️  They are based on user profile vs job requirements');

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const checkCurrentUserProfile = async () => {
    if (!auth.currentUser) {
      Alert.alert('Info', 'No user logged in');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    addLog('👤 Checking user profile...');

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const profile = userDoc.data();
        addLog('✓ User profile found');
        addLog(`Skills: ${profile.skills?.join(', ') || 'Not set'}`);
        addLog(`Experience: ${profile.experience || 'Not set'} years`);
        addLog(`Education: ${profile.education || 'Not set'}`);
      } else {
        addLog('⚠️  No profile found. Create one in Firestore:');
        addLog(`Collection: users, Doc ID: ${auth.currentUser.uid}`);
        addLog('Add fields: skills, experience, education, preferredCategories, preferredLocations');
      }

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Migration Tool</Text>
      <Text style={styles.subtitle}>Run database migrations and setup tasks</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={migrateJobStatistics}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running...' : 'Migrate Job Statistics'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary, isRunning && styles.buttonDisabled]}
          onPress={checkCurrentUserProfile}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Check User Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary, isRunning && styles.buttonDisabled]}
          onPress={addSampleMatchScoreToCurrentJob}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Test Match Score</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles.emptyText}>No logs yet. Click a button to start.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#F4C430',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#1a365d',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#1a365d',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  logsScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#333',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
});
