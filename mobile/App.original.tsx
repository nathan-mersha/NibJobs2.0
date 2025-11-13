import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';

// Brand colors inspired by bee logo
const colors = {
  beeYellow: '#F4C430',      // Dark golden yellow
  honeyGold: '#D4AF37',      // Rich gold
  darkYellow: '#B8860B',     // Dark goldenrod
  deepNavy: '#1A1B3E',       // Deep navy blue
  charcoal: '#2C2C2C',       // Dark charcoal
  cream: '#FFF9E6',          // Warm cream
  white: '#FFFFFF',          // Pure white
};

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
          headerBackTitleVisible: false,
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