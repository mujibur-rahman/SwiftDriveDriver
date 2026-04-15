// src/screens/main/RideCompletedScreen.js  (Driver)
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { resetActiveRide } from '../../store/slices/driverSlice';

export default function RideCompletedScreen({ navigation }) {
  const dispatch = useDispatch();
  const { activeRide, todayStats } = useSelector((s) => s.driver);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const fare = activeRide?.fare || 12.50;
  const driverEarnings = fare * 0.8;

  return (
    <LinearGradient colors={['#0A0A0A', '#150E0A', '#0A0A0A']} style={styles.container}>
      <Animated.View style={[styles.check, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Ride Complete! 🎉</Text>
        <Text style={styles.subtitle}>Great job! Keep it up.</Text>

        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Your Earnings</Text>
          <Text style={styles.earningsAmount}>${driverEarnings.toFixed(2)}</Text>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsBreakdown}>
            <View style={styles.earningsRow}><Text style={styles.earningsItemLabel}>Fare</Text><Text style={styles.earningsItemValue}>${fare.toFixed(2)}</Text></View>
            <View style={styles.earningsRow}><Text style={styles.earningsItemLabel}>Platform fee (20%)</Text><Text style={styles.earningsItemValue}>-${(fare * 0.2).toFixed(2)}</Text></View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Today's Trips", value: todayStats.trips },
            { label: "Today's Earnings", value: `$${todayStats.earnings.toFixed(2)}` },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={() => { dispatch(resetActiveRide()); navigation.replace('Tabs'); }}>
          <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.continueBtnGrad}>
            <Text style={styles.continueBtnText}>Continue Driving</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  check: { marginBottom: 24 },
  checkCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  checkIcon: { color: '#FFF', fontSize: 44, fontWeight: '800' },
  content: { width: '100%', alignItems: 'center', gap: 16 },
  title: { fontSize: 30, fontWeight: '800', color: '#FFF' },
  subtitle: { color: '#888', fontSize: 16 },
  earningsCard: { width: '100%', backgroundColor: '#111', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#222' },
  earningsLabel: { color: '#888', fontSize: 13, marginBottom: 4 },
  earningsAmount: { color: '#FF6B35', fontSize: 40, fontWeight: '800' },
  earningsDivider: { height: 1, backgroundColor: '#1E1E1E', marginVertical: 12 },
  earningsBreakdown: { gap: 8 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  earningsItemLabel: { color: '#666', fontSize: 13 },
  earningsItemValue: { color: '#AAA', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  statCard: { flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#1E1E1E' },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  statLabel: { color: '#555', fontSize: 11 },
  continueBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  continueBtnGrad: { height: 56, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
});
