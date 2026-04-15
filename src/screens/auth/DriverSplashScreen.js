// src/screens/auth/DriverSplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DriverSplashScreen({ navigation }) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 55 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start(() => setTimeout(() => navigation.replace('Login'), 1400));
  }, []);

  return (
    <LinearGradient colors={['#0A0A0A', '#150E0A', '#0A0A0A']} style={styles.container}>
      <Animated.View style={[styles.content, { transform: [{ scale }], opacity }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🚗</Text>
        </View>
        <Text style={styles.logoText}>Swift<Text style={styles.accent}>Drive</Text></Text>
        <View style={styles.driverBadge}>
          <Text style={styles.driverBadgeText}>DRIVER</Text>
        </View>
        <Text style={styles.tagline}>Drive. Earn. Thrive.</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#FF6B35',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 24, elevation: 24,
  },
  logoIcon: { fontSize: 40 },
  logoText: { fontSize: 38, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
  accent: { color: '#FF6B35' },
  driverBadge: { backgroundColor: '#FF6B3520', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#FF6B3560' },
  driverBadgeText: { color: '#FF6B35', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  tagline: { color: '#666', fontSize: 14, letterSpacing: 0.5 },
});
