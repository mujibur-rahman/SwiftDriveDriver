// src/screens/main/gig/GigCompleteScreen.js
// Payment & Rating — Job Completed Successfully
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/theme';
import Button from '@/components/ui/Button';
import AppTextInput from '@/components/ui/AppTextInput';
import { useGetEarningsQuery } from '@/features/earnings/earningsApi';
import { useConfirmGigCompletionMutation } from '@/features/gig/gigApi';
import { clearActiveGigOrder } from '@/features/gig/gigSlice';
import { formatMoney } from '@/screens/main/gig/gigDemo';

export default function GigCompleteScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const todayStats = useSelector((s) => s.driver.todayStats);
  const [confirmGig] = useConfirmGigCompletionMutation();

  const summary = route?.params?.summary ?? {
    orderNumber: '—',
    baseFare: 0,
    tip: 0,
    bonus: 0,
    extraTotal: 0,
    total: 0,
    currencySymbol: '$',
  };

  const sym = summary.currencySymbol || '$';
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const successHex = isDark ? '#34D399' : '#16A34A';
  const muted = isDark ? '#7DD3FC' : '#64748B';
  const starActive = '#FBBF24';
  const starIdle = isDark ? '#334155' : '#CBD5E1';

  const { data: earnings } = useGetEarningsQuery(
    { period: 'today' },
    { refetchOnMountOrArgChange: true },
  );
  const todayTotal =
    earnings?.summary?.totalBalance ??
    earnings?.summary?.todayEarnings ??
    todayStats.earnings;

  const rows = [
    { label: 'Base fare', value: summary.baseFare },
    { label: 'Tip', value: summary.tip },
    { label: 'Bonus', value: summary.bonus },
    { label: 'Extra work', value: summary.extraTotal },
  ].filter((r) => r.value != null && r.value !== 0);

  const submitRating = async () => {
    setSubmitted(true);
    try {
      await confirmGig({
        orderId: summary.orderNumber,
        rating,
        review: review.trim() || null,
      }).unwrap();
    } catch (e) {
      console.warn('[GigComplete] confirm failed', e?.message || e);
    }
  };

  const goHome = () => {
    dispatch(clearActiveGigOrder());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      }),
    );
  };

  const goEarnings = () => {
    dispatch(clearActiveGigOrder());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Tabs',
            state: {
              routes: [
                { name: 'Home' },
                { name: 'Driver' },
                { name: 'Earnings' },
                { name: 'Profile' },
              ],
              index: 2,
            },
          },
        ],
      }),
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center py-6">
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: `${successHex}22`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Icon name="check-circle" size={40} color={successHex} />
          </View>
          <Text className="text-xl font-inter-bold text-foreground">
            Job Completed Successfully!
          </Text>
          <Text className="text-xs font-inter text-foreground-muted mt-1">
            #{summary.orderNumber}
            {summary.title ? ` · ${summary.title}` : ''}
          </Text>
        </View>

        <View className="rounded-2xl border border-border bg-card px-4 py-4 gap-3 mb-4">
          <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
            Payment
          </Text>
          {rows.map((r) => (
            <View key={r.label} className="flex-row justify-between">
              <Text className="text-sm font-inter text-foreground-muted">
                {r.label}
              </Text>
              <Text className="text-sm font-inter-semibold text-foreground">
                {formatMoney(r.value, { currencySymbol: sym })}
              </Text>
            </View>
          ))}
          <View className="h-px bg-border" />
          <View className="flex-row justify-between">
            <Text className="text-base font-inter-bold text-foreground">
              Total received
            </Text>
            <Text
              className="text-base font-inter-bold"
              style={{ color: successHex }}
            >
              {formatMoney(summary.total, { currencySymbol: sym })}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Icon name="wallet-outline" size={16} color={successHex} />
            <Text className="text-xs font-inter text-foreground-muted">
              Added to wallet · Today{' '}
              {formatMoney(todayTotal || 0, { currencySymbol: sym })}
            </Text>
          </View>
        </View>

        <View className="rounded-2xl border border-border bg-card px-4 py-4 mb-4">
          <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider mb-3">
            Rate customer
          </Text>
          <View className="flex-row items-center justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => !submitted && setRating(n)}
                activeOpacity={0.7}
                disabled={submitted}
              >
                <Icon
                  name={n <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={n <= rating ? starActive : starIdle}
                />
              </TouchableOpacity>
            ))}
          </View>
          {!submitted ? (
            <>
              <AppTextInput
                value={review}
                onChangeText={setReview}
                placeholder="Write a short review…"
                multiline
                numberOfLines={3}
                minHeight={80}
              />
              <View className="mt-3">
                <Button variant="primary" size="sm" onPress={submitRating}>
                  Submit rating
                </Button>
              </View>
            </>
          ) : (
            <View className="flex-row items-center justify-center gap-2 mt-1">
              <Icon name="check" size={16} color={successHex} />
              <Text
                className="text-sm font-inter-semibold"
                style={{ color: successHex }}
              >
                Thanks for your feedback
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-5 gap-3">
        <Button variant="primary" leftIcon="cash" onPress={goEarnings}>
          View all Earnings
        </Button>
        <Button variant="outline" onPress={goHome}>
          Back to home
        </Button>
      </View>
    </View>
  );
}
