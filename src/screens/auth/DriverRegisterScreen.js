// src/screens/auth/DriverRegisterScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { registerDriver, clearError } from '../../store/slices/authSlice';

export default function DriverRegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    licenseNumber: '', vehicleMake: '', vehicleModel: '',
    vehicleYear: '', vehiclePlate: '', vehicleColor: '',
  });

  useEffect(() => {
    if (error) { Alert.alert('Error', error); dispatch(clearError()); }
  }, [error]);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = () => {
    if (!form.name || !form.phone || !form.password || !form.licenseNumber) {
      Alert.alert('Error', 'Please fill in all required fields'); return;
    }
    dispatch(registerDriver(form));
  };

  const Field = ({ label, field, required, ...props }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}{required && ' *'}</Text>
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
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Become a{'\n'}Driver</Text>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>

          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.section}>
            <Field label="Full Name" field="name" placeholder="John Doe" required />
            <Field label="Phone" field="phone" placeholder="+1 (555) 000-0000" keyboardType="phone-pad" required />
            <Field label="Email" field="email" placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Password" field="password" placeholder="Min 8 characters" secureTextEntry required />
            <Field label="Driver's License Number" field="licenseNumber" placeholder="DL12345678" required autoCapitalize="characters" />
          </View>

          <Text style={styles.sectionTitle}>Vehicle Info</Text>
          <View style={styles.section}>
            <Field label="Make" field="vehicleMake" placeholder="Toyota" />
            <Field label="Model" field="vehicleModel" placeholder="Camry" />
            <Field label="Year" field="vehicleYear" placeholder="2020" keyboardType="number-pad" />
            <Field label="License Plate" field="vehiclePlate" placeholder="ABC 1234" autoCapitalize="characters" />
            <Field label="Color" field="vehicleColor" placeholder="Silver" />
          </View>

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.btnGrad}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Submit Application</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already registered? <Text style={styles.loginAccent}>Sign In</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  back: { marginBottom: 24 },
  backText: { color: '#888', fontSize: 16 },
  title: { fontSize: 36, fontWeight: '800', color: '#FFF', lineHeight: 44 },
  subtitle: { color: '#666', fontSize: 15, marginTop: 8, marginBottom: 32 },
  sectionTitle: { color: '#FF6B35', fontSize: 13, fontWeight: '700', letterSpacing: 0.8, marginBottom: 12, marginTop: 8 },
  section: { gap: 14, marginBottom: 24 },
  fieldWrap: { gap: 6 },
  label: { color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  input: { backgroundColor: '#161616', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 16, height: 52, color: '#FFF', fontSize: 15 },
  btn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnGrad: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginText: { color: '#666', fontSize: 15 },
  loginAccent: { color: '#FF6B35', fontWeight: '600' },
});
