// src/screens/main/shop/ShopDeliveryScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Alert, Linking, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/theme';
import {
    setShopOrderStatus,
    setActiveShopOrder,
    startShoppingTimer,
    updateItemStatus,
    setShopReceipt,
    selectShopItems,
    selectShopRunningTotal,
    selectShopBudgetLimit,
    selectHasPendingApprovalItems,
} from '@/features/shop/shopSlice';
import { updateTodayStats } from '@/features/driver/driverSlice';
import {
    useUpdateShopItemStatusMutation,
    useRequestItemSubstitutionMutation,
    useSubmitShopReceiptMutation,
    useCompleteShopOrderMutation,
} from '@/features/shop/shopApi';
import { useDirections } from '@/hooks/useDirections';
import { DEMO, DEMO_DRIVER, getShopTotal } from '@/screens/main/shop/shopDemo';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ShopMapPanel from '@/components/shop/ShopMapPanel';
import ShopSheetBody from '@/components/shop/ShopSheetBody';
import SubstituteRequestModal from '@/components/shop/SubstituteRequestModal';

export default function ShopDeliveryScreen({ navigation, route }) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const currentLocation = useSelector((s) => s.driver.currentLocation);
    const activeOrder = useSelector((s) => s.shop.activeOrder);
    const items = useSelector(selectShopItems);
    const runningTotal = useSelector(selectShopRunningTotal);
    const budgetLimit = useSelector(selectShopBudgetLimit);
    const hasPendingApproval = useSelector(selectHasPendingApprovalItems);

    const job = route?.params?.job || activeOrder || DEMO;

    // Seed the slice with this job's items exactly once, the same way
    // food/parcel/gig/marketplace seed their activeOrder — items then live
    // in Redux (shopSlice), not local screen state, so a substitute
    // approval can update them even if this screen briefly unmounts.
    useEffect(() => {
        if (!activeOrder) dispatch(setActiveShopOrder(job));
    }, []);

    const [updateItemStatusRemote] = useUpdateShopItemStatusMutation();
    const [requestSubstitution] = useRequestItemSubstitutionMutation();
    const [submitReceipt] = useSubmitShopReceiptMutation();
    const [completeShopOrder, { isLoading }] = useCompleteShopOrderMutation();

    const [step, setStep] = useState(route?.params?.initialStep ?? 'to_store');
    const [substituteTarget, setSubstituteTarget] = useState(null);
    const [receiptPhoto, setReceiptPhoto] = useState(null);
    const [actualTotalInput, setActualTotalInput] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState(null);
    const [deliveryPhoto, setDeliveryPhoto] = useState(null);
    // Step history stack — same back-button pattern as parcel/gig/marketplace.
    const stepHistoryRef = useRef([]);
    const substituteTimers = useRef({});

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = isDark ? '#34D399' : '#16A34A';

    const slideAnim = useRef(new Animated.Value(300)).current;
    const mapRef = useRef(null);

    const total = getShopTotal(job);
    const driverCoords = currentLocation ?? DEMO_DRIVER;
    const isNavigating = step === 'to_store' || step === 'to_customer';

    const destination = step === 'to_store' ? job.storeCoords : step === 'to_customer' ? job.customerCoords : null;

    const { routeCoordinates, currentStep, distanceText, durationText, isLoading: routeLoading } = useDirections(destination);

    const fallbackRoute = step === 'to_store' ? job.routeToStore || DEMO.routeToStore : step === 'to_customer' ? job.routeToCustomer || DEMO.routeToCustomer : null;
    const routeCoords = routeCoordinates.length > 0 ? routeCoordinates : fallbackRoute;
    const routeTarget = step === 'to_store' ? job.storeCoords : step === 'to_customer' ? job.customerCoords : null;

    const etaDuration = durationText || (step === 'to_store' ? job.durationToStore : job.durationToCustomer);
    const etaDistance = distanceText || (step === 'to_store' ? job.distanceToStore : job.distanceToCustomer);

    useEffect(() => {
        slideAnim.setValue(300);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 9, tension: 60 }).start();
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

    // Clear any pending demo-approval timers on unmount so they don't fire
    // (and dispatch) after the screen is gone.
    useEffect(() => {
        return () => {
            Object.values(substituteTimers.current).forEach(clearTimeout);
        };
    }, []);

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
        Linking.openURL(url).catch(() => Alert.alert('Maps', `Navigate to ${label}`));
    };

    const callPhone = (phone, who) => {
        Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Call', `Calling ${who}…`));
    };

    const takePhoto = async (setter) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow camera access to take this photo.');
            return null;
        }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.8 });
        if (!result.canceled && result.assets?.[0]?.uri) {
            const uri = result.assets[0].uri;
            setter?.(uri);
            return uri;
        }
        return null;
    };

    const goStartShopping = () => {
        dispatch(startShoppingTimer());
        goToStep('shopping');
    };

    // Optimistic: item flips to "found" locally right away, background sync
    // only — same fire-and-forget pattern as marketplace's verify-item.
    const onFoundItem = (item) => {
        dispatch(updateItemStatus({ itemId: item.id, status: 'found', actualPrice: item.price }));
        updateItemStatusRemote({ orderId: job.orderNumber, itemId: item.id, status: 'found', actualPrice: item.price })
            .unwrap()
            .catch((e) => console.warn('[Shop] update-item-status failed', e?.message || e));
    };

    const onCantFindItem = (item) => setSubstituteTarget(item);

    const onSkipItem = (item) => {
        dispatch(updateItemStatus({ itemId: item.id, status: 'skipped' }));
        updateItemStatusRemote({ orderId: job.orderNumber, itemId: item.id, status: 'skipped' })
            .unwrap()
            .catch((e) => console.warn('[Shop] update-item-status failed', e?.message || e));
    };

    // Demo-only: since there's no live customer/socket in this build, a
    // pending_approval item auto-resolves to "substituted" after a short
    // delay so the flow is fully testable end-to-end. Swap this for a
    // socket listener (setSubstitutedApproved) once the real customer app
    // is wired up.
    const onSuggestSubstitute = ({ name, price, photoUri }) => {
        const item = substituteTarget;
        if (!item) return;
        const substitutedWith = { name, price, photoUri };
        dispatch(updateItemStatus({ itemId: item.id, status: 'pending_approval', substitutedWith }));
        requestSubstitution({
            orderId: job.orderNumber,
            itemId: item.id,
            substituteName: name,
            substitutePrice: price,
            substitutePhotoUri: photoUri,
        })
            .unwrap()
            .catch((e) => console.warn('[Shop] request-substitution failed', e?.message || e));

        substituteTimers.current[item.id] = setTimeout(() => {
            dispatch(updateItemStatus({ itemId: item.id, status: 'substituted', actualPrice: price }));
        }, 4000);

        setSubstituteTarget(null);
    };

    const goShoppingContinue = () => {
        const stillPending = items.some((it) => it.status === 'pending');
        if (stillPending) {
            Alert.alert('Not finished', 'Mark every item as found, unavailable, or skipped before continuing.');
            return;
        }
        goToStep(hasPendingApproval ? 'review' : 'checkout');
    };

    const takeReceiptPhoto = async () => {
        const uri = await takePhoto(setReceiptPhoto);
        if (uri) {
            dispatch(setShopReceipt({ receiptPhotoUri: uri }));
            submitReceipt({ orderId: job.orderNumber, receiptPhotoUri: uri, actualTotal: parseFloat(actualTotalInput) || runningTotal })
                .unwrap()
                .catch((e) => console.warn('[Shop] submit-receipt failed', e?.message || e));
        }
    };

    const takeDeliveryPhoto = () => takePhoto(setDeliveryPhoto);

    const openSummary = (summary) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Tabs' }, { name: 'DeliverySummary', params: { summary } }],
            }),
        );
    };

    // Optimistic: summary opens immediately, earnings bumped right away —
    // same convention as ParcelDeliveryScreen.goComplete() /
    // MarketplacePickupScreen.goComplete(). Skipped items are refunded to
    // the customer, not deducted from the driver's own earnings.
    const goComplete = () => {
        const actualTotal = parseFloat(actualTotalInput) || runningTotal;
        const skippedCount = items.filter((it) => it.status === 'skipped').length;
        const substitutedCount = items.filter((it) => it.status === 'substituted').length;

        const summary = {
            orderNumber: job.orderNumber,
            baseFare: job.baseFare,
            tip: job.tip || 0,
            bonus: 0,
            total,
            itemsShopped: items.length,
            itemsSubstituted: substitutedCount,
            itemsRefunded: skippedCount,
            actualSpend: actualTotal,
            budgetLimit,
        };

        dispatch(updateTodayStats({ tripsDelta: 1, earningsDelta: total }));
        dispatch(setShopOrderStatus('completed'));

        openSummary(summary);

        completeShopOrder({
            orderId: job.orderNumber,
            handoffPhotoUri: deliveryPhoto,
            deliveryMethod,
            receiptPhotoUri: receiptPhoto,
            actualTotal,
        })
            .unwrap()
            .catch((e) => console.warn('[Shop] complete failed', e?.message || e));
    };

    const stepMeta = {
        to_store: {
            title: 'Navigate to Store',
            subtitle: currentStep?.instruction || 'Head to the store',
            badge: { label: 'EN ROUTE', variant: 'primary' },
            color: primaryHex,
            cta: "I've Arrived at the Store",
            ctaVariant: 'primary',
            ctaIcon: 'storefront-outline',
            onCta: () => goToStep('at_store'),
        },
        at_store: {
            title: 'Arrived at Store',
            subtitle: 'Start shopping the list',
            badge: { label: 'AT STORE', variant: 'warning' },
            color: warningHex,
            cta: 'Start Shopping',
            ctaVariant: 'warning',
            ctaIcon: 'cart-outline',
            onCta: goStartShopping,
        },
        shopping: {
            title: 'Active Shopping',
            subtitle: `${items.filter((it) => it.status !== 'pending').length} / ${items.length} items resolved`,
            badge: { label: 'SHOPPING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: goShoppingContinue,
        },
        review: {
            title: 'Review Substitutes',
            subtitle: 'Waiting on customer approval',
            badge: { label: 'PENDING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Checkout',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('checkout'),
            ctaDisabled: hasPendingApproval,
        },
        checkout: {
            title: 'Checkout',
            subtitle: 'Pay and capture the receipt',
            badge: { label: 'CHECKOUT', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Delivery',
            ctaVariant: 'success',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('to_customer'),
            ctaDisabled: !receiptPhoto,
        },
        to_customer: {
            title: 'Navigate to Customer',
            subtitle: currentStep?.instruction || 'Head to the drop-off location',
            badge: { label: 'DELIVERING', variant: 'success' },
            color: successHex,
            cta: "I've Arrived",
            ctaVariant: 'success',
            ctaIcon: 'account-outline',
            onCta: () => goToStep('at_customer'),
        },
        at_customer: {
            title: 'Deliver the Order',
            subtitle: 'Choose a method and confirm',
            badge: { label: 'AT CUSTOMER', variant: 'success' },
            color: successHex,
            cta: 'Confirm Delivery',
            ctaVariant: 'success',
            ctaIcon: 'check-circle-outline',
            onCta: goComplete,
            ctaDisabled: !deliveryMethod || !deliveryPhoto,
        },
    }[step];

    return (
        <View style={{ flex: 1, backgroundColor: colors?.background ?? '#060E1A' }}>
            <ShopMapPanel
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
                onOpenMaps={() => openMaps(routeTarget, step === 'to_store' ? job.store : job.customerName)}
                job={job}
            />

            <Animated.View
                className="bottom-sheet"
                style={[
                    {
                        paddingBottom: insets.bottom + 16,
                        backgroundColor: isDark ? '#0D1E32' : '#FFFFFF',
                        borderTopColor: isDark ? '#1E3A5F' : '#BAE6FD',
                        transform: [{ translateY: slideAnim }],
                        maxHeight: '62%',
                    },
                ]}
            >
                <View className="drag-handle" />

                <View className="status-row" style={[{ borderLeftColor: stepMeta.color }]}>
                    <View className="flex-1 pr-2">
                        <Text className="step-title" style={[{ color: isDark ? '#F0F9FF' : '#0F172A' }]}>
                            {stepMeta.title}
                        </Text>
                        <Text className="step-subtitle" style={[{ color: isDark ? '#7DD3FC' : '#64748B' }]} numberOfLines={2}>
                            {stepMeta.subtitle}
                        </Text>
                    </View>
                    <Badge label={stepMeta.badge.label} variant={stepMeta.badge.variant} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
                    <ShopSheetBody
                        step={step}
                        job={job}
                        primaryHex={primaryHex}
                        warningHex={warningHex}
                        successHex={successHex}
                        isDark={isDark}
                        etaDistance={etaDistance}
                        etaDuration={etaDuration}
                        total={total}
                        routeLoading={routeLoading}
                        items={items}
                        runningTotal={runningTotal}
                        budgetLimit={budgetLimit}
                        onFoundItem={onFoundItem}
                        onCantFindItem={onCantFindItem}
                        pendingApprovalItems={items.filter((it) => it.status === 'pending_approval')}
                        receiptPhoto={receiptPhoto}
                        takeReceiptPhoto={takeReceiptPhoto}
                        actualTotalInput={actualTotalInput}
                        onChangeActualTotal={setActualTotalInput}
                        deliveryMethod={deliveryMethod}
                        onSelectDeliveryMethod={setDeliveryMethod}
                        deliveryPhoto={deliveryPhoto}
                        takeDeliveryPhoto={takeDeliveryPhoto}
                        callPhone={callPhone}
                    />
                </ScrollView>

                {stepMeta.cta && (
                    <Button variant={stepMeta.ctaVariant} leftIcon={stepMeta.ctaIcon} onPress={stepMeta.onCta} disabled={stepMeta.ctaDisabled || isLoading}>
                        {isLoading ? 'Please wait…' : stepMeta.cta}
                    </Button>
                )}
            </Animated.View>

            <SubstituteRequestModal
                visible={!!substituteTarget}
                item={substituteTarget}
                onClose={() => setSubstituteTarget(null)}
                onSuggest={onSuggestSubstitute}
                onSkip={() => {
                    onSkipItem(substituteTarget);
                    setSubstituteTarget(null);
                }}
                onTakePhoto={() => takePhoto()}
            />
        </View>
    );
}
