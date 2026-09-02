// src/screens/main/marketplace/MarketplacePickupScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Alert, Linking, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { setMarketplaceOrderStatus } from '@/features/marketplace/marketplaceSlice';
import { updateTodayStats } from '@/features/driver/driverSlice';
import {
    useConfirmPickupCodeMutation,
    useVerifyMarketplaceItemMutation,
    useCollectMarketplacePaymentMutation,
    useCompleteMarketplacePickupMutation,
} from '@/features/marketplace/marketplaceApi';
import { useDirections } from '@/hooks/useDirections';
import { DEMO, DEMO_DRIVER, getPickupTotal } from '@/screens/main/marketplace/marketplaceDemo';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import MarketplaceMapPanel from '@/components/marketplace/MarketplaceMapPanel';
import MarketplaceSheetBody from '@/components/marketplace/MarketplaceSheetBody';

export default function MarketplacePickupScreen({ navigation, route }) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const currentLocation = useSelector((s) => s.driver.currentLocation);
    const activeOrder = useSelector((s) => s.marketplace.activeOrder);

    const job = route?.params?.job || activeOrder || DEMO;

    const [confirmPickupCode] = useConfirmPickupCodeMutation();
    const [verifyItem] = useVerifyMarketplaceItemMutation();
    const [collectPayment] = useCollectMarketplacePaymentMutation();
    const [completePickup, { isLoading }] = useCompleteMarketplacePickupMutation();

    const [step, setStep] = useState(route?.params?.initialStep ?? 'to_pickup');
    const [itemPhoto, setItemPhoto] = useState(null);
    const [codeConfirmed, setCodeConfirmed] = useState(false);
    const [handoffPhoto, setHandoffPhoto] = useState(null);
    const [paymentCollected, setPaymentCollected] = useState(false);
    // Step history stack — same back-button pattern as parcel/gig.
    const stepHistoryRef = useRef([]);

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = isDark ? '#34D399' : '#16A34A';

    const slideAnim = useRef(new Animated.Value(300)).current;
    const mapRef = useRef(null);

    const total = getPickupTotal(job);
    const driverCoords = currentLocation ?? DEMO_DRIVER;
    const isNavigating = step === 'to_pickup' || step === 'to_dropoff';
    const isCod = job.paymentMode !== 'prepaid';

    const destination =
        step === 'to_pickup'
            ? job.sellerCoords
            : step === 'to_dropoff'
                ? job.buyerCoords
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
            ? job.routeToPickup || DEMO.routeToPickup
            : step === 'to_dropoff'
                ? job.routeToDropoff || DEMO.routeToDropoff
                : null;
    const routeCoords =
        routeCoordinates.length > 0 ? routeCoordinates : fallbackRoute;
    const routeTarget =
        step === 'to_pickup'
            ? job.sellerCoords
            : step === 'to_dropoff'
                ? job.buyerCoords
                : null;

    const etaDuration =
        durationText ||
        (step === 'to_pickup' ? job.durationToPickup : job.durationToDropoff);
    const etaDistance =
        distanceText ||
        (step === 'to_pickup' ? job.distanceToPickup : job.distanceToDropoff);

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

    const goToStep = (next) => {
        stepHistoryRef.current.push(step);
        setStep(next);
    };

    const handleBack = () => {
        if (stepHistoryRef.current.length > 0) {
            setStep(stepHistoryRef.current.pop());
        } else {
            navigation.goBack();
        }
    };

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

    const takePhoto = async (setter) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow camera access to take this photo.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setter(result.assets[0].uri);
        }
    };

    // Optimistic toggle — same fire-and-forget pattern as onTogglePaymentCollected.
    const onToggleCodeConfirmed = () => {
        const next = !codeConfirmed;
        setCodeConfirmed(next);
        if (next) {
            confirmPickupCode({ orderId: job.orderNumber, code: job.pickupCode })
                .unwrap()
                .catch((e) => console.warn('[Marketplace] confirm-code failed', e?.message || e));
        }
    };

    // Optimistic: item is marked verified locally right away, background
    // sync only — same fire-and-forget pattern as parcel's scanParcel.
    const takeItemPhoto = () =>
        takePhoto((uri) => {
            setItemPhoto(uri);
            verifyItem({ orderId: job.orderNumber, itemPhotoUri: uri })
                .unwrap()
                .catch((e) => console.warn('[Marketplace] verify-item failed', e?.message || e));
        });

    const takeHandoffPhoto = () => takePhoto(setHandoffPhoto);

    const onTogglePaymentCollected = () => {
        const next = !paymentCollected;
        setPaymentCollected(next);
        if (next) {
            collectPayment({
                orderId: job.orderNumber,
                amount: job.itemPrice,
                method: job.paymentMode === 'cod_card' ? 'card' : 'cash',
            })
                .unwrap()
                .catch((e) => console.warn('[Marketplace] collect-payment failed', e?.message || e));
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

    // Optimistic: summary opens immediately, earnings bumped right away —
    // same convention as ParcelDeliveryScreen.goComplete(). The item price
    // collected from the buyer is reported separately as cashCollected and
    // deliberately excluded from `total` (it isn't the driver's money).
    const goComplete = () => {
        const summary = {
            orderNumber: job.orderNumber,
            baseFare: job.baseFare,
            tip: job.tip || 0,
            bonus: 0,
            total,
            cashCollected: isCod && paymentCollected ? job.itemPrice : 0,
        };

        dispatch(updateTodayStats({ tripsDelta: 1, earningsDelta: total }));
        dispatch(setMarketplaceOrderStatus('completed'));

        openSummary(summary);

        completePickup({
            orderId: job.orderNumber,
            handoffPhotoUri: handoffPhoto,
            itemPhotoUri: itemPhoto,
            paymentCollected,
        })
            .unwrap()
            .catch((e) => console.warn('[Marketplace] complete failed', e?.message || e));
    };

    const stepMeta = {
        to_pickup: {
            title: 'Navigate to Seller',
            subtitle: currentStep?.instruction || 'Head to the pickup location',
            badge: { label: 'EN ROUTE', variant: 'primary' },
            color: primaryHex,
            cta: "I've Arrived at Pickup",
            ctaVariant: 'primary',
            ctaIcon: 'tag-outline',
            onCta: () => goToStep('at_pickup'),
        },
        at_pickup: {
            title: 'Arrived at Pickup',
            subtitle: 'Verify the buyer code, then the item',
            badge: { label: 'AT PICKUP', variant: 'warning' },
            color: warningHex,
            cta: 'Verify Buyer Code',
            ctaVariant: 'warning',
            ctaIcon: 'barcode-scan',
            onCta: () => goToStep('verify_code'),
        },
        verify_code: {
            title: 'Verify Buyer Code',
            subtitle: 'Show the seller this barcode to confirm you',
            badge: { label: 'VERIFYING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Item Check',
            ctaVariant: 'warning',
            ctaIcon: 'camera-marker-outline',
            onCta: () => goToStep('verify_item'),
            ctaDisabled: !codeConfirmed,
        },
        verify_item: {
            title: 'Verify Item',
            subtitle: 'Take a photo, then confirm pickup',
            badge: { label: 'VERIFYING', variant: 'warning' },
            color: warningHex,
            cta: 'Confirm Pickup',
            ctaVariant: 'warning',
            ctaIcon: 'package-variant-closed-check',
            onCta: () => goToStep('to_dropoff'),
            ctaDisabled: !itemPhoto,
        },
        to_dropoff: {
            title: 'Navigate to Buyer',
            subtitle: currentStep?.instruction || 'Head to the drop-off location',
            badge: { label: 'DELIVERING', variant: 'success' },
            color: successHex,
            cta: "I've Arrived at Drop-off",
            ctaVariant: 'success',
            ctaIcon: 'account-outline',
            onCta: () => goToStep('at_dropoff'),
        },
        at_dropoff: {
            title: 'Arrived at Drop-off',
            subtitle: isCod ? 'Collect payment, then hand off' : 'Hand off the item',
            badge: { label: 'AT DROP-OFF', variant: 'success' },
            color: successHex,
            cta: 'Continue',
            ctaVariant: 'success',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep(isCod ? 'collect_payment' : 'confirm_delivery'),
        },
        collect_payment: {
            title: 'Collect Payment',
            subtitle: `Collect $${job.itemPrice.toFixed(2)} from ${job.buyerName}`,
            badge: { label: 'PAYMENT', variant: 'warning' },
            color: warningHex,
            cta: 'Confirm Delivery',
            ctaVariant: 'success',
            ctaIcon: 'check-circle-outline',
            onCta: goComplete,
            ctaDisabled: !paymentCollected || !handoffPhoto,
        },
        confirm_delivery: {
            title: 'Confirm Delivery',
            subtitle: 'Take a hand-off photo to finish',
            badge: { label: 'DELIVERING', variant: 'success' },
            color: successHex,
            cta: 'Confirm Delivery',
            ctaVariant: 'success',
            ctaIcon: 'check-circle-outline',
            onCta: goComplete,
            ctaDisabled: !handoffPhoto,
        },
    }[step];

    return (
        <View style={{ flex: 1, backgroundColor: colors?.background ?? '#060E1A' }}>
            <MarketplaceMapPanel
                mapRef={mapRef}
                routeCoords={routeCoords}
                routeTarget={routeTarget}
                driverCoords={driverCoords}
                stepMeta={stepMeta}
                isNavigating={isNavigating}
                etaDuration={etaDuration}
                routeLoading={routeLoading}
                insets={insets}
                onBack={handleBack}
                onOpenMaps={() =>
                    openMaps(routeTarget, step === 'to_pickup' ? job.seller : job.buyerName)
                }
                job={job}
            />

            <Animated.View
                className='bottom-sheet'
                style={[
                    {
                        paddingBottom: insets.bottom + 16,
                        backgroundColor: isDark ? '#0D1E32' : '#FFFFFF',
                        borderTopColor: isDark ? '#1E3A5F' : '#BAE6FD',
                        transform: [{ translateY: slideAnim }],
                        maxHeight: '58%',
                    },
                ]}
            >
                <View className='drag-handle' />

                <View className='status-row' style={[{ borderLeftColor: stepMeta.color }]}>
                    <View className="flex-1 pr-2">
                        <Text className='step-title' style={[{ color: isDark ? '#F0F9FF' : '#0F172A' }]}>
                            {stepMeta.title}
                        </Text>
                        <Text
                            className='step-subtitle'
                            style={[{ color: isDark ? '#7DD3FC' : '#64748B' }]}
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
                    <MarketplaceSheetBody
                        step={step}
                        primaryHex={primaryHex}
                        warningHex={warningHex}
                        successHex={successHex}
                        isDark={isDark}
                        etaDistance={etaDistance}
                        etaDuration={etaDuration}
                        total={total}
                        routeLoading={routeLoading}
                        itemPhoto={itemPhoto}
                        takeItemPhoto={takeItemPhoto}
                        handoffPhoto={handoffPhoto}
                        takeHandoffPhoto={takeHandoffPhoto}
                        paymentCollected={paymentCollected}
                        onTogglePaymentCollected={onTogglePaymentCollected}
                        callPhone={callPhone}
                        codeConfirmed={codeConfirmed}
                        onToggleCodeConfirmed={onToggleCodeConfirmed}
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
