// src/components/gig/IncomingGigJobModal.jsx
// New Gig Job offer — short description + requirements (mandatory)
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, ScrollView } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import AppModal from '@/components/ui/AppModal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import { DEMO, getJobTotal, formatMoney } from '@/screens/main/gig/gigDemo';

const COUNTDOWN_SECONDS = 25;

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
  const total = getJobTotal(job);
  const muted = isDark ? '#7DD3FC' : '#64748B';

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
    return () => clearInterval(timerRef.current);
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
      showHandle
      hideActions
      scrollable={false}
      className="pb-2"
    >
      <View className="h-1 w-full rounded-full bg-background-muted overflow-hidden mb-4 -mt-1">
        <Animated.View
          style={{
            width: progressWidth,
            height: '100%',
            backgroundColor: urgentColor,
            borderRadius: 999,
          }}
        />
      </View>

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
          <Text style={{ color: urgentColor, fontSize: 18, fontWeight: '800' }}>
            {countdown}s
          </Text>
        </View>
      </View>

      <Badge
        label={job.category}
        variant="primary"
        icon={job.categoryIcon || 'briefcase-outline'}
        shape="pill"
        size="sm"
        uppercase
        className="mb-3"
      />

      <Text className="text-base font-inter-bold text-foreground mb-1">
        {job.title}
      </Text>

      {/* Short Job Description — mandatory */}
      <Text className="text-sm font-inter text-foreground-muted mb-3 leading-5">
        {job.description}
      </Text>

      <View className="flex-row items-start gap-2 mb-3">
        <Icon name="map-marker-outline" size={16} color={muted} />
        <Text className="text-xs font-inter text-foreground-muted flex-1">
          {job.customerAddress}
        </Text>
      </View>

      {/* Requirements — mandatory */}
      {job.requirements?.length > 0 ? (
        <View className="rounded-xl border border-border bg-background-muted px-3 py-3 mb-3">
          <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-widest mb-2">
            Requirements
          </Text>
          {job.requirements.map((r) => (
            <View key={r} className="flex-row items-start gap-2 mb-1">
              <Icon name="check-circle-outline" size={14} color={primaryHex} />
              <Text className="text-sm font-inter text-foreground flex-1">
                {r}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <StatRow
        className="mb-4 border border-border bg-card"
        items={[
          { label: 'Distance', value: job.distanceToJob || '—' },
          { label: 'Duration', value: job.estimatedDuration || '—' },
          { label: 'Pay', value: formatMoney(total, job) },
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
