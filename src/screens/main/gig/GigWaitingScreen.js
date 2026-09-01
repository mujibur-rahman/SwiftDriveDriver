// src/screens/main/gig/GigWaitingScreen.js
// Waiting for Customer Confirmation — auto-approve demo (real: 24h)
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useTheme } from '@/theme';
import Button from '@/components/ui/Button';
import StatusBanner from '@/components/ui/StatusBanner';
import { setGigOrderStatus } from '@/features/gig/gigSlice';
import { formatMoney } from '@/screens/main/gig/gigDemo';

/** Demo auto-approve seconds (production = 24h) */
const AUTO_APPROVE_SECONDS = 10;

export default function GigWaitingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const summary = route?.params?.summary;
  const job = route?.params?.job;

  const [secondsLeft, setSecondsLeft] = useState(AUTO_APPROVE_SECONDS);
  const pulse = useRef(new Animated.Value(1)).current;
  const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
  const successHex = isDark ? '#34D399' : '#16A34A';

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          goPayment();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const goPayment = () => {
    dispatch(setGigOrderStatus('completed'));
    navigation.replace('GigComplete', { summary, job });
  };

  const onDispute = () => {
    Alert.alert(
      'Open support chat?',
      'A support agent will review this job if the customer disputes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open chat',
          onPress: () =>
            Alert.alert('Support', 'Support chat would open here.'),
        },
      ],
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 20,
      }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View className="flex-1 items-center justify-center">
        <Animated.View
          style={{
            transform: [{ scale: pulse }],
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: `${primaryHex}22`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <ActivityIndicator size="large" color={primaryHex} />
        </Animated.View>

        <Text className="text-xl font-inter-bold text-foreground text-center">
          Customer is reviewing…
        </Text>
        <Text className="text-sm font-inter text-foreground-muted text-center mt-2 px-4">
          Waiting for customer confirmation.
          {'\n'}If not confirmed within 24 hours, the job is auto-approved.
        </Text>

        <View className="mt-6 w-full">
          <StatusBanner
            variant="info"
            icon="timer-sand"
            title={`Demo auto-approve in ${secondsLeft}s`}
            message="Production uses a 24-hour window before auto-approve."
          />
        </View>

        {summary ? (
          <View className="mt-6 w-full rounded-2xl border border-border bg-card px-4 py-4">
            <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-widest mb-2">
              Submitted job
            </Text>
            <Text className="text-base font-inter-bold text-foreground">
              {summary.title || summary.orderNumber}
            </Text>
            <Text className="text-sm font-inter text-foreground-muted mt-1">
              #{summary.orderNumber}
            </Text>
            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-sm font-inter text-foreground-muted">
                Expected payout
              </Text>
              <Text
                className="text-lg font-inter-bold"
                style={{ color: successHex }}
              >
                {formatMoney(summary.total, {
                  currencySymbol: summary.currencySymbol || '$',
                })}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="gap-3">
        <Button variant="outline" leftIcon="message-alert-outline" onPress={onDispute}>
          Dispute / Support chat
        </Button>
        <Button variant="ghost" onPress={goPayment}>
          Skip wait (demo)
        </Button>
      </View>
    </View>
  );
}
