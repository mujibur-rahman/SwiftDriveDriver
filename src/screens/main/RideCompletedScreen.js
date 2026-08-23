// src/screens/main/RideCompletedScreen.js
/**
 * Updated to save trip data to local SQLite after each completion.
 * This feeds the FL training pipeline.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text,
  Animated, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // kept for success circle + earnings card accent
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { clearActiveRide } from '@/features/driver/driverSlice';
import { saveTripLocally } from '@/services/database/tripStore';
import { useTheme } from '@/theme';
import Button from '@/components/ui/Button';

export default function RideCompletedScreen({ navigation }) {
  const dispatch = useDispatch();
  const { activeRide, passenger, todayStats } = useSelector((s) => s.driver);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [saved, setSaved] = useState(false);

  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
  const info = isDark ? '#60A5FA' : '#2563EB';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
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
        id: activeRide.id,
        serviceType: activeRide.serviceType || 'ride',
        pickupLat: activeRide.pickup?.latitude,
        pickupLng: activeRide.pickup?.longitude,
        destLat: activeRide.destination?.latitude,
        destLng: activeRide.destination?.longitude,
        distanceKm: parseFloat(activeRide.distance) || null,
        durationMinutes: parseInt(activeRide.duration) || null,
        actualFare: activeRide.estimatedTotal || activeRide.fare,
        surgeAtTime: activeRide.surgeMultiplier || 1.0,
        completedAt: new Date().toISOString(),
      });
      setSaved(true);
      console.log('[RideCompleted] Trip saved locally for FL training');
    } catch (e) {
      console.warn('[RideCompleted] Failed to save trip locally:', e.message);
    }
  };

  const earnings = activeRide?.estimatedTotal
    ? (activeRide.estimatedTotal * 0.8).toFixed(2)
    : '0.00';

  const handleDone = () => {
    dispatch(clearActiveRide());
    navigation.navigate('Tabs');
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow items-center px-6 pb-32 pt-16">
        <Animated.View
          className="w-full items-center"
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          {/* Success icon */}
          <View className="mb-5">
            <LinearGradient
              colors={['#00D95F', '#00B84F']}
              style={{ width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}
            >
              <Icon name="check" size={48} color="#FFF" />
            </LinearGradient>
          </View>

          <Text className="mb-2 text-[28px] font-inter-extrabold text-foreground">Trip Completed!</Text>
          <Text className="mb-6 text-center text-[15px] font-inter text-foreground-muted">
            Great job! Your earnings have been added.
          </Text>

          {/* Earnings card */}
          <LinearGradient
            colors={['#FF6B35', '#C44A1F']}
            style={{ borderRadius: 20 }}
            className="mb-5 w-full items-center gap-2 p-6"
          >
            <Text className="text-[14px] font-inter text-white/70">You earned</Text>
            <Text className="text-[52px] font-inter-extrabold text-white">${earnings}</Text>
            {activeRide?.surgeMultiplier > 1 && (
              <View className="rounded-full bg-white/20 px-3.5 py-1">
                <Text className="text-[13px] font-inter-semibold text-white">
                  ⚡ {activeRide.surgeMultiplier}x surge applied
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Trip summary */}
          <View className="mb-4 w-full gap-3.5 rounded-2xl border border-border bg-card p-4">
            {[
              { icon: 'map-marker-outline', label: 'Pickup', value: activeRide?.pickupAddress || '—' },
              { icon: 'flag-checkered', label: 'Destination', value: activeRide?.destinationAddress || '—' },
              { icon: 'map-marker-distance', label: 'Distance', value: activeRide?.distance || '—' },
              { icon: 'clock-outline', label: 'Duration', value: activeRide?.duration || '—' },
            ].map((item) => (
              <View key={item.label} className="flex-row items-center gap-3">
                <Icon name={item.icon} size={18} color={primary} />
                <View className="flex-1">
                  <Text className="text-[11px] font-inter text-foreground-muted">{item.label}</Text>
                  <Text className="mt-0.5 text-[14px] font-inter-medium text-foreground" numberOfLines={1}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Passenger info */}
          {passenger && (
            <View className="mb-4 w-full flex-row items-center gap-3.5 rounded-2xl border border-border bg-card p-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Text className="text-xl font-inter-extrabold text-primary-foreground">
                  {passenger.name?.[0] || 'P'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-inter-semibold text-foreground">{passenger.name}</Text>
                <Text className="mt-0.5 text-[13px] font-inter text-foreground-muted">
                  ⭐ {passenger.rating || '5.0'}
                </Text>
              </View>
            </View>
          )}

          {/* FL notice */}
          <View className="mb-4 w-full flex-row items-center gap-2 rounded-xl border border-info/30 bg-info/10 p-2.5">
            <Icon name="shield-check-outline" size={16} color={info} />
            <Text className="flex-1 text-[12px] font-inter" style={{ color: info }}>
              Trip data saved locally for private AI training
            </Text>
          </View>

          {/* Today stats */}
          <View className="w-full flex-row gap-4">
            {[
              { label: "Today's Trips", value: (todayStats?.trips || 0) },
              { label: "Today's Earnings", value: `$${(todayStats?.earnings || 0).toFixed(2)}` },
            ].map((s) => (
              <View key={s.label} className="flex-1 items-center gap-1 rounded-2xl border border-border bg-card p-4">
                <Text className="text-[22px] font-inter-extrabold" style={{ color: primary }}>{s.value}</Text>
                <Text className="text-[11px] font-inter text-foreground-muted">{s.label}</Text>
              </View>
            ))}
          </View>

        </Animated.View>
      </ScrollView>

      {/* Done button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-5 pb-8 pt-4">
        <Button variant="primary" size="lg" onPress={handleDone}>
          Back to Drive
        </Button>
      </View>
    </View>
  );
}
