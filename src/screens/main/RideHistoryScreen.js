// src/screens/main/RideHistoryScreen.js  (Driver)
import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useGetRideHistoryQuery } from '@/features/earnings/earningsApi';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';

const STATUS_CONFIG = {
  completed:   { colorKey: 'success', icon: 'check-circle',  label: 'Completed' },
  cancelled:   { colorKey: 'error',   icon: 'close-circle',  label: 'Cancelled' },
  declined:    { colorKey: 'muted',   icon: 'hand-back-left', label: 'Declined' },
  in_progress: { colorKey: 'info',    icon: 'navigation',    label: 'In Progress' },
};

const FILTERS = ['All', 'Completed', 'Declined', 'Cancelled'];

export default function RideHistoryScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const success = isDark ? '#34D399' : '#16A34A';
  const error   = isDark ? '#F87171' : '#DC2626';
  const info    = isDark ? '#60A5FA' : '#2563EB';
  const muted   = isDark ? '#7DD3FC' : '#64748B';
  const primary = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');

  const colorMap = { success, error, info, muted };

  const [filter, setFilter] = useState('All');

  const { data: rides = [], isLoading, isFetching, refetch } = useGetRideHistoryQuery();

  const stats = useMemo(() => {
    const completed = rides.filter((r) => r.status === 'completed');
    return {
      total:    completed.length,
      earnings: completed.reduce((sum, r) => sum + ((r.fare || 0) * 0.8), 0),
      distance: completed.reduce((sum, r) => sum + parseFloat(r.distance || 0), 0),
    };
  }, [rides]);

  const filtered = filter === 'All'
    ? rides
    : rides.filter((r) => r.status.toLowerCase() === filter.toLowerCase());

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.completed;
    const color = colorMap[cfg.colorKey] ?? success;
    const earning = item.fare ? `$${(item.fare * 0.8).toFixed(2)}` : '--';
    const date    = new Date(item.createdAt);

    return (
      <TouchableOpacity
        className="gap-3 rounded-2xl border border-border bg-card p-4"
        activeOpacity={0.8}
      >
        {/* Header row */}
        <View className="flex-row items-center justify-between">
          <View
            className="flex-row items-center gap-1 rounded-lg px-2.5 py-1"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon name={cfg.icon} size={12} color={color} />
            <Text className="text-[12px] font-inter-semibold" style={{ color }}>{cfg.label}</Text>
          </View>
          <Text className="text-[12px] font-inter text-foreground-muted">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Route */}
        <View className="flex-row gap-3">
          <View className="items-center gap-1 pt-0.5">
            <View className="h-2.5 w-2.5 rounded-full bg-success" />
            <View className="h-4 w-0.5 bg-border" />
            <View className="h-2.5 w-2.5 rounded-full bg-error" />
          </View>
          <View className="flex-1 gap-3">
            <Text className="text-[13px] font-inter text-foreground" numberOfLines={1}>
              {item.pickupAddress || 'Pickup'}
            </Text>
            <Text className="text-[13px] font-inter text-foreground" numberOfLines={1}>
              {item.destinationAddress || 'Destination'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center gap-3 border-t border-border pt-2.5">
          {item.distance && (
            <View className="flex-row items-center gap-1">
              <Icon name="map-marker-distance" size={13} color={muted} />
              <Text className="text-[12px] font-inter text-foreground-muted">{item.distance}</Text>
            </View>
          )}
          {item.duration && (
            <View className="flex-row items-center gap-1">
              <Icon name="clock-outline" size={13} color={muted} />
              <Text className="text-[12px] font-inter text-foreground-muted">{item.duration}</Text>
            </View>
          )}
          <Text className="ml-auto text-base font-inter-bold text-success">{earning}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Ride History" className="px-4" />

      {/* Summary stats */}
      <View className="mb-4 flex-row gap-2.5 px-4">
        {[
          { label: 'Total Trips',  value: stats.total },
          { label: 'Total Earned', value: `$${stats.earnings.toFixed(2)}` },
          { label: 'Total KM',     value: `${stats.distance.toFixed(0)}` },
        ].map((s) => (
          <View key={s.label} className="flex-1 items-center gap-1 rounded-2xl border border-border bg-card p-3.5">
            <Text className="text-lg font-inter-extrabold" style={{ color: primary }}>{s.value}</Text>
            <Text className="text-center text-[10px] font-inter text-foreground-muted">{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <View className="mb-3 flex-row gap-2 px-4">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'outline'}
            size="xs"
            fullWidth={false}
            onPress={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-4 pb-10 pt-1"
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={primary}
            />
          }
          ListEmptyComponent={
            <View className="items-center gap-2 pt-20">
              <Text className="mb-2 text-[52px]">🚗</Text>
              <Text className="text-lg font-inter-semibold text-foreground">No rides yet</Text>
              <Text className="text-sm font-inter text-foreground-muted">
                {filter === 'All' ? 'Your trip history will appear here' : `No ${filter.toLowerCase()} trips`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
