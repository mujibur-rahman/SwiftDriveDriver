// src/screens/main/IncomingRideModal.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { acceptRide, rejectRide } from '../../store/slices/driverSlice';

const COUNTDOWN_SECONDS = 20;

export default function IncomingRideModal({ navigation }) {
  const dispatch = useDispatch();
  const { incomingRide } = useSelector((s) => s.driver);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  // Get id safely — check multiple field names
  const rideId = incomingRide?.id 
            || incomingRide?.rideId 
            || incomingRide?.orderId; 

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    Animated.timing(progressAnim, { toValue: 0, duration: COUNTDOWN_SECONDS * 1000, useNativeDriver: false }).start();
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleTimeout = async () => {
    console.log('[Timeout] ride id:', incomingRide?.id); 
    await dispatch(rejectRide(incomingRide?.id));  // ← await
    navigation.goBack();
  };

  const handleAccept = async () => {
    console.log('[Modal] Accepting ride id:', rideId);  
    clearInterval(timerRef.current);
    Vibration.cancel();
    const result = await dispatch(acceptRide(rideId));
    if (!result.error) navigation.replace('ActiveRide');
    else navigation.goBack();
  };

  const handleReject = async () => {  
    console.log('[Modal] Rejecting ride id:', rideId);
    clearInterval(timerRef.current);
    Vibration.cancel();
    await dispatch(rejectRide(rideId));
    navigation.goBack();
  };

  if (!incomingRide) return null;

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const urgentColor = countdown <= 7 ? '#FF4444' : '#FF6B35';

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <View style={styles.countdownBar}>
          <Animated.View style={[styles.countdownFill, { width: progressWidth, backgroundColor: urgentColor }]} />
        </View>
        <View style={styles.header}>
          <Text style={styles.newRideLabel}>New Ride Request</Text>
          <View style={[styles.countdownBadge, { borderColor: urgentColor }]}>
            <Text style={[styles.countdownText, { color: urgentColor }]}>{countdown}s</Text>
          </View>
        </View>
        <View style={styles.rideTypeBadge}>
          <Icon name="car" size={16} color="#FF6B35" />
          <Text style={styles.rideTypeText}>{incomingRide.rideType?.toUpperCase() || 'ECONOMY'}</Text>
        </View>
        <View style={styles.route}>
          <View style={styles.routeRow}>
            <View style={styles.dotGreen} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddr} numberOfLines={2}>{incomingRide.pickupAddress}</Text>
            </View>
            <View style={styles.distBadge}><Text style={styles.distText}>{incomingRide.pickupDistance || '0.8 km'} away</Text></View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <View style={styles.dotRed} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Drop-off</Text>
              <Text style={styles.routeAddr} numberOfLines={2}>{incomingRide.destinationAddress}</Text>
            </View>
          </View>
        </View>
        <View style={styles.tripDetails}>
          {[
            { icon: 'map-marker-distance', label: 'Distance', value: incomingRide.distance || '3.2 km' },
            { icon: 'clock-outline', label: 'Est. Duration', value: incomingRide.duration || '14 min' },
            { icon: 'cash', label: 'Est. Fare', value: `$${incomingRide.estimatedFare?.toFixed(2) || '12.50'}` },
          ].map((item) => (
            <View key={item.label} style={styles.detailItem}>
              <Icon name={item.icon} size={18} color="#FF6B35" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <Icon name="close" size={22} color="#FF4444" />
            <Text style={styles.rejectText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.acceptGrad}>
              <Icon name="check" size={22} color="#FFF" />
              <Text style={styles.acceptText}>Accept Ride</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#111', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  countdownBar: { height: 4, backgroundColor: '#222' },
  countdownFill: { height: '100%', borderRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  newRideLabel: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  countdownBadge: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  countdownText: { fontSize: 18, fontWeight: '800' },
  rideTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF6B3520', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FF6B3540' },
  rideTypeText: { color: '#FF6B35', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  route: { paddingHorizontal: 20, marginBottom: 16 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#00D95F', marginTop: 4 },
  dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF4444', marginTop: 4 },
  routeInfo: { flex: 1 },
  routeLabel: { color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  routeAddr: { color: '#FFF', fontSize: 14, marginTop: 2, lineHeight: 20 },
  routeLine: { width: 2, height: 20, backgroundColor: '#333', marginLeft: 5, marginVertical: 4 },
  distBadge: { backgroundColor: '#FF6B3515', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FF6B3530' },
  distText: { color: '#FF6B35', fontSize: 11, fontWeight: '600' },
  tripDetails: { marginHorizontal: 20, backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, gap: 12, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { color: '#888', fontSize: 13 },
  detailValue: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 58, borderRadius: 14, backgroundColor: '#FF444415', borderWidth: 1, borderColor: '#FF444440' },
  rejectText: { color: '#FF4444', fontSize: 16, fontWeight: '700' },
  acceptBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  acceptGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 58 },
  acceptText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
});
