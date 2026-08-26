// src/components/IncomingFoodDeliveryModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import AppModal from '@/components/ui/AppModal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import IconButton from '@/components/ui/IconButton';

// ─── Static demo order ───────────────────────────────────────────────────────
const DEMO_ORDER = {
    restaurant: "Hungry Jack's",
    restaurantSubtitle: '283 Crown St, Surry Hills NSW 2010',
    customerArea: 'Redfern, NSW',
    distance: '3.4 km',
    duration: '12 min',
    earnings: '$8.50',
    items: 2,
    orderType: 'FOOD DELIVERY',
};

const COUNTDOWN_SECONDS = 20;

/**
 * IncomingFoodDeliveryModal
 *
 * Props:
 * - visible: boolean
 * - onAccept: () => void    — called when driver taps Accept
 * - onDecline: () => void   — called when driver taps Decline or timer expires
 */
export default function IncomingFoodDeliveryModal({ visible, onAccept, onDecline }) {
    const { colors, isDark } = useTheme();
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const timerRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(1)).current;

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const errorHex = isDark ? '#F87171' : '#DC2626';
    const urgentColor = countdown <= 7 ? errorHex : primaryHex;

    // Reset + start countdown each time modal opens
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
            hideActions            // we render our own footer inside children
            scrollable={false}
            className="pb-2"
        >
            {/* ── Countdown progress bar ── */}
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

            {/* ── Header: title + countdown badge ── */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 mr-3">
                    <Text className="text-xl font-inter-bold text-foreground">
                        New Food Delivery
                    </Text>
                    <Text className="text-sm font-inter text-foreground-muted mt-0.5">
                        Accept before the timer runs out
                    </Text>
                </View>

                {/* Countdown circle */}
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

            {/* ── Order type badge ── */}
            <Badge
                label={DEMO_ORDER.orderType}
                variant="warning"
                icon="food"
                shape="pill"
                size="sm"
                uppercase
                className="mb-4"
            />

            {/* ── Map placeholder ── */}
            <View className="h-36 rounded-2xl border border-border bg-background-muted items-center justify-center mb-4 overflow-hidden">
                <Icon name="map-outline" size={40} color={primaryHex} />
                <Text className="text-xs font-inter text-foreground-muted mt-2">
                    Map preview
                </Text>
            </View>

            {/* ── Restaurant & customer info ── */}
            <View className="gap-2.5 mb-4">
                {/* Restaurant row */}
                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-warning/15 border border-warning/30">
                        <Icon name="storefront-outline" size={18} color={isDark ? '#FBBF24' : '#D97706'} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            Restaurant (Pickup)
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {DEMO_ORDER.restaurant}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5" numberOfLines={1}>
                            {DEMO_ORDER.restaurantSubtitle}
                        </Text>
                    </View>
                </View>

                {/* Customer row */}
                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                        <Icon name="account-outline" size={18} color={primaryHex} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            Customer (Drop-off)
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {DEMO_ORDER.customerArea}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5">
                            {DEMO_ORDER.items} item{DEMO_ORDER.items !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
            </View>

            {/* ── Stats row: Distance · Duration · Earnings ── */}
            <StatRow
                className="mb-5 border border-border bg-card"
                items={[
                    { label: 'Distance', value: DEMO_ORDER.distance },
                    { label: 'Est. Time', value: DEMO_ORDER.duration },
                    { label: 'Earnings', value: DEMO_ORDER.earnings },
                ]}
            />

            {/* ── Accept / Decline buttons ── */}
            <View className="flex-row gap-3">
                <View className="flex-1">
                    <Button
                        variant="outline"
                        leftIcon="close"
                        onPress={handleDecline}
                    >
                        Decline
                    </Button>
                </View>
                <View className="flex-1">
                    <Button
                        variant="primary"
                        leftIcon="check"
                        onPress={handleAccept}
                    >
                        Accept
                    </Button>
                </View>
            </View>
        </AppModal>
    );
}
