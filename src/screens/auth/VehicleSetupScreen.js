// src/screens/auth/VehicleSetupScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function VehicleSetupScreen({ navigation }) {
  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📄</Text>
        <Text style={styles.title}>Upload Documents</Text>
        <Text style={styles.subtitle}>Upload your insurance and registration documents to complete setup.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('Main')}>
          <Text style={styles.btnText}>Skip for now →</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { alignItems: 'center', gap: 16 },
  emoji: { fontSize: 64 },
  title: { color: '#FFF', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#666', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  btn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 12 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
