// src/components/carRental/IncomingCarRentalModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import AppModal from '@/components/ui/AppModal';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import { DEMO_DELIVERY, getCarRentalTotal } from '@/screens/main/carRental/carRentalDemo';

const COUNTDOWN_SECONDS = 20;

// One modal for both legs — `order.phase` ('delivery' | 'collection')
// drives the copy and which stop is highlighted first, instead of two
// near-identical modal components.
export default function IncomingCarRentalModal({ visible, onAccept, onDecline, order }) {
    const { colors, isDark } = useTheme();
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const timerRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(1)).current;

    const job = order || DEMO_DELIVERY;
    const isCollection = job.phase === 'collection';
    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const errorHex = isDark ? '#F87171' : '#DC2626';
    const urgentColor = countdown <= 7 ? errorHex : primaryHex;
    const total = getCarRentalTotal(job);

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

    const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    return (
        <AppModal visible={visible} onClose={handleDecline} closeOnOverlay={false} showHandle hideActions scrollable={false} className="pb-2">
            <View className="h-1 w-full rounded-full bg-background-muted overflow-hidden mb-4 -mt-1">
                <Animated.View style={{ width: progressWidth, height: '100%', backgroundColor: urgentColor, borderRadius: 999 }} />
            </View>

            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 mr-3">
                    <Text className="text-xl font-inter-bold text-foreground">
                        {isCollection ? 'Car Rental Collection' : 'Car Rental Delivery'}
                    </Text>
                    <Text className="text-sm font-inter text-foreground-muted mt-0.5">Accept before the timer runs out</Text>
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
                    <Text style={{ color: urgentColor, fontSize: 18, fontWeight: '800' }}>{countdown}s</Text>
                </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-xl border border-border bg-background-muted px-3 py-3 mb-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                    <Icon name="car-side" size={20} color={primaryHex} />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-inter-bold text-foreground" numberOfLines={1}>
                        {job.vehicle}
                    </Text>
                    <Text className="text-xs font-inter text-foreground-muted" numberOfLines={1}>
                        {job.plate} · {job.rentalPeriod}
                    </Text>
                </View>
            </View>

            <View className="gap-2.5 mb-4">
                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                        <Icon name="warehouse" size={18} color={primaryHex} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            {isCollection ? 'Return to' : 'Pick up keys at'}
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {job.depot}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-success/15 border border-success/30">
                        <Icon name="account-outline" size={18} color={isDark ? '#34D399' : '#16A34A'} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            {isCollection ? 'Collect from' : 'Deliver to'}
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {job.renterName}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5" numberOfLines={1}>
                            {job.renterAddress}
                        </Text>
                    </View>
                </View>
            </View>

            <StatRow
                className="mb-5 border border-border bg-card"
                items={[
                    { label: 'To depot', value: job.distanceToDepot },
                    { label: 'To renter', value: job.distanceToRenter },
                    { label: 'You earn', value: `$${total.toFixed(2)}` },
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
