// src/components/parcel/IncomingParcelDeliveryModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import AppModal from '@/components/ui/AppModal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';

// ─── Static demo order ───────────────────────────────────────────────────────
const DEMO_ORDER = {
    sender: 'QuickShip Warehouse',
    senderSubtitle: '12 Industrial Ave, Alexandria NSW 2015',
    recipientArea: 'Redfern, NSW',
    distance: '4.2 km',
    duration: '11 min',
    earnings: '$12.00',
    parcels: 2,
    orderType: 'PARCEL DELIVERY',
};

const COUNTDOWN_SECONDS = 20;

/**
 * IncomingParcelDeliveryModal
 *
 * Props:
 * - visible: boolean
 * - onAccept: () => void    — called when driver taps Accept
 * - onDecline: () => void   — called when driver taps Decline or timer expires
 */
export default function IncomingParcelDeliveryModal({ visible, onAccept, onDecline }) {
    const { colors, isDark } = useTheme();
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const timerRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(1)).current;

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const errorHex = isDark ? '#F87171' : '#DC2626';
    const urgentColor = countdown <= 7 ? errorHex : primaryHex;

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

            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 mr-3">
                    <Text className="text-xl font-inter-bold text-foreground">
                        New Parcel Delivery
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
                label={DEMO_ORDER.orderType}
                variant="warning"
                icon="package-variant-closed"
                shape="pill"
                size="sm"
                uppercase
                className="mb-4"
            />

            <View className="gap-2.5 mb-4">
                {/* Sender row */}
                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-warning/15 border border-warning/30">
                        <Icon name="package-variant-closed" size={18} color={isDark ? '#FBBF24' : '#D97706'} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            Sender (Pickup)
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {DEMO_ORDER.sender}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5" numberOfLines={1}>
                            {DEMO_ORDER.senderSubtitle}
                        </Text>
                    </View>
                </View>

                {/* Recipient row */}
                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                        <Icon name="account-outline" size={18} color={primaryHex} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            Recipient (Drop-off)
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {DEMO_ORDER.recipientArea}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5">
                            {DEMO_ORDER.parcels} parcel{DEMO_ORDER.parcels !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
            </View>

            <StatRow
                className="mb-5 border border-border bg-card"
                items={[
                    { label: 'Distance', value: DEMO_ORDER.distance },
                    { label: 'Est. Time', value: DEMO_ORDER.duration },
                    { label: 'Earnings', value: DEMO_ORDER.earnings },
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
