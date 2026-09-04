// src/components/carInsurance/IncomingInsuranceInspectionModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import AppModal from '@/components/ui/AppModal';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import { DEMO_PRE_POLICY, getCarInsuranceTotal } from '@/screens/main/carInsurance/carInsuranceDemo';

const COUNTDOWN_SECONDS = 20;

// One modal for both inspection types — `order.phase` ('pre_policy' |
// 'claim') drives the copy, instead of two near-identical components.
export default function IncomingInsuranceInspectionModal({ visible, onAccept, onDecline, order }) {
    const { colors, isDark } = useTheme();
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const timerRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(1)).current;

    const job = order || DEMO_PRE_POLICY;
    const isClaim = job.phase === 'claim';
    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const errorHex = isDark ? '#F87171' : '#DC2626';
    const urgentColor = countdown <= 7 ? errorHex : primaryHex;
    const total = getCarInsuranceTotal(job);

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
                        {isClaim ? 'Claim Inspection' : 'Policy Inspection'}
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
                    <Icon name={isClaim ? 'car-emergency' : 'shield-check-outline'} size={20} color={primaryHex} />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-inter-bold text-foreground" numberOfLines={1}>
                        {job.vehicle}
                    </Text>
                    <Text className="text-xs font-inter text-foreground-muted" numberOfLines={1}>
                        {job.plate} · {isClaim ? job.claimNumber : job.policyNumber}
                    </Text>
                </View>
            </View>

            {isClaim && job.incidentSummary && (
                <View className="flex-row items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3 mb-3">
                    <Icon name="alert-outline" size={16} color={isDark ? '#FBBF24' : '#D97706'} style={{ marginTop: 1 }} />
                    <Text className="flex-1 text-xs font-inter text-foreground-muted leading-4.5">{job.incidentSummary}</Text>
                </View>
            )}

            <View className="gap-2.5 mb-4">
                <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background-muted px-4 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-success/15 border border-success/30">
                        <Icon name="account-outline" size={18} color={isDark ? '#34D399' : '#16A34A'} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            {isClaim ? 'Claimant' : 'Owner'}
                        </Text>
                        <Text className="text-sm font-inter-bold text-foreground mt-0.5" numberOfLines={1}>
                            {isClaim ? job.claimantName : job.ownerName}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5" numberOfLines={1}>
                            {isClaim ? job.claimantAddress : job.ownerAddress}
                        </Text>
                    </View>
                </View>
            </View>

            <StatRow
                className="mb-5 border border-border bg-card"
                items={[
                    { label: 'Distance', value: isClaim ? job.distanceToClaimant : job.distanceToOwner },
                    { label: 'Est. time', value: isClaim ? job.durationToClaimant : job.durationToOwner },
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
