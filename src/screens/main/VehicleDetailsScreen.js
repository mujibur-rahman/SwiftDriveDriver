// src/screens/main/VehicleDetailsScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import api from '../../services/api';

export default function VehicleDetailsScreen({ navigation }) {
  const { driver } = useSelector((s) => s.auth);
  const v = driver?.vehicle || {};

  const [form, setForm] = useState({
    make:  v.make  || '',
    model: v.model || '',
    year:  v.year  ? String(v.year) : '',
    plate: v.plate || '',
    color: v.color || '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.plate.trim()) { Alert.alert('Error', 'License plate is required'); return; }
    setLoading(true);
    try {
      await api.patch('/drivers/vehicle', {
        ...form,
        year: form.year ? parseInt(form.year) : null,
      });
      Alert.alert('Success', 'Vehicle updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to update vehicle');
    } finally { setLoading(false); }
  };

  const Field = ({ label, field, ...props }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input} value={form[field]} onChangeText={update(field)}
        placeholderTextColor="#444" selectionColor="#FF6B35" {...props}
      />
    </View>
  );

  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Vehicle Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Vehicle card preview */}
          <View style={styles.vehicleCard}>
            <Text style={styles.vehicleEmoji}>🚗</Text>
            <View>
              <Text style={styles.vehicleName}>
                {form.year} {form.make} {form.model || 'Your Vehicle'}
              </Text>
              <Text style={styles.vehiclePlate}>
                {form.plate || 'ABC 1234'} · {form.color || 'Color'}
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <Field label="Make"          field="make"  placeholder="e.g. Toyota" />
            <Field label="Model"         field="model" placeholder="e.g. Camry" />
            <Field label="Year"          field="year"  placeholder="e.g. 2020" keyboardType="number-pad" />
            <Field label="License Plate" field="plate" placeholder="e.g. ABC 1234" autoCapitalize="characters" />
            <Field label="Color"         field="color" placeholder="e.g. Silver" />
          </View>

          {/* Verification status */}
          <View style={styles.verifyCard}>
            <Icon name={v.isVerified ? 'check-circle' : 'clock-outline'} size={20}
              color={v.isVerified ? '#00D95F' : '#FFA500'} />
            <View style={styles.verifyInfo}>
              <Text style={styles.verifyTitle}>
                {v.isVerified ? 'Vehicle Verified' : 'Verification Pending'}
              </Text>
              <Text style={styles.verifySub}>
                {v.isVerified
                  ? 'Your vehicle has been approved'
                  : 'Submit documents to complete verification'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, loading && styles.saveBtnDisabled]} onPress={handleSave} disabled={loading}>
            <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.saveBtnGrad}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: '#1E1E1E' },
  vehicleEmoji: { fontSize: 40 },
  vehicleName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  vehiclePlate: { color: '#888', fontSize: 13, marginTop: 4 },
  form: { gap: 16, marginBottom: 20 },
  fieldWrap: { gap: 8 },
  label: { color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  input: { backgroundColor: '#161616', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 16, height: 56, color: '#FFF', fontSize: 16 },
  verifyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#1E1E1E' },
  verifyInfo: { flex: 1 },
  verifyTitle: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  verifySub: { color: '#666', fontSize: 12, marginTop: 2 },
  saveBtn: { borderRadius: 14, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnGrad: { height: 56, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
