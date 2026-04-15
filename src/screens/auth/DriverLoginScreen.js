// src/screens/auth/DriverLoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { loginDriver, clearError } from '../../store/slices/authSlice';

export default function DriverLoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (error) { Alert.alert('Login Failed', error); dispatch(clearError()); }
  }, [error]);

  const handleLogin = () => {
    if (!phone || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    dispatch(loginDriver({ phone, password }));
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.badge}><Text style={styles.badgeText}>DRIVER PORTAL</Text></View>
            <Text style={styles.title}>Start{'\n'}Driving 🚗</Text>
            <Text style={styles.subtitle}>Sign in to your driver account</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} placeholder="+1 (555) 000-0000" placeholderTextColor="#444" keyboardType="phone-pad" value={phone} onChangeText={setPhone} selectionColor="#FF6B35" />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Enter password" placeholderTextColor="#444" secureTextEntry value={password} onChangeText={setPassword} selectionColor="#FF6B35" />
            </View>
            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
              <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.btnGrad}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Sign In</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>New driver? <Text style={styles.registerAccent}>Sign up here</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40 },
  badge: { backgroundColor: '#FF6B3520', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: '#FF6B3540' },
  badgeText: { color: '#FF6B35', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  title: { fontSize: 40, fontWeight: '800', color: '#FFF', lineHeight: 48 },
  subtitle: { color: '#666', fontSize: 16, marginTop: 8 },
  form: { gap: 16 },
  fieldWrap: { gap: 8 },
  label: { color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  input: { backgroundColor: '#161616', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 16, height: 56, color: '#FFF', fontSize: 16 },
  btn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnGrad: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  registerLink: { marginTop: 32, alignItems: 'center' },
  registerText: { color: '#666', fontSize: 15 },
  registerAccent: { color: '#FF6B35', fontWeight: '600' },
});
