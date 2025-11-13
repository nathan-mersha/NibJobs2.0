import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐝 NibJobs Test</Text>
      <Text style={styles.subtitle}>Simple version to test compilation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4C430',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1B3E',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#1A1B3E',
    textAlign: 'center',
  },
});