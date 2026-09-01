// src/components/gig/IncomingGigJobModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import AppModal from '@/components/ui/AppModal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import { DEMO } from '@/screens/main/gig/gigDemo';

const COUNTDOWN_SECONDS = 25;

/**
 * IncomingGigJobModal
 *
 * Props:
 * - visible: boolean
 * - onAccept: () => void
 * - onDecline: () => void
 * - order?: override demo payload (optional)
 */
export default function IncomingGigJobModal({
  visible,
  onAccept,
  onDecline,
  order,
}) {
  const { colors, isDark } = useTheme();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const job = order || DEMO;
  const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
  const errorHex = isDark ? '#F87171' : '#DC2626';
  const urgentColor = countdown <= 7 ? errorHex : primaryHex;
  const total = (job.baseFare || 0) + (job.tip || 0) + (job.bonus || 0);

  useEffect(() => {
    if (!visible) return;

    setCountdown(COUNTDOWN_SECONDS);
    progressAnim.setValue(1);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: COUNTDOWN_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          onDecline?.();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [visible]);

  const handleAccept = () => {
    clearInterval(timerRef.current);
    onAccept?.();
  };

  const handleDecline = () => {
    clearInterval(timerRef.current);
    onDecline?.();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <AppModal
      visible={visible}
      onClose={handleDecline}
      closeOnOverlay={false}
      showHandle={true}
      hideActions
      scrollable={false}
      className="pb-2"
    >
      {/* Countdown progress bar */}
      <View className="h-1 w-full rounded-full bg-background-muted overflow-hidden mb-5 -mt-1">
        <Animated.View
          style={{
            width: progressWidth,
            height: '100%',
            backgroundColor: urgentColor,
            borderRadius: 999,
          }}
        />
      </View>

      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-xl font-inter-bold text-foreground">
            New Gig Job
          </Text>
          <Text className="text-sm font-inter text-foreground-muted mt-0.5">
            Accept before the timer runs out
          </Text>
        </View>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            borderWidth: 3,
            borderColor: urgentColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: urgentColor,
              fontSize: 18,
              fontWeight: '800',
            }}
          >
            {countdown}s
          </Text>
        </View>
      </View>

      <Badge
        label={job.category || 'GIG JOB'}
        variant="primary"
        icon={job.categoryIcon || 'briefcase-outline'}
        shape="pill"
        size="sm"
        uppercase
        className="mb-4"
      />

      {/* Job site info */}
      <View className="gap-2.5 mb-4">
        <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${primaryHex}26`,
              borderWidth: 1,
              borderColor: `${primaryHex}4D`,
            }}
          >
            <Icon
              name={job.categoryIcon || 'briefcase-outline'}
              size={18}
              color={primaryHex}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
              Job site
            </Text>
            <Text
              className="text-sm font-inter-bold text-foreground mt-0.5"
              numberOfLines={1}
            >
              {job.title}
            </Text>
            <Text
              className="text-xs font-inter text-foreground-muted mt-0.5"
              numberOfLines={2}
            >
              {job.customerAddress}
            </Text>
          </View>
        </View>

        <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
            <Icon name="account-outline" size={18} color={primaryHex} />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
              Customer
            </Text>
            <Text
              className="text-sm font-inter-bold text-foreground mt-0.5"
              numberOfLines={1}
            >
              {job.customerName}
            </Text>
            <Text className="text-xs font-inter text-foreground-muted mt-0.5">
              {job.scheduledAt || 'ASAP'} · {job.estimatedDuration || ''}
            </Text>
          </View>
        </View>
      </View>

      <StatRow
        className="mb-5 border border-border bg-card"
        items={[
          { label: 'Distance', value: job.distanceToJob || '—' },
          { label: 'ETA', value: job.durationToJob || '—' },
          { label: 'Earnings', value: `$${Number(total).toFixed(2)}` },
        ]}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="outline" leftIcon="close" onPress={handleDecline}>
            Decline
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="primary" leftIcon="check" onPress={handleAccept}>
            Accept
          </Button>
        </View>
      </View>
    </AppModal>
  );
}
