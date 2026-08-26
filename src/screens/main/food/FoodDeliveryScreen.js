// src/screens/main/food/FoodDeliveryScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Animated,
    Alert,
    Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import IconButton from '@/components/ui/IconButton';
import StatRow from '@/components/ui/StatRow';

// ─── Static demo data ─────────────────────────────────────────────────────────
const DEMO = {
    restaurant: "Hungry Jack's",
    restaurantAddress: '283 Crown St, Surry Hills NSW 2010',
    // Surry Hills, Sydney
    restaurantCoords: { latitude: -33.8842, longitude: 151.2101 },
    customerArea: 'Redfern, NSW',
    distance: '3.4 km',
    duration: '12 min',
    earnings: '$8.50',
    items: 2,
};

// ─── Step config ──────────────────────────────────────────────────────────────
const STEP_CONFIG = {
    navigating: {
        badgeLabel: 'EN ROUTE',
        badgeVariant: 'primary',
        title: 'Navigate to Restaurant',
        subtitle: 'Head to the pickup location',
        btnLabel: "I've Arrived at Restaurant",
        btnVariant: 'primary',
        btnIcon: 'storefront-outline',
        borderColor: null, // resolved from theme
    },
    pickup: {
        badgeLabel: 'AT RESTAURANT',
        badgeVariant: 'warning',
        title: 'Confirm Pickup',
        subtitle: 'Collect the order and confirm',
        btnLabel: 'Confirm Pickup',
        btnVariant: 'success',
        btnIcon: 'package-variant-closed-check',
        borderColor: null,
    },
};

export default function FoodDeliveryScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [step, setStep] = useState('navigating'); // 'navigating' | 'pickup'

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = isDark ? '#34D399' : '#16A34A';

    const slideAnim = useRef(new Animated.Value(300)).current;
    const mapRef = useRef(null);

    // Step-specific colours
    const stepColor = step === 'navigating' ? primaryHex : warningHex;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
        }).start();

        // Pan map to restaurant
        setTimeout(() => {
            mapRef.current?.animateToRegion(
                {
                    ...DEMO.restaurantCoords,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                },
                800,
            );
        }, 400);
    }, []);

    const handlePrimary = () => {
        if (step === 'navigating') {
            setStep('pickup');
        } else if (step === 'pickup') {
            Alert.alert(
                'Pickup Confirmed',
                'Order collected! Head to the customer.',
                [{ text: 'OK', onPress: () => console.log('[Food] Pickup confirmed → next step') }],
            );
        }
    };

    const openNavigation = () => {
        const { latitude, longitude } = DEMO.restaurantCoords;
        const url = `google.navigation:q=${latitude},${longitude}&mode=d`;
        const geo = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
        Linking.canOpenURL(url)
            .then((ok) => Linking.openURL(ok ? url : geo))
            .catch(() =>
                Alert.alert('Navigation unavailable', 'Please install Google Maps.'),
            );
    };

    const cfg = STEP_CONFIG[step];

    return (
        <View className="flex-1 bg-background">
            {/* ── Map ── */}
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                showsUserLocation
                showsMyLocationButton={false}
                initialRegion={{
                    ...DEMO.restaurantCoords,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                }}
            >
                {/* Restaurant marker */}
                <Marker coordinate={DEMO.restaurantCoords} title={DEMO.restaurant}>
                    <View
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: step === 'navigating'
                                ? `${primaryHex}30`
                                : `${warningHex}30`,
                            borderWidth: 2,
                            borderColor: step === 'navigating' ? primaryHex : warningHex,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon
                            name="storefront-outline"
                            size={20}
                            color={step === 'navigating' ? primaryHex : warningHex}
                        />
                    </View>
                </Marker>
            </MapView>

            {/* ── Screen header (floats over map) ── */}
            <View className="absolute top-0 left-0 right-0">
                <ScreenHeader
                    title="Food Delivery"
                    onBack={() => navigation.goBack()}
                />
            </View>

            {/* ── Navigation FAB ── */}
            <View className="absolute right-5" style={{ bottom: 310 }}>
                <IconButton
                    icon="navigation"
                    onPress={openNavigation}
                    size={52}
                    iconSize={22}
                    variant="primary"
                />
            </View>

            {/* ── Sliding bottom panel ── */}
            <Animated.View
                className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-border bg-card px-5 pb-10 pt-5 gap-4"
                style={{
                    transform: [{ translateY: slideAnim }],
                    shadowColor: colors?.foreground ?? '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: isDark ? 0.4 : 0.12,
                    elevation: 20,
                }}
            >
                {/* Status header row */}
                <View
                    className="flex-row items-center justify-between border-l-[3px] pl-3"
                    style={{ borderLeftColor: stepColor }}
                >
                    <View className="flex-1 mr-3">
                        <Text className="text-lg font-inter-bold text-foreground">
                            {cfg.title}
                        </Text>
                        <Text className="text-[13px] font-inter text-foreground-muted mt-0.5">
                            {cfg.subtitle}
                        </Text>
                    </View>
                    <Badge
                        label={cfg.badgeLabel}
                        variant={cfg.badgeVariant}
                        size="sm"
                        uppercase
                    />
                </View>

                {/* Restaurant info card */}
                <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-background-muted px-4 py-3">
                    <View
                        className="h-11 w-11 items-center justify-center rounded-full"
                        style={{
                            backgroundColor: step === 'navigating'
                                ? `${primaryHex}20`
                                : `${warningHex}20`,
                            borderWidth: 1,
                            borderColor: step === 'navigating'
                                ? `${primaryHex}40`
                                : `${warningHex}40`,
                        }}
                    >
                        <Icon
                            name="storefront-outline"
                            size={20}
                            color={step === 'navigating' ? primaryHex : warningHex}
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-base font-inter-semibold text-foreground" numberOfLines={1}>
                            {DEMO.restaurant}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5" numberOfLines={1}>
                            {DEMO.restaurantAddress}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-0.5">
                            {DEMO.items} item{DEMO.items !== 1 ? 's' : ''} · {DEMO.customerArea}
                        </Text>
                    </View>
                </View>

                {/* Stats row */}
                <StatRow
                    className="border border-border bg-card"
                    items={[
                        { label: 'Distance', value: DEMO.distance },
                        { label: 'Est. Time', value: DEMO.duration },
                        { label: 'Earnings', value: DEMO.earnings },
                    ]}
                />

                {/* Primary CTA */}
                <Button
                    variant={cfg.btnVariant}
                    leftIcon={cfg.btnIcon}
                    onPress={handlePrimary}
                >
                    {cfg.btnLabel}
                </Button>
            </Animated.View>
        </View>
    );
}