// src/screens/main/parcel/ParcelDeliveryScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Alert, Linking, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { setParcelOrderStatus } from '@/features/parcel/parcelSlice';
import { updateTodayStats } from '@/features/driver/driverSlice';
import {
    useScanParcelMutation,
    useCompleteParcelDeliveryMutation,
} from '@/features/parcel/parcelApi';
import { useDirections } from '@/hooks/useDirections';
import { DEMO, DEMO_DRIVER } from '@/screens/main/parcel/parcelDemo';
// Reused as-is — generic map/sheet chrome, nothing food-specific.
import { foodStyles as styles } from '@/screens/main/food/foodStyles';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ParcelMapPanel from '@/components/parcel/ParcelMapPanel';
import ParcelSheetBody from '@/components/parcel/ParcelSheetBody';

export default function ParcelDeliveryScreen({ navigation, route }) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const currentLocation = useSelector((s) => s.driver.currentLocation);

    const [scanParcel] = useScanParcelMutation();
    const [completeParcel, { isLoading }] = useCompleteParcelDeliveryMutation();

    const [step, setStep] = useState(route?.params?.initialStep ?? 'to_pickup');
    const [scannedIds, setScannedIds] = useState([]);
    const [isSigned, setIsSigned] = useState(false);
    const [neighborPhoto, setNeighborPhoto] = useState(null);
    const [neighborNote, setNeighborNote] = useState('');
    const signatureRef = useRef(null);

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = isDark ? '#34D399' : '#16A34A';

    const slideAnim = useRef(new Animated.Value(300)).current;
    const mapRef = useRef(null);

    const total = DEMO.baseFare + DEMO.perParcelBonus * DEMO.parcels.length;
    const driverCoords = currentLocation ?? DEMO_DRIVER;
    const isNavigating = step === 'to_pickup' || step === 'to_dropoff';
    const allParcelsScanned = scannedIds.length === DEMO.parcels.length;

    const destination =
        step === 'to_pickup'
            ? DEMO.senderCoords
            : step === 'to_dropoff'
                ? DEMO.recipientCoords
                : null;

    const {
        routeCoordinates,
        currentStep,
        distanceText,
        durationText,
        isLoading: routeLoading,
    } = useDirections(destination);

    const fallbackRoute =
        step === 'to_pickup'
            ? DEMO.routeToPickup
            : step === 'to_dropoff'
                ? DEMO.routeToDropoff
                : null;
    const routeCoords =
        routeCoordinates.length > 0 ? routeCoordinates : fallbackRoute;
    const routeTarget =
        step === 'to_pickup'
            ? DEMO.senderCoords
            : step === 'to_dropoff'
                ? DEMO.recipientCoords
                : null;

    const etaDuration =
        durationText ||
        (step === 'to_pickup' ? DEMO.durationToPickup : DEMO.durationToDropoff);
    const etaDistance =
        distanceText ||
        (step === 'to_pickup' ? DEMO.distanceToPickup : DEMO.distanceToDropoff);

    useEffect(() => {
        slideAnim.setValue(300);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 9,
            tension: 60,
        }).start();
    }, [step, slideAnim]);

    useEffect(() => {
        if (!mapRef.current || !routeCoords?.length) return;
        setTimeout(() => {
            mapRef.current?.fitToCoordinates(routeCoords, {
                edgePadding: { top: 100, right: 60, bottom: 320, left: 60 },
                animated: true,
            });
        }, 250);
    }, [step, routeCoords]);

    const openMaps = (coords, label) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}&travelmode=driving`;
        Linking.openURL(url).catch(() =>
            Alert.alert('Maps', `Navigate to ${label}`),
        );
    };

    const callPhone = (phone, who) => {
        Linking.openURL(`tel:${phone}`).catch(() =>
            Alert.alert('Call', `Calling ${who}…`),
        );
    };

    // Optimistic: mark scanned locally right away, sync to backend in background
    const handleScanParcel = (parcelId) => {
        setScannedIds((prev) => (prev.includes(parcelId) ? prev : [...prev, parcelId]));
        scanParcel({ orderId: DEMO.orderNumber, parcelId })
            .unwrap()
            .catch((e) => {
                console.warn('[Parcel] scan API failed', e?.message || e);
            });
    };

    const takeNeighborPhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission', 'Camera access is required for this step.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: false,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setNeighborPhoto(result.assets[0].uri);
        }
    };

    const openSummary = (summary) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'Tabs' },
                    { name: 'DeliverySummary', params: { summary } },
                ],
            }),
        );
    };

    // Optimistic: summary opens immediately and earnings are bumped in Redux
    // right away — no network wait. This ensures EarningsScreen always shows
    // the updated value even when the API call fails (demo / offline mode).
    // The onQueryStarted handler in parcelApi.js will reconcile with the server
    // total if the call succeeds; because we guard with earningsDelta (not an
    // absolute set) a successful response won't double-count.
    const goComplete = () => {
        const method =
            step === 'leave_with_neighbor' ? 'leave_with_neighbor' : 'signature';
        const summary = {
            orderNumber: DEMO.orderNumber,
            baseFare: DEMO.baseFare,
            tip: 0,
            bonus: DEMO.perParcelBonus * DEMO.parcels.length,
            total,
        };

        // Bump today's earnings immediately so EarningsScreen reflects this
        // delivery the moment the driver lands there, regardless of API result.
        dispatch(updateTodayStats({ tripsDelta: 1, earningsDelta: total }));
        dispatch(setParcelOrderStatus('completed'));

        // Navigate first — keeps the transition instant.
        openSummary(summary);

        completeParcel({
            orderId: DEMO.orderNumber,
            deliveryMethod: method,
            photoUri: neighborPhoto,
            signatureData: isSigned ? signatureRef.current?.getPaths() : null,
        })
            .unwrap()
            .catch((e) => {
                console.warn('[Parcel] complete API failed', e?.message || e);
            });
    };

    const stepMeta = {
        to_pickup: {
            title: 'Navigate to Pickup',
            subtitle: currentStep?.instruction || 'Head to the sender location',
            badge: { label: 'EN ROUTE', variant: 'primary' },
            color: primaryHex,
            cta: "I've Arrived at Pickup",
            ctaVariant: 'primary',
            ctaIcon: 'package-variant-closed',
            onCta: () => setStep('at_pickup'),
        },
        at_pickup: {
            title: 'Arrived at Pickup',
            subtitle: 'Ready to scan the parcels?',
            badge: { label: 'AT PICKUP', variant: 'warning' },
            color: warningHex,
            cta: 'Start Scanning',
            ctaVariant: 'warning',
            ctaIcon: 'barcode-scan',
            onCta: () => setStep('scanning'),
        },
        scanning: {
            title: 'Scan Parcels',
            subtitle: `${scannedIds.length} of ${DEMO.parcels.length} scanned`,
            badge: { label: 'SCANNING', variant: 'warning' },
            color: warningHex,
            cta: 'Confirm Pickup',
            ctaVariant: 'warning',
            ctaIcon: 'package-variant-closed-check',
            onCta: () => setStep('to_dropoff'),
            ctaDisabled: !allParcelsScanned,
        },
        to_dropoff: {
            title: 'Navigate to Drop-off',
            subtitle: currentStep?.instruction || 'Head to the recipient location',
            badge: { label: 'DELIVERING', variant: 'success' },
            color: successHex,
            cta: "I've Arrived at Drop-off",
            ctaVariant: 'success',
            ctaIcon: 'account-outline',
            onCta: () => setStep('at_dropoff'),
        },
        at_dropoff: {
            title: 'Arrived at Drop-off',
            subtitle: 'How will you confirm delivery?',
            badge: { label: 'AT DROP-OFF', variant: 'success' },
            color: successHex,
        },
        signature_capture: {
            title: 'Signature Capture',
            subtitle: 'Confirm once the recipient has signed',
            badge: { label: 'SIGNATURE', variant: 'success' },
            color: successHex,
            cta: 'Confirm Delivery',
            ctaVariant: 'success',
            ctaIcon: 'check-circle-outline',
            onCta: goComplete,
            ctaDisabled: !isSigned,
        },
        leave_with_neighbor: {
            title: 'Leave with Neighbor',
            subtitle: 'Take a photo as proof',
            badge: { label: 'LEFT WITH NEIGHBOR', variant: 'success' },
            color: successHex,
            cta: 'Confirm Delivery',
            ctaVariant: 'success',
            ctaIcon: 'check-circle-outline',
            onCta: goComplete,
            ctaDisabled: !neighborPhoto,
        },
    }[step];

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors?.background ?? '#060E1A',
            }}
        >
            <ParcelMapPanel
                mapRef={mapRef}
                routeCoords={routeCoords}
                routeTarget={routeTarget}
                driverCoords={driverCoords}
                stepMeta={stepMeta}
                primaryHex={primaryHex}
                warningHex={warningHex}
                successHex={successHex}
                isDark={isDark}
                isNavigating={isNavigating}
                etaDuration={etaDuration}
                routeLoading={routeLoading}
                insets={insets}
                onBack={() => navigation.goBack()}
                onOpenMaps={() =>
                    openMaps(
                        routeTarget,
                        step === 'to_pickup' ? DEMO.sender : DEMO.recipientName,
                    )
                }
            />

            <Animated.View
                style={[
                    styles.bottomSheet,
                    {
                        paddingBottom: insets.bottom + 16,
                        backgroundColor: isDark ? '#0D1E32' : '#FFFFFF',
                        borderTopColor: isDark ? '#1E3A5F' : '#BAE6FD',
                        transform: [{ translateY: slideAnim }],
                        maxHeight: '55%',
                    },
                ]}
            >
                <View style={styles.dragHandle} />

                <View style={[styles.statusRow, { borderLeftColor: stepMeta.color }]}>
                    <View className="flex-1 pr-2">
                        <Text
                            style={[
                                styles.stepTitle,
                                { color: isDark ? '#F0F9FF' : '#0F172A' },
                            ]}
                        >
                            {stepMeta.title}
                        </Text>
                        <Text
                            style={[
                                styles.stepSubtitle,
                                { color: isDark ? '#7DD3FC' : '#64748B' },
                            ]}
                            numberOfLines={2}
                        >
                            {stepMeta.subtitle}
                        </Text>
                    </View>
                    <Badge label={stepMeta.badge.label} variant={stepMeta.badge.variant} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
                >
                    <ParcelSheetBody
                        step={step}
                        setStep={setStep}
                        primaryHex={primaryHex}
                        warningHex={warningHex}
                        successHex={successHex}
                        colors={colors}
                        isDark={isDark}
                        etaDistance={etaDistance}
                        etaDuration={etaDuration}
                        total={total}
                        routeLoading={routeLoading}
                        scannedIds={scannedIds}
                        onScanParcel={handleScanParcel}
                        signatureRef={signatureRef}
                        onSignatureChange={setIsSigned}
                        neighborPhoto={neighborPhoto}
                        takeNeighborPhoto={takeNeighborPhoto}
                        neighborNote={neighborNote}
                        setNeighborNote={setNeighborNote}
                        callPhone={callPhone}
                    />
                </ScrollView>

                {stepMeta.cta && (
                    <Button
                        variant={stepMeta.ctaVariant}
                        leftIcon={stepMeta.ctaIcon}
                        onPress={stepMeta.onCta}
                        disabled={stepMeta.ctaDisabled || isLoading}
                    >
                        {isLoading ? 'Please wait…' : stepMeta.cta}
                    </Button>
                )}
            </Animated.View>
        </View>
    );
}