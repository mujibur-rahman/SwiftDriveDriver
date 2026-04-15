// src/screens/main/RideHistoryScreen.js  (Driver)
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import api from '../../services/api';

const STATUS_CONFIG = {
  completed:   { color: '#00D95F', icon: 'check-circle',  label: 'Completed' },
  cancelled:   { color: '#FF4444', icon: 'close-circle',  label: 'Cancelled' },
  declined:    { color: '#888',    icon: 'hand-back-left', label: 'Declined' },
  in_progress: { color: '#4A9EFF', icon: 'navigation',    label: 'In Progress' },
};

const FILTERS = ['All', 'Completed', 'Declined', 'Cancelled'];

export default function RideHistoryScreen({ navigation }) {
  const [rides,     setRides]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [filter,    setFilter]    = useState('All');
  const [stats,     setStats]     = useState({ total: 0, earnings: 0, distance: 0 });

  useEffect(() => { fetchRides(); }, []);

  const fetchRides = async () => {
    try {
      const res = await api.get('/drivers/rides/history');
      const data = res.data.rides || [];
      setRides(data);
      // Calculate stats
      const completed = data.filter((r) => r.status === 'completed');
      setStats({
        total:    completed.length,
        earnings: completed.reduce((sum, r) => sum + ((r.fare || 0) * 0.8), 0),
        distance: completed.reduce((sum, r) => sum + parseFloat(r.distance || 0), 0),
      });
    } catch (e) {
      console.warn('Failed to fetch rides:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = filter === 'All'
    ? rides
    : rides.filter((r) => r.status.toLowerCase() === filter.toLowerCase());

  const renderItem = ({ item }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.completed;
    const earning = item.fare ? `$${(item.fare * 0.8).toFixed(2)}` : '--';
    const date    = new Date(item.createdAt);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
            <Icon name={config.icon} size={12} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={styles.cardDate}>
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Route */}
        <View style={styles.route}>
          <View style={styles.routeDots}>
            <View style={styles.dotGreen} />
            <View style={styles.routeLine} />
            <View style={styles.dotRed} />
          </View>
          <View style={styles.routeAddresses}>
            <Text style={styles.routeAddr} numberOfLines={1}>{item.pickupAddress || 'Pickup'}</Text>
            <Text style={styles.routeAddr} numberOfLines={1}>{item.destinationAddress || 'Destination'}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          {item.distance && (
            <View style={styles.footerItem}>
              <Icon name="map-marker-distance" size={13} color="#666" />
              <Text style={styles.footerText}>{item.distance}</Text>
            </View>
          )}
          {item.duration && (
            <View style={styles.footerItem}>
              <Icon name="clock-outline" size={13} color="#666" />
              <Text style={styles.footerText}>{item.duration}</Text>
            </View>
          )}
          <View style={styles.earningBadge}>
            <Text style={styles.earningText}>{earning}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Ride History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total Trips',   value: stats.total },
          { label: 'Total Earned',  value: `$${stats.earnings.toFixed(2)}` },
          { label: 'Total KM',      value: `${stats.distance.toFixed(0)}` },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#FF6B35" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchRides(); }}
              tintColor="#FF6B35"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyTitle}>No rides yet</Text>
              <Text style={styles.emptySub}>
                {filter === 'All' ? 'Your trip history will appear here' : `No ${filter.toLowerCase()} trips`}
              </Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center',
  },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#1E1E1E',
  },
  statValue: { color: '#FF6B35', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#555', fontSize: 10, textAlign: 'center' },
  filterRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#1A1A1A',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  filterBtnActive: { backgroundColor: '#FF6B3520', borderColor: '#FF6B3560' },
  filterText: { color: '#666', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#FF6B35', fontWeight: '700' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12, paddingTop: 4 },
  card: {
    backgroundColor: '#111', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#1E1E1E', gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDate: { color: '#555', fontSize: 12 },
  route: { flexDirection: 'row', gap: 12 },
  routeDots: { alignItems: 'center', gap: 3, paddingTop: 2 },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00D95F' },
  dotRed:   { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4444' },
  routeLine: { width: 2, height: 16, backgroundColor: '#333' },
  routeAddresses: { flex: 1, gap: 12 },
  routeAddr: { color: '#CCC', fontSize: 13 },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1A1A1A',
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { color: '#666', fontSize: 12 },
  earningBadge: { marginLeft: 'auto' },
  earningText: { color: '#FF6B35', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon:  { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  emptySub:   { color: '#555', fontSize: 14 },
});
