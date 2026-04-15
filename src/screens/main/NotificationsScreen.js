// src/screens/main/NotificationsScreen.js  (Driver)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const ACCENT = '#FF6B35';

const NOTIFICATION_GROUPS = [
  {
    title: 'Ride Requests',
    items: [
      { id: 'new_request',  label: 'New Ride Requests',  sub: 'Alert when a ride is available',     default: true },
      { id: 'surge',        label: 'Surge Alerts',        sub: 'High demand in your area',           default: true },
      { id: 'ride_update',  label: 'Ride Status Updates', sub: 'Cancellations and changes',          default: true },
    ],
  },
  {
    title: 'Earnings',
    items: [
      { id: 'payout',       label: 'Payout Notifications', sub: 'When funds are transferred',        default: true },
      { id: 'bonus',        label: 'Bonus Alerts',         sub: 'New promos and incentives',         default: true },
      { id: 'weekly_sum',   label: 'Weekly Summary',       sub: 'Your weekly earnings report',       default: false },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'docs',         label: 'Document Updates',    sub: 'Approval status changes',            default: true },
      { id: 'security',     label: 'Security Alerts',     sub: 'Login and account changes',          default: true },
      { id: 'app_updates',  label: 'App Updates',         sub: 'New features and fixes',             default: false },
    ],
  },
];

export default function NotificationsScreen({ navigation }) {
  const initialState = {};
  NOTIFICATION_GROUPS.forEach((g) => g.items.forEach((i) => { initialState[i.id] = i.default; }));
  const [settings, setSettings] = useState(initialState);
  const [master,   setMaster]   = useState(true);

  const toggle = (id) => setSettings((s) => ({ ...s, [id]: !s[id] }));
  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.masterCard}>
          <View style={styles.masterIcon}><Icon name="bell-outline" size={24} color={ACCENT} /></View>
          <View style={styles.masterInfo}>
            <Text style={styles.masterLabel}>All Notifications</Text>
            <Text style={styles.masterSub}>{enabledCount}/{Object.keys(settings).length} enabled</Text>
          </View>
          <Switch
            value={master}
            onValueChange={(v) => {
              setMaster(v);
              const all = {};
              NOTIFICATION_GROUPS.forEach((g) => g.items.forEach((i) => { all[i.id] = v; }));
              setSettings(all);
            }}
            trackColor={{ false: '#333', true: `${ACCENT}80` }}
            thumbColor={master ? ACCENT : '#555'}
          />
        </View>

        {NOTIFICATION_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, idx) => (
                <View key={item.id} style={[styles.notifItem, idx < group.items.length - 1 && styles.notifItemBorder]}>
                  <View style={styles.notifInfo}>
                    <Text style={[styles.notifLabel, !master && styles.notifLabelDisabled]}>{item.label}</Text>
                    <Text style={styles.notifSub}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={settings[item.id] && master}
                    onValueChange={() => toggle(item.id)}
                    disabled={!master}
                    trackColor={{ false: '#333', true: `${ACCENT}80` }}
                    thumbColor={settings[item.id] && master ? ACCENT : '#555'}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
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
  masterCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#111', borderRadius: 16, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: '#1E1E1E' },
  masterIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: `${ACCENT}15`, justifyContent: 'center', alignItems: 'center' },
  masterInfo: { flex: 1 },
  masterLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  masterSub: { color: '#666', fontSize: 12, marginTop: 2 },
  group: { marginBottom: 16 },
  groupTitle: { color: '#555', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  groupCard: { backgroundColor: '#111', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1E1E1E' },
  notifItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  notifItemBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  notifInfo: { flex: 1 },
  notifLabel: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  notifLabelDisabled: { color: '#555' },
  notifSub: { color: '#666', fontSize: 12, marginTop: 2 },
});
