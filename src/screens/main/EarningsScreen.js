// src/screens/main/EarningsScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarnings, fetchRideHistory, setPeriod } from '../../store/slices/earningsSlice';

const MOCK_CHART = [
  { day: 'Mon', amount: 85 }, { day: 'Tue', amount: 120 },
  { day: 'Wed', amount: 95 }, { day: 'Thu', amount: 145 },
  { day: 'Fri', amount: 180 }, { day: 'Sat', amount: 210 },
  { day: 'Sun', amount: 160 },
];

export default function EarningsScreen() {
  const dispatch = useDispatch();
  const { summary, history, loading, period } = useSelector((s) => s.earnings);
  const { todayStats } = useSelector((s) => s.driver);

  useEffect(() => { dispatch(fetchEarnings({ period })); dispatch(fetchRideHistory()); }, [period]);

  const PERIODS = ['today', 'week', 'month', 'year'];
  const chartData = summary?.chartData || [];
  //const maxAmount = Math.max(...MOCK_CHART.map((d) => d.amount));
  const maxAmount = Math.max(...(chartData.map((d) => d.amount) || [1]), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
        <TouchableOpacity style={styles.withdrawBtn}><Text style={styles.withdrawText}>Withdraw</Text></TouchableOpacity>
      </View>

      <LinearGradient colors={['#FF6B35', '#C44A1F']} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>${summary?.totalBalance?.toFixed(2) || '1,284.50'}</Text>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemValue}>${summary?.pendingPayout?.toFixed(2) || '284.50'}</Text>
            <Text style={styles.balanceItemLabel}>Pending Payout</Text>
          </View>
          <View style={styles.balanceItemDivider} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemValue}>{summary?.totalTrips || 0}</Text>
            <Text style={styles.balanceItemLabel}>Total Trips</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.periodSelector}>
        {PERIODS.map((p) => (
          <TouchableOpacity key={p} style={[styles.periodBtn, period === p && styles.periodBtnActive]} onPress={() => dispatch(setPeriod(p))}>
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.quickStats}>
        {[
          { icon: 'cash', label: 'Today', value: `$${todayStats.earnings.toFixed(2)}`, color: '#FF6B35' },
          { icon: 'car', label: 'Trips', value: todayStats.trips, color: '#4A9EFF' },
          //{ icon: 'clock-outline', label: 'Hours', value: `${todayStats.hours.toFixed(1)}h`, color: '#00D95F' },
          { icon: 'clock-outline', label: 'Hours', value: `${summary?.hoursOnline || 0}h`, color: '#00D95F' },
          { icon: 'lightning-bolt', label: 'Per Hour', value: `$${todayStats.hours > 0 ? (todayStats.earnings / todayStats.hours).toFixed(0) : 0}`, color: '#FFD700' },
        ].map((stat) => (
          <View key={stat.label} style={styles.quickStatCard}>
            <Icon name={stat.icon} size={20} color={stat.color} />
            <Text style={styles.quickStatValue}>{stat.value}</Text>
            <Text style={styles.quickStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weekly Earnings</Text>
        <View style={styles.chart}>
          {chartData.map((d) => (
            <View key={d.day} style={styles.barWrap}>
              <Text style={styles.barAmount}>${d.amount}</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#FF6B35', '#E55A25']} style={[styles.barFill, { height: `${(d.amount / maxAmount) * 100}%` }]} />
              </View>
              <Text style={styles.barDay}>{d.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Trips</Text>
        {loading && history.length === 0 ? <ActivityIndicator color="#FF6B35" /> :
          history.length === 0 ? <Text style={styles.emptyText}>No trips yet</Text> :
          history.slice(0, 5).map((ride) => (
            <View key={ride.id} style={styles.rideItem}>
              <View style={styles.rideItemLeft}>
                <View style={styles.rideIcon}><Icon name="car" size={18} color="#FF6B35" /></View>
                <View>
                  <Text style={styles.rideItemAddr} numberOfLines={1}>{ride.destinationAddress}</Text>
                  <Text style={styles.rideItemDate}>{new Date(ride.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <Text style={styles.rideItemEarning}>+${(ride.fare * 0.8).toFixed(2)}</Text>
            </View>
          ))
        }
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  withdrawBtn: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  withdrawText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  balanceCard: { marginHorizontal: 16, borderRadius: 20, marginBottom: 16, padding: 24 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  balanceAmount: { color: '#FFF', fontSize: 42, fontWeight: '800', marginTop: 4 },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceItem: { flex: 1, alignItems: 'center', gap: 4 },
  balanceItemValue: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  balanceItemLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  balanceItemDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  periodSelector: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#161616', borderRadius: 12, padding: 4 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#FF6B35' },
  periodText: { color: '#666', fontSize: 13, fontWeight: '500' },
  periodTextActive: { color: '#FFF', fontWeight: '700' },
  quickStats: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 16 },
  quickStatCard: { flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#1E1E1E' },
  quickStatValue: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  quickStatLabel: { color: '#555', fontSize: 10 },
  chartSection: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: '#111', borderRadius: 16, padding: 16, height: 160, borderWidth: 1, borderColor: '#1E1E1E' },
  barWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 },
  barAmount: { color: '#FF6B35', fontSize: 9, fontWeight: '600' },
  barBg: { width: '100%', flex: 1, backgroundColor: '#1A1A1A', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  barDay: { color: '#666', fontSize: 10 },
  section: { marginHorizontal: 16, marginBottom: 16 },
  rideItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  rideItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rideIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#FF6B3515', justifyContent: 'center', alignItems: 'center' },
  rideItemAddr: { color: '#CCC', fontSize: 13, fontWeight: '500' },
  rideItemDate: { color: '#555', fontSize: 11, marginTop: 2 },
  rideItemEarning: { color: '#FF6B35', fontSize: 15, fontWeight: '700' },
  emptyText: { color: '#555', fontSize: 14 },
});
