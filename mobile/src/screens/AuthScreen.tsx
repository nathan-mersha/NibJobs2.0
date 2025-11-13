import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';
import LoadingSpinner from '../components/LoadingSpinner';

type AuthRouteProp = RouteProp<RootStackParamList, 'Auth'>;

const AuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AuthRouteProp>();
  const { signInWithEmail, signUpWithEmail, loading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const redirectTo = route.params?.redirectTo;

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }

      // Navigate to redirect destination or back
      if (redirectTo) {
        navigation.navigate(redirectTo as any);
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'An error occurred');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setConfirmPassword('');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Get personalized job notifications' 
                : 'Welcome back to NibJobs'
              }
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.authButtonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isSignUp 
                  ? 'Already have an account? ' 
                  : "Don't have an account? "
                }
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.switchLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Benefits for Sign Up */}
          {isSignUp && (
            <View style={styles.benefits}>
              <Text style={styles.benefitsTitle}>Why sign up?</Text>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🔔</Text>
                <Text style={styles.benefitText}>Get instant notifications for new jobs in your preferred categories</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🎯</Text>
                <Text style={styles.benefitText}>Personalized job recommendations</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>💾</Text>
                <Text style={styles.benefitText}>Save your favorite jobs (coming soon)</Text>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 16,
    color: '#6b7280',
  },
  switchLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  benefits: {
    flex: 1,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    flex: 1,
  },
});

export default AuthScreen;