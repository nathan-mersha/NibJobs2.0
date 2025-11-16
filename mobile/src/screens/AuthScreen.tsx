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
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from 'react-native-vector-icons/MaterialIcons';

type AuthRouteProp = RouteProp<RootStackParamList, 'Auth'>;

const AuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AuthRouteProp>();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resendVerificationEmail, loading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        Alert.alert(
          'Verification Email Sent! 📧',
          'We\'ve sent a verification link to your email. Please check your inbox (and spam folder) and click the link to verify your account before signing in.',
          [{ text: 'OK', onPress: () => setIsSignUp(false) }]
        );
        return;
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
      const errorMessage = error.message || 'An error occurred';
      
      // Check if it's an email verification error
      if (errorMessage.includes('verify your email')) {
        Alert.alert(
          'Email Not Verified',
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Resend Email',
              onPress: async () => {
                try {
                  await resendVerificationEmail();
                  Alert.alert('Success', 'Verification email has been resent. Please check your inbox.');
                } catch (resendError: any) {
                  Alert.alert('Error', resendError.message || 'Failed to resend verification email');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Authentication Error', errorMessage);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      
      // Navigate to redirect destination or back
      if (redirectTo) {
        navigation.navigate(redirectTo as any);
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.message || 'An error occurred');
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

            {/* Password input with visibility toggle */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? 'visibility' : 'visibility-off'} 
                    size={24} 
                    color="#6B6B6B" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon 
                      name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                      size={24} 
                      color="#6B6B6B" 
                    />
                  </TouchableOpacity>
                </View>
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

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <View style={styles.googleIconContainer}>
                <Image 
                  source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                  style={styles.googleIcon}
                />
              </View>
              <Text style={styles.googleButtonText}>
                Continue with Google
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
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 8,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
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