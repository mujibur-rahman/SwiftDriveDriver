// src/screens/main/EarningsScreen.js
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setPeriod } from '@/features/earnings/earningsSlice';
import { useGetEarningsQuery, useGetRideHistoryQuery } from '@/features/earnings/earningsApi';
import { useTheme } from '@/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import EarningsBalanceCard from '@/components/ui/EarningsBalanceCard';
import StatGrid from '@/components/ui/StatGrid';

const MOCK_CHART = [
  { day: 'Mon', amount: 85 }, { day: 'Tue', amount: 120 },
  { day: 'Wed', amount: 95 }, { day: 'Thu', amount: 145 },
  { day: 'Fri', amount: 180 }, { day: 'Sat', amount: 210 },
  { day: 'Sun', amount: 160 },
];

export default function EarningsScreen() {
  const dispatch = useDispatch();
  const { period } = useSelector((s) => s.earnings);
  const { todayStats } = useSelector((s) => s.driver);
  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
  const success = isDark ? '#34D399' : '#16A34A';
  const warning = isDark ? '#FBBF24' : '#D97706';
  const info = isDark ? '#60A5FA' : '#2563EB';

  const { data: earningsData, isLoading: earningsLoading } = useGetEarningsQuery({ period });
  const { data: history = [], isLoading: historyLoading } = useGetRideHistoryQuery();

  const summary = earningsData?.summary ?? null;
  const chartData = earningsData?.chartData ?? [];
  const loading = earningsLoading || historyLoading;

  const PERIODS = ['today', 'week', 'month', 'year'];
  //const maxAmount = Math.max(...MOCK_CHART.map((d) => d.amount));
  const maxAmount = Math.max(...(chartData.map((d) => d.amount) || [1]), 1);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-10">
      <ScreenHeader
        title="Earnings"
        showBack={false}
        className="px-5"
        rightContent={
          <Button variant="primary" size="sm" fullWidth={false} onPress={() => { }}>
            Withdraw
          </Button>
        }
      />

      <EarningsBalanceCard
        variant="primary"
        totalBalance={summary?.totalBalance}
        pendingPayout={summary?.pendingPayout}
        totalTrips={summary?.totalTrips}
      />

      <View className="mx-4 mb-4 flex-row rounded-xl bg-background-muted p-1">
        {PERIODS.map((p) => (
          <Button
            key={p}
            variant={period === p ? 'primary' : 'ghost'}
            size="xs"
            fullWidth={false}
            className="flex-1"
            onPress={() => dispatch(setPeriod(p))}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </View>

      <StatGrid
        className="mx-4 mb-4"
        items={[
          { icon: 'cash', label: 'Today', value: `$${todayStats.earnings.toFixed(2)}`, color: primary },
          { icon: 'car', label: 'Trips', value: todayStats.trips, color: info },
          { icon: 'clock-outline', label: 'Hours', value: `${summary?.hoursOnline || 0}h`, color: success },
          { icon: 'lightning-bolt', label: 'Per Hour', value: `$${todayStats.hours > 0 ? (todayStats.earnings / todayStats.hours).toFixed(0) : 0}`, color: warning },
        ]}
      />

      <View className="mx-4 mb-4">
        <Text className="mb-3 text-base font-inter-bold text-foreground">Weekly Earnings</Text>
        <View className="h-40 flex-row items-end gap-2 rounded-2xl border border-border bg-card p-4">
          {chartData.map((d) => (
            <View key={d.day} className="h-full flex-1 items-center justify-end gap-1">
              <Text className="text-[9px] font-inter-semibold" style={{ color: primary }}>${d.amount}</Text>
              <View
                className="w-full flex-1 overflow-hidden rounded-sm bg-background-muted"
                style={{ justifyContent: 'flex-end' }}
              >
                <LinearGradient
                  colors={['#FF6B35', '#E55A25']}
                  style={{ width: '100%', height: `${(d.amount / maxAmount) * 100}%`, borderRadius: 4 }}
                />
              </View>
              <Text className="text-[10px] font-inter text-foreground-muted">{d.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mx-4 mb-4">
        <Text className="mb-3 text-base font-inter-bold text-foreground">Recent Trips</Text>
        {loading && history.length === 0 ? (
          <ActivityIndicator color={primary} />
        ) : history.length === 0 ? (
          <Text className="text-sm font-inter text-foreground-muted">No trips yet</Text>
        ) : (
          history.slice(0, 5).map((ride) => (
            <View key={ride.id} className="flex-row items-center justify-between border-b border-border py-3">
              <View className="flex-1 flex-row items-center gap-2.5">
                <View className="h-9.5 w-9.5 items-center justify-center rounded-[10px] bg-primary/10">
                  <Icon name="car" size={18} color={primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-inter-medium text-foreground" numberOfLines={1}>
                    {ride.destinationAddress}
                  </Text>
                  <Text className="mt-0.5 text-[11px] font-inter text-foreground-muted">
                    {new Date(ride.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text className="text-[15px] font-inter-bold text-success">
                +${(ride.fare * 0.8).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
