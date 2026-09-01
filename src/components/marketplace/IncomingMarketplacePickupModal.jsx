// src/components/marketplace/IncomingMarketplacePickupModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import AppModal from '@/components/ui/AppModal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import { DEMO, getPickupTotal } from '@/screens/main/marketplace/marketplaceDemo';

const COUNTDOWN_SECONDS = 20;

export default function IncomingMarketplacePickupModal({
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
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const errorHex = isDark ? '#F87171' : '#DC2626';
    const urgentColor = countdown <= 7 ? errorHex : primaryHex;
    const total = getPickupTotal(job);

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
                        New Marketplace Pickup
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

            {/* Item thumbnail + price — the one thing food/parcel/gig offers don't have */}
            <View className="flex-row items-center gap-3 rounded-xl border border-border bg-background-muted px-3 py-3 mb-3">
                <View
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        overflow: 'hidden',
                        backgroundColor: isDark ? '#0A1628' : '#E8EEF5',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {job.itemPhotoUri ? (
                        <Image source={{ uri: job.itemPhotoUri }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <Icon name="image-outline" size={22} color={isDark ? '#7DD3FC' : '#64748B'} />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-inter-bold text-foreground" numberOfLines={1}>
                        {job.itemTitle}
                    </Text>
                    <Text className="text-xs font-inter text-foreground-muted" numberOfLines={1}>
                        {job.listingSource} · from {job.seller}
                    </Text>
                </View>
                <Text className="text-sm font-inter-bold text-foreground">
                    ${job.itemPrice.toFixed(2)}
                </Text>
            </View>

            {job.paymentMode !== 'prepaid' && (
                <Badge
                    label={`Collect $${job.itemPrice.toFixed(2)} ${job.paymentMode === 'cod_card' ? 'card' : 'cash'} at drop-off`}
                    variant="warning"
                    icon="cash-multiple"
                    shape="pill"
                    size="sm"
                    className="mb-3"
                />
            )}

            <View className="gap-2.5 mb-4">
                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-warning/15 border border-warning/30">
                        <Icon name="tag-outline" size={18} color={warningHex} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            Seller (Pickup)
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {job.seller}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5" numberOfLines={1}>
                            {job.sellerAddress}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                        <Icon name="account-outline" size={18} color={primaryHex} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            Buyer (Drop-off)
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {job.buyerName}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5" numberOfLines={1}>
                            {job.buyerAddress}
                        </Text>
                    </View>
                </View>
            </View>

            <StatRow
                className="mb-5 border border-border bg-card"
                items={[
                    { label: 'Pickup', value: job.distanceToPickup },
                    { label: 'Drop-off', value: job.distanceToDropoff },
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
