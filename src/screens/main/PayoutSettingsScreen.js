// src/screens/main/PayoutSettingsScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const PAYOUT_SCHEDULES = [
  { id: 'instant',  label: 'Instant',       sub: '1.5% fee per transfer',  icon: 'lightning-bolt' },
  { id: 'daily',    label: 'Daily',          sub: 'Every day at 8:00 AM',   icon: 'calendar-today' },
  { id: 'weekly',   label: 'Weekly',         sub: 'Every Monday',           icon: 'calendar-week' },
];

export default function PayoutSettingsScreen({ navigation }) {
  const [schedule,    setSchedule]    = useState('weekly');
  const [bankName,    setBankName]    = useState('Chase Bank');
  const [accountNum,  setAccountNum]  = useState('••••4242');
  const [routingNum,  setRoutingNum]  = useState('••••0021');
  const [loading,     setLoading]     = useState(false);
  const [editingBank, setEditingBank] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate API call
    setLoading(false);
    setEditingBank(false);
    Alert.alert('Saved', 'Payout settings updated!');
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw Funds', 'Transfer your balance to your bank account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw $284.50', onPress: () => Alert.alert('Initiated', 'Transfer will arrive in 1–2 business days.') },
    ]);
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Payout Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Balance card */}
        <LinearGradient colors={['#FF6B35', '#C44A1F']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>$284.50</Text>
          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
            <Text style={styles.withdrawText}>Withdraw Now</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Payout schedule */}
        <Text style={styles.sectionTitle}>Payout Schedule</Text>
        <View style={styles.scheduleList}>
          {PAYOUT_SCHEDULES.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.scheduleItem, schedule === opt.id && styles.scheduleItemActive]}
              onPress={() => setSchedule(opt.id)}
            >
              <View style={[styles.scheduleIcon, schedule === opt.id && styles.scheduleIconActive]}>
                <Icon name={opt.icon} size={20} color={schedule === opt.id ? '#FF6B35' : '#888'} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>{opt.label}</Text>
                <Text style={styles.scheduleSub}>{opt.sub}</Text>
              </View>
              <View style={[styles.radio, schedule === opt.id && styles.radioActive]}>
                {schedule === opt.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bank account */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Bank Account</Text>
          <TouchableOpacity onPress={() => setEditingBank(!editingBank)}>
            <Text style={styles.editText}>{editingBank ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bankCard}>
          <View style={styles.bankIcon}>
            <Icon name="bank-outline" size={24} color="#FF6B35" />
          </View>
          {editingBank ? (
            <View style={styles.bankForm}>
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Bank Name</Text>
                <TextInput style={styles.input} value={bankName} onChangeText={setBankName}
                  placeholderTextColor="#444" selectionColor="#FF6B35" />
              </View>
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Account Number</Text>
                <TextInput style={styles.input} value={accountNum} onChangeText={setAccountNum}
                  keyboardType="number-pad" placeholderTextColor="#444" selectionColor="#FF6B35" />
              </View>
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Routing Number</Text>
                <TextInput style={styles.input} value={routingNum} onChangeText={setRoutingNum}
                  keyboardType="number-pad" placeholderTextColor="#444" selectionColor="#FF6B35" />
              </View>
            </View>
          ) : (
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>{bankName}</Text>
              <Text style={styles.bankAccount}>Account {accountNum}</Text>
              <Text style={styles.bankRouting}>Routing {routingNum}</Text>
            </View>
          )}
        </View>

        {editingBank && (
          <TouchableOpacity style={[styles.saveBtn, loading && styles.saveBtnDisabled]} onPress={handleSave} disabled={loading}>
            <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.saveBtnGrad}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Bank Details</Text>}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.saveBtn, !editingBank && { marginTop: 8 }, loading && styles.saveBtnDisabled]}
          onPress={handleSave} disabled={loading}>
          <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.saveBtnGrad}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Schedule</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.note}>
          🔒  Bank details are encrypted. Payouts processed via Stripe Connect.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  balanceCard: { borderRadius: 20, padding: 24, marginBottom: 28, alignItems: 'flex-start', gap: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  balanceAmount: { color: '#FFF', fontSize: 40, fontWeight: '800' },
  withdrawBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  withdrawText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 12 },
  editText: { color: '#FF6B35', fontSize: 14, fontWeight: '500' },
  scheduleList: { gap: 10, marginBottom: 28 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#111', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1E1E1E' },
  scheduleItemActive: { borderColor: '#FF6B3540', backgroundColor: '#150E0A' },
  scheduleIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  scheduleIconActive: { backgroundColor: '#FF6B3520' },
  scheduleInfo: { flex: 1 },
  scheduleLabel: { color: '#FFF', fontSize: 15, fontWeight: '500' },
  scheduleSub: { color: '#666', fontSize: 12, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#FF6B35' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B35' },
  bankCard: { flexDirection: 'row', gap: 14, backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1E1E1E' },
  bankIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FF6B3515', justifyContent: 'center', alignItems: 'center' },
  bankInfo: { flex: 1, gap: 4 },
  bankName: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  bankAccount: { color: '#888', fontSize: 13 },
  bankRouting: { color: '#888', fontSize: 13 },
  bankForm: { flex: 1, gap: 14 },
  fieldWrap: { gap: 6 },
  label: { color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  input: { backgroundColor: '#161616', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 16, height: 52, color: '#FFF', fontSize: 15 },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnGrad: { height: 56, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  note: { color: '#444', fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
