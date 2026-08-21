// src/screens/main/RideCompletedScreen.js
/**
 * Updated to save trip data to local SQLite after each completion.
 * This feeds the FL training pipeline.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { clearActiveRide } from '@/features/driver/driverSlice';
import { saveTripLocally } from '../../services/database/tripStore';

export default function RideCompletedScreen({ navigation }) {
  const dispatch    = useDispatch();
  const { activeRide, passenger, todayStats } = useSelector((s) => s.driver);
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60 }),
    ]).start();

    // Save trip to local SQLite for FL training
    if (activeRide && !saved) {
      saveTripToLocalDB();
    }
  }, []);

  const saveTripToLocalDB = async () => {
    if (!activeRide) return;
    try {
      await saveTripLocally({
        id:              activeRide.id,
        serviceType:     activeRide.serviceType || 'ride',
        pickupLat:       activeRide.pickup?.latitude,
        pickupLng:       activeRide.pickup?.longitude,
        destLat:         activeRide.destination?.latitude,
        destLng:         activeRide.destination?.longitude,
        distanceKm:      parseFloat(activeRide.distance) || null,
        durationMinutes: parseInt(activeRide.duration)   || null,
        actualFare:      activeRide.estimatedTotal || activeRide.fare,
        surgeAtTime:     activeRide.surgeMultiplier || 1.0,
        completedAt:     new Date().toISOString(),
      });
      setSaved(true);
      console.log('[RideCompleted] Trip saved locally for FL training');
    } catch (e) {
      console.warn('[RideCompleted] Failed to save trip locally:', e.message);
    }
  };

  const earnings  = activeRide?.estimatedTotal
    ? (activeRide.estimatedTotal * 0.8).toFixed(2)
    : '0.00';

  const handleDone = () => {
    dispatch(clearActiveRide());
    navigation.navigate('Tabs');
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

          {/* Success icon */}
          <View style={styles.successCircle}>
            <LinearGradient colors={['#00D95F', '#00B84F']} style={styles.successGrad}>
              <Icon name="check" size={48} color="#FFF" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Trip Completed!</Text>
          <Text style={styles.subtitle}>Great job! Your earnings have been added.</Text>

          {/* Earnings card */}
          <LinearGradient colors={['#FF6B35', '#C44A1F']} style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>You earned</Text>
            <Text style={styles.earningsAmount}>${earnings}</Text>
            {activeRide?.surgeMultiplier > 1 && (
              <View style={styles.surgePill}>
                <Text style={styles.surgeText}>⚡ {activeRide.surgeMultiplier}x surge applied</Text>
              </View>
            )}
          </LinearGradient>

          {/* Trip summary */}
          <View style={styles.summaryCard}>
            {[
              { icon: 'map-marker-outline',    label: 'Pickup',      value: activeRide?.pickupAddress      || '—' },
              { icon: 'flag-checkered',        label: 'Destination', value: activeRide?.destinationAddress || '—' },
              { icon: 'map-marker-distance',   label: 'Distance',    value: activeRide?.distance           || '—' },
              { icon: 'clock-outline',         label: 'Duration',    value: activeRide?.duration           || '—' },
            ].map((item) => (
              <View key={item.label} style={styles.summaryRow}>
                <Icon name={item.icon} size={18} color="#FF6B35" />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Passenger info */}
          {passenger && (
            <View style={styles.passengerCard}>
              <View style={styles.passengerAvatar}>
                <Text style={styles.passengerAvatarText}>{passenger.name?.[0] || 'P'}</Text>
              </View>
              <View style={styles.passengerInfo}>
                <Text style={styles.passengerName}>{passenger.name}</Text>
                <Text style={styles.passengerRating}>⭐ {passenger.rating || '5.0'}</Text>
              </View>
            </View>
          )}

          {/* FL notice */}
          <View style={styles.flNotice}>
            <Icon name="shield-check-outline" size={16} color="#4A9EFF" />
            <Text style={styles.flNoticeText}>
              Trip data saved locally for private AI training
            </Text>
          </View>

          {/* Today stats */}
          <View style={styles.statsRow}>
            {[
              { label: "Today's Trips",    value: (todayStats?.trips || 0) },
              { label: "Today's Earnings", value: `$${(todayStats?.earnings || 0).toFixed(2)}` },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

        </Animated.View>
      </ScrollView>

      {/* Done button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.doneBtnGrad}>
            <Text style={styles.doneBtnText}>Back to Drive</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 120 },
  content:   { alignItems: 'center' },
  successCircle: { marginBottom: 20 },
  successGrad: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  title:    { color: '#FFF', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 15, marginBottom: 24, textAlign: 'center' },
  earningsCard: {
    width: '100%', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 20, gap: 8,
  },
  earningsLabel:  { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  earningsAmount: { color: '#FFF', fontSize: 52, fontWeight: '800' },
  surgePill: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  surgeText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  summaryCard: {
    width: '100%', backgroundColor: '#111', borderRadius: 16,
    padding: 16, gap: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryInfo:  { flex: 1 },
  summaryLabel: { color: '#666', fontSize: 11 },
  summaryValue: { color: '#FFF', fontSize: 14, fontWeight: '500', marginTop: 2 },
  passengerCard: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  passengerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center',
  },
  passengerAvatarText: { color: '#FFF', fontWeight: '800', fontSize: 20 },
  passengerInfo:  { flex: 1 },
  passengerName:  { color: '#FFF', fontSize: 15, fontWeight: '600' },
  passengerRating:{ color: '#888', fontSize: 13, marginTop: 2 },
  flNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4A9EFF15', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#4A9EFF30', marginBottom: 16, width: '100%',
  },
  flNoticeText: { color: '#4A9EFF', fontSize: 12, flex: 1 },
  statsRow: {
    flexDirection: 'row', gap: 16, width: '100%',
  },
  statItem: {
    flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 16,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#1E1E1E',
  },
  statValue: { color: '#FF6B35', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#666', fontSize: 11 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: '#0A0A0A',
  },
  doneBtn:     { borderRadius: 14, overflow: 'hidden' },
  doneBtnGrad: { height: 58, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
});
