// src/screens/main/FLStatusScreen.js
/**
 * Shows the FL training status to the driver.
 * Accessible from Profile → AI Model Status
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFL } from '../../services/fl/FLContext';
import { getLocalTripStats, getFLState } from '../../services/database/tripStore';

export default function FLStatusScreen({ navigation }) {
  const { flStatus, triggerManualTraining } = useFL();
  const [stats,   setStats]   = useState({});
  const [flState, setFlState] = useState({});

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const s  = await getLocalTripStats();
    const fs = await getFLState();
    setStats(s);
    setFlState(fs);
  };

  const handleManualTrain = () => {
    Alert.alert(
      'Train Model',
      `Start FL training round with ${stats.totalTrips || 0} local trips?\n\nYour data stays on this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Train Now', onPress: () => triggerManualTraining() },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Model Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Privacy banner */}
        <View style={styles.privacyBanner}>
          <Icon name="shield-lock" size={24} color="#4A9EFF" />
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyTitle}>Privacy Protected</Text>
            <Text style={styles.privacySub}>
              Your trip data stays on this device. Only encrypted model updates are shared.
            </Text>
          </View>
        </View>

        {/* Training status */}
        {flStatus.isTraining && (
          <View style={styles.trainingCard}>
            <ActivityIndicator color="#FF6B35" />
            <View style={styles.trainingInfo}>
              <Text style={styles.trainingTitle}>Training in progress...</Text>
              {flStatus.progress && (
                <Text style={styles.trainingSub}>
                  {flStatus.progress.modelType} — {flStatus.progress.status}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { icon: 'car',          label: 'Local Trips',    value: stats.totalTrips    || 0,   color: '#FF6B35' },
            { icon: 'brain',        label: 'FL Rounds',      value: flState.total_rounds || 0,  color: '#4A9EFF' },
            { icon: 'chip',         label: 'Model Version',  value: `v${flState.model_version || 0}`, color: '#00D95F' },
            { icon: 'shield-check', label: 'Privacy (ε)',    value: 'Protected',                color: '#9B59B6' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Icon name={s.icon} size={24} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Model versions */}
        <Text style={styles.sectionTitle}>Model Status</Text>
        <View style={styles.modelList}>
          {[
            { type: 'surge',  label: 'Surge Predictor',  icon: 'lightning-bolt', desc: 'Predicts demand-based pricing' },
            { type: 'eta',    label: 'ETA Predictor',    icon: 'clock-fast',     desc: 'Estimates trip duration' },
            { type: 'demand', label: 'Demand Predictor', icon: 'map-marker-radius', desc: 'Forecasts area demand' },
          ].map((model) => (
            <View key={model.type} style={styles.modelCard}>
              <View style={styles.modelIconWrap}>
                <Icon name={model.icon} size={22} color="#FF6B35" />
              </View>
              <View style={styles.modelInfo}>
                <Text style={styles.modelLabel}>{model.label}</Text>
                <Text style={styles.modelDesc}>{model.desc}</Text>
              </View>
              <View style={[
                styles.modelStatus,
                flStatus.hasModels ? styles.modelStatusActive : styles.modelStatusWaiting,
              ]}>
                <Text style={[
                  styles.modelStatusText,
                  { color: flStatus.hasModels ? '#00D95F' : '#888' },
                ]}>
                  {flStatus.hasModels ? 'Active' : 'Pending'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Last trained */}
        {flState.last_trained_at && (
          <View style={styles.lastTrainedCard}>
            <Icon name="history" size={16} color="#888" />
            <Text style={styles.lastTrainedText}>
              Last trained: {new Date(flState.last_trained_at).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Manual training */}
        <TouchableOpacity
          style={[styles.trainBtn, flStatus.isTraining && styles.trainBtnDisabled]}
          onPress={handleManualTrain}
          disabled={flStatus.isTraining || (stats.totalTrips || 0) < 10}
        >
          <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.trainBtnGrad}>
            <Icon name="brain" size={20} color="#FFF" />
            <Text style={styles.trainBtnText}>
              {flStatus.isTraining ? 'Training...' : 'Train Now'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {(stats.totalTrips || 0) < 10 && (
          <Text style={styles.minTripsNote}>
            Complete {10 - (stats.totalTrips || 0)} more trip{10 - (stats.totalTrips || 0) > 1 ? 's' : ''} to enable training
          </Text>
        )}

        <Text style={styles.note}>
          Training runs automatically every night at 2 AM.{'\n'}
          Only gradient updates — never raw data — are shared.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center',
  },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  privacyBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#4A9EFF15', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#4A9EFF30', marginBottom: 16,
  },
  privacyInfo: { flex: 1 },
  privacyTitle: { color: '#4A9EFF', fontSize: 14, fontWeight: '700' },
  privacySub:   { color: '#4A9EFF99', fontSize: 12, marginTop: 4, lineHeight: 18 },
  trainingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FF6B3515', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#FF6B3530', marginBottom: 16,
  },
  trainingInfo:  { flex: 1 },
  trainingTitle: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
  trainingSub:   { color: '#FF6B3599', fontSize: 12, marginTop: 2 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#111', borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#666', fontSize: 11, textAlign: 'center' },
  sectionTitle: {
    color: '#555', fontSize: 12, fontWeight: '600',
    letterSpacing: 0.5, marginBottom: 10,
  },
  modelList: { gap: 10, marginBottom: 16 },
  modelCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#111', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  modelIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FF6B3515', justifyContent: 'center', alignItems: 'center',
  },
  modelInfo:  { flex: 1 },
  modelLabel: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  modelDesc:  { color: '#666', fontSize: 12, marginTop: 2 },
  modelStatus: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
  },
  modelStatusActive:  { backgroundColor: '#00D95F15', borderColor: '#00D95F30' },
  modelStatusWaiting: { backgroundColor: '#1A1A1A',   borderColor: '#2A2A2A' },
  modelStatusText: { fontSize: 11, fontWeight: '600' },
  lastTrainedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#111', borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  lastTrainedText: { color: '#666', fontSize: 12 },
  trainBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  trainBtnDisabled: { opacity: 0.5 },
  trainBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 56,
  },
  trainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  minTripsNote: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  note: { color: '#444', fontSize: 12, textAlign: 'center', lineHeight: 20, marginTop: 8 },
});
