import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';

// Brand colors inspired by bee logo
const colors = {
  beeYellow: '#F4C430',      // Dark golden yellow
  honeyGold: '#D4AF37',      // Rich gold
  darkYellow: '#B8860B',     // Dark goldenrod
  deepNavy: '#1A1B3E',       // Deep navy blue
  charcoal: '#2C2C2C',       // Dark charcoal
  cream: '#FFF9E6',          // Warm cream
  white: '#FFFFFF',          // Pure white
  warmGray: '#6B6B6B',       // Warm gray
  lightGray: '#F5F5F5',      // Light gray
};

// Simple HomeScreen component built into App.tsx to avoid import issues
function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor={colors.warmGray}
        />
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>🐝 Welcome to NibJobs</Text>
        <Text style={styles.subtitle}>Find your dream job today!</Text>
        
        <View style={styles.jobCard}>
          <Text style={styles.jobTitle}>Frontend Developer</Text>
          <Text style={styles.company}>BeeTech Solutions</Text>
          <Text style={styles.location}>📍 San Francisco, CA</Text>
          <Text style={styles.salary}>$80,000 - $120,000</Text>
        </View>
        
        <View style={styles.jobCard}>
          <Text style={styles.jobTitle}>Product Manager</Text>
          <Text style={styles.company}>HoneyWork Corp</Text>
          <Text style={styles.location}>📍 New York, NY</Text>
          <Text style={styles.salary}>$90,000 - $130,000</Text>
        </View>
        
        <View style={styles.jobCard}>
          <Text style={styles.jobTitle}>UX Designer</Text>
          <Text style={styles.company}>Golden Hive Studios</Text>
          <Text style={styles.location}>📍 Austin, TX</Text>
          <Text style={styles.salary}>$70,000 - $100,000</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Create navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.beeYellow,
          },
          headerTintColor: colors.deepNavy,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: '🐝 NibJobs',
            headerStyle: {
              backgroundColor: colors.beeYellow,
            },
            headerTintColor: colors.deepNavy,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 24,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.beeYellow,
    marginRight: 10,
  },
  loginButton: {
    backgroundColor: colors.deepNavy,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  loginText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.deepNavy,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.warmGray,
    textAlign: 'center',
    marginBottom: 30,
  },
  jobCard: {
    backgroundColor: colors.cream,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.beeYellow,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.deepNavy,
    marginBottom: 5,
  },
  company: {
    fontSize: 16,
    color: colors.beeYellow,
    fontWeight: '600',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: colors.warmGray,
    marginBottom: 5,
  },
  salary: {
    fontSize: 14,
    color: colors.deepNavy,
    fontWeight: 'bold',
  },
});