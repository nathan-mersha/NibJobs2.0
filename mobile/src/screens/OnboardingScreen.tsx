import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NibJobsIcon } from '../assets';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleContinueAsGuest = () => {
    // Navigate to main app
    navigation.navigate('MainTabs');
  };

  const handleSignUp = () => {
    navigation.navigate('Auth', { redirectTo: 'CategorySelection' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image source={NibJobsIcon} style={styles.logoImage} />
          </View>
          <Text style={styles.appName}>NibJobs</Text>
        </View>

        {/* Welcome Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Find Your Next Opportunity</Text>
          <Text style={styles.subtitle}>
            Discover the latest job openings automatically aggregated from Telegram channels with AI-powered insights.
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Icon name="smart-toy" size={24} color="#F4C430" />
              </View>
              <Text style={styles.featureText}>AI-powered job extraction</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Icon name="notifications" size={24} color="#F4C430" />
              </View>
              <Text style={styles.featureText}>Smart push notifications</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Icon name="language" size={24} color="#F4C430" />
              </View>
              <Text style={styles.featureText}>Global job opportunities</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Icon name="flash-on" size={24} color="#F4C430" />
              </View>
              <Text style={styles.featureText}>Real-time job updates</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueAsGuest}
          >
            <Text style={styles.primaryButtonText}>Continue as Guest</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSignUp}
          >
            <Text style={styles.secondaryButtonText}>Sign Up for Notifications</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Sign up to receive personalized job notifications and never miss an opportunity
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: '#007AFF',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  features: {
    alignSelf: 'stretch',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  actions: {
    alignSelf: 'stretch',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  disclaimer: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OnboardingScreen;