// src/screens/main/EarningsScreen.js
import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
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

const PERIOD_CONFIG = [
  { key: 'today', label: 'Today', statLabel: 'Today', chartTitle: "Today's Earnings" },
  { key: 'week', label: 'Week', statLabel: 'This Week', chartTitle: 'Weekly Earnings' },
  { key: 'month', label: 'Month', statLabel: 'This Month', chartTitle: 'Monthly Earnings' },
  { key: 'year', label: 'Year', statLabel: 'This Year', chartTitle: 'Yearly Earnings' },
];

export default function EarningsScreen() {
  const dispatch = useDispatch();
  const { period = 'week' } = useSelector((s) => s.earnings);
  // Local today stats are bumped optimistically when a delivery completes,
  // so they are always up-to-date even when the server API is unreachable.
  const todayStats = useSelector((s) => s.driver.todayStats);
  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
  const success = isDark ? '#34D399' : '#16A34A';
  const warning = isDark ? '#FBBF24' : '#D97706';
  const info = isDark ? '#60A5FA' : '#2563EB';

  const {
    data: earningsData,
    isLoading: earningsLoading,
    isFetching: earningsFetching,
    refetch: refetchEarnings,
  } = useGetEarningsQuery({ period });

  const {
    data: history = [],
    isLoading: historyLoading,
    isFetching: historyFetching,
    refetch: refetchHistory,
  } = useGetRideHistoryQuery();

  const summary = earningsData?.summary ?? earningsData?.data?.summary ?? null;
  const rawChartData = earningsData?.chartData ?? earningsData?.data?.chartData ?? [];
  const loading = earningsLoading || historyLoading;
  const isRefreshing = (earningsFetching || historyFetching) && !loading;

  const currentPeriodConfig =
    PERIOD_CONFIG.find((p) => p.key === period) || PERIOD_CONFIG[1];

  // Selected period metrics — server data takes priority; local todayStats
  // act as an immediate fallback for the 'today' period so that earnings
  // from completed deliveries appear without waiting for an API refetch.
  const periodEarnings =
    summary?.periodEarnings ??
    (period === 'today' ? summary?.todayEarnings : null) ??
    (summary?.earnings != null ? summary.earnings : null) ??
    summary?.totalBalance ??
    (period === 'today' ? todayStats.earnings : 0);

  const periodTrips =
    summary?.periodTrips ??
    (period === 'today' ? summary?.todayTrips : null) ??
    (summary?.trips != null ? summary.trips : null) ??
    summary?.totalTrips ??
    (period === 'today' ? todayStats.trips : 0);

  const periodHours = summary?.hoursOnline ?? summary?.hours ?? (period === 'today' ? todayStats.hours : 0);
  const perHourRate =
    periodHours > 0
      ? (Number(periodEarnings) / Number(periodHours)).toFixed(0)
      : (summary?.perHour ?? 0);

  // Dynamic chart data fallback structure when chartData is empty
  const chartData = useMemo(() => {
    if (Array.isArray(rawChartData) && rawChartData.length > 0) {
      return rawChartData;
    }
    if (period === 'today') {
      return [
        { day: '6am', amount: 0 },
        { day: '9am', amount: 0 },
        { day: '12pm', amount: 0 },
        { day: '3pm', amount: 0 },
        { day: '6pm', amount: 0 },
        { day: '9pm', amount: 0 },
      ];
    }
    if (period === 'month') {
      return [
        { day: 'W1', amount: 0 },
        { day: 'W2', amount: 0 },
        { day: 'W3', amount: 0 },
        { day: 'W4', amount: 0 },
      ];
    }
    if (period === 'year') {
      return [
        { day: 'Q1', amount: 0 },
        { day: 'Q2', amount: 0 },
        { day: 'Q3', amount: 0 },
        { day: 'Q4', amount: 0 },
      ];
    }
    return [
      { day: 'Mon', amount: 0 },
      { day: 'Tue', amount: 0 },
      { day: 'Wed', amount: 0 },
      { day: 'Thu', amount: 0 },
      { day: 'Fri', amount: 0 },
      { day: 'Sat', amount: 0 },
      { day: 'Sun', amount: 0 },
    ];
  }, [rawChartData, period]);

  const maxAmount = Math.max(...chartData.map((d) => Number(d.amount) || 0), 1);

  const onRefresh = () => {
    refetchEarnings();
    refetchHistory();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="pb-10"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={primary}
        />
      }
    >
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

      {/* Period Selection Tabs */}
      <View className="mx-4 mb-4 flex-row rounded-xl bg-background-muted p-1">
        {PERIOD_CONFIG.map(({ key, label }) => (
          <Button
            key={key}
            variant={period === key ? 'primary' : 'ghost'}
            size="xs"
            fullWidth={false}
            className="flex-1 px-1"
            textClassName="text-xs font-inter-semibold"
            onPress={() => dispatch(setPeriod(key))}
          >
            {label}
          </Button>
        ))}
      </View>

      {/* Dynamic Period Stats */}
      <StatGrid
        className="mx-4 mb-4"
        items={[
          {
            icon: 'cash',
            label: currentPeriodConfig.statLabel,
            value: `$${Number(periodEarnings).toFixed(2)}`,
            color: primary,
          },
          {
            icon: 'car',
            label: 'Trips',
            value: periodTrips,
            color: info,
          },
          {
            icon: 'clock-outline',
            label: 'Hours',
            value: `${periodHours}h`,
            color: success,
          },
          {
            icon: 'lightning-bolt',
            label: 'Per Hour',
            value: `$${perHourRate}`,
            color: warning,
          },
        ]}
      />

      {/* Chart Section */}
      <View className="mx-4 mb-4">
        <Text className="mb-3 text-base font-inter-bold text-foreground">
          {currentPeriodConfig.chartTitle}
        </Text>
        <View className="h-40 flex-row items-end gap-2 rounded-2xl border border-border bg-card p-4">
          {chartData.map((d, index) => {
            const barHeightPct =
              d.amount > 0 ? Math.max((d.amount / maxAmount) * 100, 8) : 4;

            return (
              <View key={`${d.day}-${index}`} className="h-full flex-1 items-center justify-end gap-1">
                <Text className="text-[9px] font-inter-semibold" style={{ color: primary }}>
                  ${d.amount}
                </Text>
                <View
                  className="w-full flex-1 overflow-hidden rounded-sm bg-background-muted"
                  style={{ justifyContent: 'flex-end' }}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#E55A25']}
                    style={{
                      width: '100%',
                      height: `${barHeightPct}%`,
                      borderRadius: 4,
                    }}
                  />
                </View>
                <Text className="text-[10px] font-inter text-foreground-muted">{d.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Trips Section */}
      <View className="mx-4 mb-4">
        <Text className="mb-3 text-base font-inter-bold text-foreground">Recent Trips</Text>
        {historyLoading && history.length === 0 ? (
          <ActivityIndicator color={primary} className="py-4" />
        ) : history.length === 0 ? (
          <Text className="text-sm font-inter text-foreground-muted">No trips yet</Text>
        ) : (
          history.slice(0, 5).map((ride, index) => {
            const destination =
              ride.destinationAddress ||
              ride.dropoffAddress ||
              ride.destination ||
              'Trip';
            const rideDate = ride.createdAt || ride.date || ride.timestamp;
            const fareAmount =
              ride.fare != null
                ? ride.fare * 0.8
                : ride.amount != null
                ? ride.amount * 0.8
                : ride.earnings ?? 0;

            return (
              <View
                key={ride.id || ride._id || `ride-${index}`}
                className="flex-row items-center justify-between border-b border-border py-3"
              >
                <View className="flex-1 flex-row items-center gap-2.5">
                  <View className="h-9.5 w-9.5 items-center justify-center rounded-[10px] bg-primary/10">
                    <Icon name="car" size={18} color={primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[13px] font-inter-medium text-foreground" numberOfLines={1}>
                      {destination}
                    </Text>
                    <Text className="mt-0.5 text-[11px] font-inter text-foreground-muted">
                      {rideDate ? new Date(rideDate).toLocaleDateString() : 'Recent'}
                    </Text>
                  </View>
                </View>
                <Text className="text-[15px] font-inter-bold text-success">
                  +${Number(fareAmount).toFixed(2)}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

