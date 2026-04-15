// src/screens/main/ActiveRideScreen.js  (Driver)
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert, Linking } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { startRide, completeRide, resetActiveRide } from '../../store/slices/driverSlice';
import { useDriverSocket } from '../../services/DriverSocketContext';
import { DARK_MAP_STYLE } from '../../utils/mapStyles';

const STEP_CONFIG = {
  accepted: { title: 'Head to Pickup', subtitle: 'Navigate to passenger location', primaryBtn: "I've Arrived", primaryAction: 'arrived', color: '#FF6B35' },
  arrived:  { title: 'Passenger Pickup', subtitle: 'Waiting for passenger to board', primaryBtn: 'Start Ride', primaryAction: 'start', color: '#4A9EFF' },
  ongoing:  { title: 'Trip in Progress', subtitle: 'Navigate to destination', primaryBtn: 'Complete Ride', primaryAction: 'complete', color: '#00D95F' },
};

export default function ActiveRideScreen({ navigation }) {
  const dispatch = useDispatch();
  const { rideStatus, activeRide, passenger, currentLocation } = useSelector((s) => s.driver);
  const { arrivedAtPickup } = useDriverSocket();
  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50 }).start();
  }, []);

  useEffect(() => {
    if (rideStatus === 'completed') setTimeout(() => navigation.replace('RideCompleted'), 500);
  }, [rideStatus]);

  const handlePrimaryAction = (action) => {
    if (action === 'arrived') arrivedAtPickup(activeRide?.id);
    else if (action === 'start') dispatch(startRide(activeRide?.id));
    else if (action === 'complete') {
      Alert.alert('Complete Ride', 'Confirm ride completion?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => dispatch(completeRide(activeRide?.id)) },
      ]);
    }
  };

  const openNavigation = () => {
    const coords = rideStatus === 'ongoing' ? activeRide?.destination : activeRide?.pickup;
    if (coords) Linking.openURL(`google.navigation:q=${coords.latitude},${coords.longitude}`);
  };

  const config = STEP_CONFIG[rideStatus] || STEP_CONFIG.accepted;
  const targetCoords = rideStatus === 'ongoing' ? activeRide?.destination : activeRide?.pickup;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation
        initialRegion={{
          latitude: currentLocation?.latitude || 37.7749,
          longitude: currentLocation?.longitude || -122.4194,
          latitudeDelta: 0.02, longitudeDelta: 0.02,
        }}
      >
        {activeRide?.pickup && (
          <Marker coordinate={activeRide.pickup}>
            <View style={styles.markerGreen}><Icon name="account" size={16} color="#FFF" /></View>
          </Marker>
        )}
        {activeRide?.destination && (
          <Marker coordinate={activeRide.destination}>
            <View style={styles.markerRed}><Icon name="flag-checkered" size={16} color="#FFF" /></View>
          </Marker>
        )}
        {currentLocation && targetCoords && (
          <Polyline coordinates={[currentLocation, targetCoords]} strokeColor={config.color} strokeWidth={3} lineDashPattern={rideStatus === 'accepted' ? [8, 4] : undefined} />
        )}
      </MapView>

      <TouchableOpacity style={styles.navBtn} onPress={openNavigation}>
        <Icon name="navigation" size={22} color="#FFF" />
      </TouchableOpacity>

      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.statusHeader, { borderLeftColor: config.color }]}>
          <View>
            <Text style={styles.statusTitle}>{config.title}</Text>
            <Text style={styles.statusSubtitle}>{config.subtitle}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${config.color}20`, borderColor: `${config.color}40` }]}>
            <Text style={[styles.statusBadgeText, { color: config.color }]}>{rideStatus?.toUpperCase()}</Text>
          </View>
        </View>

        {passenger && (
          <View style={styles.passengerCard}>
            <View style={styles.passengerAvatar}>
              <Text style={styles.passengerAvatarText}>{passenger.name?.[0] || 'P'}</Text>
            </View>
            <View style={styles.passengerInfo}>
              <Text style={styles.passengerName}>{passenger.name}</Text>
              <View style={styles.passengerMeta}>
                <Text style={styles.passengerRating}>⭐ {passenger.rating || '4.7'}</Text>
                <Text style={styles.passengerTrips}>{passenger.trips || '32'} trips</Text>
              </View>
            </View>
            <View style={styles.passengerActions}>
              <TouchableOpacity style={styles.passengerActionBtn} onPress={() => passenger?.phone && Linking.openURL(`tel:${passenger.phone}`)}>
                <Icon name="phone" size={18} color="#FF6B35" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.passengerActionBtn}>
                <Icon name="message-outline" size={18} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Estimated Earnings</Text>
          <Text style={[styles.fareValue, { color: config.color }]}>${activeRide?.estimatedFare?.toFixed(2) || '12.50'}</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => handlePrimaryAction(config.primaryAction)}>
          <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.primaryBtnGrad}>
            <Text style={styles.primaryBtnText}>{config.primaryBtn}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  map: { flex: 1 },
  navBtn: { position: 'absolute', right: 20, bottom: 300, width: 52, height: 52, borderRadius: 26, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  markerGreen: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#00D95F', justifyContent: 'center', alignItems: 'center' },
  markerRed: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF4444', justifyContent: 'center', alignItems: 'center' },
  panel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 14 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, paddingLeft: 12 },
  statusTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statusSubtitle: { color: '#888', fontSize: 13, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  passengerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14 },
  passengerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  passengerAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  passengerInfo: { flex: 1 },
  passengerName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  passengerMeta: { flexDirection: 'row', gap: 10, marginTop: 2 },
  passengerRating: { color: '#888', fontSize: 13 },
  passengerTrips: { color: '#888', fontSize: 13 },
  passengerActions: { flexDirection: 'row', gap: 8 },
  passengerActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6B3520', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FF6B3540' },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14 },
  fareLabel: { color: '#888', fontSize: 14 },
  fareValue: { fontSize: 20, fontWeight: '800' },
  primaryBtn: { borderRadius: 14, overflow: 'hidden' },
  primaryBtnGrad: { height: 56, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
});
