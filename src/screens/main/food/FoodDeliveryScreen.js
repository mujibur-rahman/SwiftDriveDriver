// src/screens/main/food/FoodDeliveryScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Animated,
    Alert,
    Linking,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { setFoodOrderStatus } from '@/features/food/foodSlice';
import { updateTodayStats } from '@/features/driver/driverSlice';
import { useCompleteFoodDeliveryMutation } from '@/features/food/foodApi';
import { useDirections } from '@/hooks/useDirections';
import { DEMO, DEMO_DRIVER } from '@/screens/main/food/foodDemo';
import { foodStyles as styles } from '@/screens/main/food/foodStyles';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import FoodMapPanel from '@/components/food/FoodMapPanel';
import FoodSheetBody from '@/components/food/FoodSheetBody';

export default function FoodDeliveryScreen({ navigation, route }) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const currentLocation = useSelector((s) => s.driver.currentLocation);
    const isOnline = useSelector((s) => s.driver.isOnline);
    const foodDeliveryEnabled = useSelector((s) => s.food.enabled);
    const [completeFood, { isLoading }] = useCompleteFoodDeliveryMutation();

    const [step, setStep] = useState(
        route?.params?.initialStep ?? 'to_restaurant',
    );
    const [checkedItems, setCheckedItems] = useState({});
    const [doorPhoto, setDoorPhoto] = useState(null);

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = isDark ? '#34D399' : '#16A34A';

    const slideAnim = useRef(new Animated.Value(300)).current;
    const mapRef = useRef(null);
    // Step history stack — lets the back button walk back through steps
    // rather than always exiting the screen.
    const stepHistoryRef = useRef([]);

    const total = DEMO.baseFare + DEMO.tip;
    const driverCoords = currentLocation ?? DEMO_DRIVER;
    const isNavigating = step === 'to_restaurant' || step === 'to_customer';

    const destination =
        step === 'to_restaurant'
            ? DEMO.restaurantCoords
            : step === 'to_customer'
                ? DEMO.customerCoords
                : null;

    const {
        routeCoordinates,
        currentStep,
        distanceText,
        durationText,
        isLoading: routeLoading,
    } = useDirections(destination);

    const fallbackRoute =
        step === 'to_restaurant'
            ? DEMO.routeToRestaurant
            : step === 'to_customer'
                ? DEMO.routeToCustomer
                : null;
    const routeCoords =
        routeCoordinates.length > 0 ? routeCoordinates : fallbackRoute;
    const routeTarget =
        step === 'to_restaurant'
            ? DEMO.restaurantCoords
            : step === 'to_customer'
                ? DEMO.customerCoords
                : null;

    const etaDuration =
        durationText ||
        (step === 'to_restaurant'
            ? DEMO.durationToRestaurant
            : DEMO.durationToCustomer);
    const etaDistance =
        distanceText ||
        (step === 'to_restaurant'
            ? DEMO.distanceToRestaurant
            : DEMO.distanceToCustomer);

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

    /** Navigate forward to a new step, recording the current step so the
     *  back button can return to it. */
    const goToStep = (next) => {
        stepHistoryRef.current.push(step);
        setStep(next);
    };

    /** Back handler: walk backwards through step history, or exit the screen
     *  when there is nothing left to go back to. */
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

    const allItemsChecked = DEMO.items.every((it) => checkedItems[it.id]);
    const toggleItem = (id) => {
        setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const takeDoorPhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission', 'Camera access is required for leave-at-door.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: false,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setDoorPhoto(result.assets[0].uri);
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
    // The onQueryStarted handler in foodApi.js will reconcile with the server
    // total if the call succeeds; because we guard with earningsDelta (not an
    // absolute set) a successful response won't double-count.
    const goComplete = () => {
        const method =
            step === 'leave_at_door' ? 'leave_at_door' : 'hand_to_customer';
        const summary = {
            orderNumber: DEMO.orderNumber,
            baseFare: DEMO.baseFare,
            tip: DEMO.tip,
            bonus: 0,
            total: DEMO.baseFare + DEMO.tip,
        };

        // Bump today's earnings immediately so EarningsScreen reflects this
        // delivery the moment the driver lands there, regardless of API result.
        dispatch(updateTodayStats({ tripsDelta: 1, earningsDelta: summary.total }));
        dispatch(setFoodOrderStatus('completed'));

        // Navigate first — keeps the transition instant.
        openSummary(summary);

        completeFood({
            orderId: DEMO.orderNumber,
            deliveryMethod: method,
            photoUri: doorPhoto,
        })
            .unwrap()
            .catch((e) => {
                console.warn('[FoodDelivery] complete API failed', e?.message || e);
            });
    };

    const stepMeta = {
        to_restaurant: {
            title: 'Navigate to Restaurant',
            subtitle: currentStep?.instruction || 'Head to the pickup location',
            badge: { label: 'EN ROUTE', variant: 'primary' },
            color: primaryHex,
            cta: "I've Arrived at Restaurant",
            ctaVariant: 'primary',
            ctaIcon: 'storefront-outline',
            onCta: () => goToStep('at_restaurant'),
        },
        at_restaurant: {
            title: 'Arrived at Restaurant',
            subtitle: 'Is the order ready?',
            badge: { label: 'AT RESTAURANT', variant: 'warning' },
            color: warningHex,
        },
        waiting_order: {
            title: 'Waiting for Order',
            subtitle: 'Order not ready yet — wait or call',
            badge: { label: 'WAITING', variant: 'warning' },
            color: warningHex,
            cta: 'Order is Ready Now',
            ctaVariant: 'warning',
            ctaIcon: 'check',
            onCta: () => goToStep('confirm_items'),
        },
        confirm_items: {
            title: 'Confirm Items',
            subtitle: 'Check each item before leaving',
            badge: { label: 'PICKUP', variant: 'warning' },
            color: warningHex,
            cta: 'Pickup Confirmed',
            ctaVariant: 'warning',
            ctaIcon: 'package-variant-closed-check',
            onCta: () => {
                if (!allItemsChecked) {
                    Alert.alert('Items', 'Please confirm all items first.');
                    return;
                }
                goToStep('to_customer');
            },
            ctaDisabled: !allItemsChecked,
        },
        to_customer: {
            title: 'Navigate to Customer',
            subtitle: currentStep?.instruction || 'Head to the drop-off location',
            badge: { label: 'DELIVERING', variant: 'success' },
            color: successHex,
            cta: "I've Arrived at Customer",
            ctaVariant: 'success',
            ctaIcon: 'account-outline',
            onCta: () => goToStep('at_customer'),
        },
        at_customer: {
            title: 'Arrived at Customer',
            subtitle: 'How will you deliver?',
            badge: { label: 'AT CUSTOMER', variant: 'success' },
            color: successHex,
        },
        hand_to_customer: {
            title: 'Hand to Customer',
            subtitle: 'Confirm the handoff',
            badge: { label: 'HANDOFF', variant: 'success' },
            color: successHex,
            cta: 'Confirm Handoff',
            ctaVariant: 'success',
            ctaIcon: 'handshake-outline',
            onCta: goComplete,
        },
        leave_at_door: {
            title: 'Leave at Door',
            subtitle: 'Take a photo as proof',
            badge: { label: 'LEAVE AT DOOR', variant: 'success' },
            color: successHex,
            cta: 'Confirm Delivery',
            ctaVariant: 'success',
            ctaIcon: 'check-circle-outline',
            onCta: () => {
                if (!doorPhoto) {
                    Alert.alert('Photo required', 'Please take a photo of the drop-off.');
                    return;
                }
                goComplete();
            },
            ctaDisabled: !doorPhoto,
        },
    }[step];

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors?.background ?? '#060E1A',
            }}
        >
            <FoodMapPanel
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
                    openMaps(
                        routeTarget,
                        step === 'to_restaurant' ? DEMO.restaurant : DEMO.customerName,
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
                    <FoodSheetBody
                        step={step}
                        setStep={goToStep}
                        primaryHex={primaryHex}
                        warningHex={warningHex}
                        successHex={successHex}
                        colors={colors}
                        etaDistance={etaDistance}
                        etaDuration={etaDuration}
                        total={total}
                        routeLoading={routeLoading}
                        checkedItems={checkedItems}
                        toggleItem={toggleItem}
                        doorPhoto={doorPhoto}
                        takeDoorPhoto={takeDoorPhoto}
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