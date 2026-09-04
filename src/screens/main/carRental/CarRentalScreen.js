// src/screens/main/carRental/CarRentalScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Alert, Linking, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/theme';
import {
    setCarRentalOrderStatus,
    setActiveCarRentalOrder,
    setVehiclePhoto,
    setRenterIdPhoto,
    setRenterConfirmed,
    setDamageReport,
    selectPreTripPhotos,
    selectReturnPhotos,
    selectPreTripComplete,
    selectReturnComplete,
} from '@/features/carRental/carRentalSlice';
import { updateTodayStats } from '@/features/driver/driverSlice';
import {
    useSubmitVehiclePhotoMutation,
    useSubmitRenterIdMutation,
    useConfirmJointWalkaroundMutation,
    useSubmitDamageReportMutation,
    useCompleteCarRentalOrderMutation,
} from '@/features/carRental/carRentalApi';
import { useDirections } from '@/hooks/useDirections';
import { DEMO_DELIVERY, DEMO_DRIVER, getCarRentalTotal } from '@/screens/main/carRental/carRentalDemo';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CarRentalMapPanel from '@/components/carRental/CarRentalMapPanel';
import CarRentalSheetBody from '@/components/carRental/CarRentalSheetBody';

// Two separate step sequences — a delivery job and a collection job never
// share a screen instance, so there's no risk of mixing them up. Both are
// driven by the SAME screen component below (job.phase picks the list).
const DELIVERY_STEPS = ['to_depot', 'at_depot', 'pre_trip_inspection', 'to_renter', 'at_renter', 'verify_id', 'joint_walkaround', 'handover'];
const COLLECTION_STEPS = ['to_renter', 'at_renter', 'return_inspection', 'damage_report', 'collect_keys', 'to_depot', 'at_depot'];

export default function CarRentalScreen({ navigation, route }) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const currentLocation = useSelector((s) => s.driver.currentLocation);
    const activeOrder = useSelector((s) => s.carRental.activeOrder);
    const preTripPhotos = useSelector(selectPreTripPhotos);
    const returnPhotos = useSelector(selectReturnPhotos);
    const preTripComplete = useSelector(selectPreTripComplete);
    const returnComplete = useSelector(selectReturnComplete);
    const renterIdPhoto = useSelector((s) => s.carRental.renterIdPhotoUri);
    const renterConfirmed = useSelector((s) => s.carRental.renterConfirmed);
    const damageFound = useSelector((s) => s.carRental.damageFound);
    const damageNotes = useSelector((s) => s.carRental.damageNotes);

    const job = route?.params?.job || activeOrder || DEMO_DELIVERY;
    const isCollection = job.phase === 'collection';
    const steps = isCollection ? COLLECTION_STEPS : DELIVERY_STEPS;

    useEffect(() => {
        if (!activeOrder) dispatch(setActiveCarRentalOrder(job));
    }, []);

    const [submitVehiclePhoto] = useSubmitVehiclePhotoMutation();
    const [submitRenterId] = useSubmitRenterIdMutation();
    const [confirmJointWalkaround] = useConfirmJointWalkaroundMutation();
    const [submitDamageReport] = useSubmitDamageReportMutation();
    const [completeCarRentalOrder, { isLoading }] = useCompleteCarRentalOrderMutation();

    const [step, setStep] = useState(route?.params?.initialStep ?? steps[0]);
    const [handoffPhoto, setHandoffPhoto] = useState(null);
    const stepHistoryRef = useRef([]);

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = isDark ? '#34D399' : '#16A34A';

    const slideAnim = useRef(new Animated.Value(300)).current;
    const mapRef = useRef(null);

    const total = getCarRentalTotal(job);
    const driverCoords = currentLocation ?? DEMO_DRIVER;
    const isNavigating = step === 'to_depot' || step === 'to_renter';
    const destination = step === 'to_depot' ? job.depotCoords : step === 'to_renter' ? job.renterCoords : null;

    const { routeCoordinates, currentStep, distanceText, durationText, isLoading: routeLoading } = useDirections(destination);

    const fallbackRoute = step === 'to_depot' ? job.routeToDepot : step === 'to_renter' ? job.routeToRenter : null;
    const routeCoords = routeCoordinates.length > 0 ? routeCoordinates : fallbackRoute;
    const routeTarget = step === 'to_depot' ? job.depotCoords : step === 'to_renter' ? job.renterCoords : null;

    const etaDuration = durationText || (step === 'to_depot' ? job.durationToDepot : job.durationToRenter);
    const etaDistance = distanceText || (step === 'to_depot' ? job.distanceToDepot : job.distanceToRenter);

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

    // One handler for every side, in either phase — `set` says which photo
    // bucket (preTripPhotos | returnPhotos) so this doesn't branch per step.
    const onCapturePhoto = async (side) => {
        const set = isCollection ? 'returnPhotos' : 'preTripPhotos';
        const uri = await takePhoto();
        if (!uri) return;
        dispatch(setVehiclePhoto({ set, side, uri }));
        submitVehiclePhoto({ orderId: job.orderNumber, phase: job.phase, set, side, photoUri: uri })
            .unwrap()
            .catch((e) => console.warn('[CarRental] submit-photo failed', e?.message || e));
    };

    const onCaptureRenterId = async () => {
        const uri = await takePhoto();
        if (!uri) return;
        dispatch(setRenterIdPhoto(uri));
        submitRenterId({ orderId: job.orderNumber, photoUri: uri })
            .unwrap()
            .catch((e) => console.warn('[CarRental] submit-renter-id failed', e?.message || e));
    };

    const onToggleRenterConfirmed = () => {
        dispatch(setRenterConfirmed(!renterConfirmed));
        if (!renterConfirmed) {
            confirmJointWalkaround({ orderId: job.orderNumber })
                .unwrap()
                .catch((e) => console.warn('[CarRental] confirm-walkaround failed', e?.message || e));
        }
    };

    const onToggleDamageFound = (found) => dispatch(setDamageReport({ found, notes: found ? damageNotes : '' }));
    const onChangeDamageNotes = (notes) => dispatch(setDamageReport({ notes }));

    const goDamageReportContinue = () => {
        if (damageFound && !damageNotes.trim()) {
            Alert.alert('Add a note', 'Briefly describe the new damage before continuing.');
            return;
        }
        submitDamageReport({ orderId: job.orderNumber, found: damageFound, notes: damageNotes, photos: [] })
            .unwrap()
            .catch((e) => console.warn('[CarRental] submit-damage-report failed', e?.message || e));
        goToStep('collect_keys');
    };

    const onCaptureHandoff = () => takePhoto(setHandoffPhoto);

    const openSummary = (summary) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Tabs' }, { name: 'DeliverySummary', params: { summary } }],
            }),
        );
    };

    const goComplete = () => {
        const summary = {
            orderNumber: job.orderNumber,
            baseFare: job.baseFare,
            tip: job.tip || 0,
            bonus: 0,
            total,
            phase: job.phase,
            vehicle: job.vehicle,
            damageFound: isCollection ? damageFound : false,
            damageNotes: isCollection ? damageNotes : null,
        };

        dispatch(updateTodayStats({ tripsDelta: 1, earningsDelta: total }));
        dispatch(setCarRentalOrderStatus('completed'));

        openSummary(summary);

        completeCarRentalOrder({ orderId: job.orderNumber, phase: job.phase, handoffPhotoUri: handoffPhoto })
            .unwrap()
            .catch((e) => console.warn('[CarRental] complete failed', e?.message || e));
    };

    const buildStepMeta = () => ({
        to_depot: {
            title: isCollection ? 'Navigate to Depot' : 'Navigate to Depot',
            subtitle: currentStep?.instruction || (isCollection ? 'Return the car to the depot' : 'Pick up the keys'),
            badge: { label: 'EN ROUTE', variant: 'primary' },
            color: primaryHex,
            cta: "I've Arrived at the Depot",
            ctaVariant: 'primary',
            ctaIcon: 'warehouse',
            onCta: () => goToStep('at_depot'),
        },
        at_depot: isCollection
            ? {
                title: 'Return the Car',
                subtitle: 'Hand the keys back and finish up',
                badge: { label: 'AT DEPOT', variant: 'success' },
                color: successHex,
                cta: 'Confirm Car Returned',
                ctaVariant: 'success',
                ctaIcon: 'check-circle-outline',
                onCta: goComplete,
                ctaDisabled: !handoffPhoto,
            }
            : {
                title: 'Arrived at Depot',
                subtitle: 'Collect the keys, then inspect the car',
                badge: { label: 'AT DEPOT', variant: 'warning' },
                color: warningHex,
                cta: 'Start Pre-Trip Inspection',
                ctaVariant: 'warning',
                ctaIcon: 'car-search-outline',
                onCta: () => goToStep('pre_trip_inspection'),
            },
        pre_trip_inspection: {
            title: 'Pre-Trip Inspection',
            subtitle: `${Object.values(preTripPhotos).filter(Boolean).length} / 6 photos captured`,
            badge: { label: 'INSPECTING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Renter',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('to_renter'),
            ctaDisabled: !preTripComplete,
        },
        to_renter: {
            title: 'Navigate to Renter',
            subtitle: currentStep?.instruction || 'Head to the drop-off / pick-up location',
            badge: { label: isCollection ? 'COLLECTING' : 'DELIVERING', variant: 'success' },
            color: successHex,
            cta: "I've Arrived",
            ctaVariant: 'success',
            ctaIcon: 'account-outline',
            onCta: () => goToStep('at_renter'),
        },
        at_renter: {
            title: isCollection ? 'Meet the Renter' : 'Meet the Renter',
            subtitle: isCollection ? 'Inspect the car before collecting' : 'Verify ID before handover',
            badge: { label: 'AT RENTER', variant: 'success' },
            color: successHex,
            cta: isCollection ? 'Start Return Inspection' : 'Verify Renter ID',
            ctaVariant: 'success',
            ctaIcon: isCollection ? 'car-search-outline' : 'card-account-details-outline',
            onCta: () => goToStep(isCollection ? 'return_inspection' : 'verify_id'),
        },
        verify_id: {
            title: 'Verify Renter ID',
            subtitle: 'Check the licence before handover',
            badge: { label: 'VERIFYING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Walkaround',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('joint_walkaround'),
            ctaDisabled: !renterIdPhoto,
        },
        joint_walkaround: {
            title: 'Joint Walkaround',
            subtitle: 'Confirm the condition together',
            badge: { label: 'CONFIRMING', variant: 'warning' },
            color: warningHex,
            cta: 'Hand Over Keys',
            ctaVariant: 'success',
            ctaIcon: 'key-outline',
            onCta: () => goToStep('handover'),
            ctaDisabled: !renterConfirmed,
        },
        handover: {
            title: 'Hand Over Keys',
            subtitle: 'Capture proof of hand-off',
            badge: { label: 'HANDOVER', variant: 'success' },
            color: successHex,
            cta: 'Complete Delivery',
            ctaVariant: 'success',
            ctaIcon: 'check-circle-outline',
            onCta: goComplete,
            ctaDisabled: !handoffPhoto,
        },
        return_inspection: {
            title: 'Return Inspection',
            subtitle: `${Object.values(returnPhotos).filter(Boolean).length} / 6 photos captured`,
            badge: { label: 'INSPECTING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('damage_report'),
            ctaDisabled: !returnComplete,
        },
        damage_report: {
            title: 'Damage Report',
            subtitle: 'Compare against pre-trip condition',
            badge: { label: 'REVIEW', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Collect Keys',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: goDamageReportContinue,
        },
        collect_keys: {
            title: 'Collect Keys',
            subtitle: 'Take the keys and documents back',
            badge: { label: 'COLLECTING', variant: 'success' },
            color: successHex,
            cta: 'Continue to Depot',
            ctaVariant: 'success',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('to_depot'),
            ctaDisabled: !handoffPhoto,
        },
    })[step];

    const stepMeta = buildStepMeta();

    return (
        <View style={{ flex: 1, backgroundColor: colors?.background ?? '#060E1A' }}>
            <CarRentalMapPanel
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
                onOpenMaps={() => openMaps(routeTarget, step === 'to_depot' ? job.depot : job.renterName)}
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
                    <CarRentalSheetBody
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
                        photos={isCollection ? returnPhotos : preTripPhotos}
                        comparePhotos={isCollection ? job.preTripPhotos : undefined}
                        onCapturePhoto={onCapturePhoto}
                        renterIdPhoto={renterIdPhoto}
                        onCaptureRenterId={onCaptureRenterId}
                        renterConfirmed={renterConfirmed}
                        onToggleRenterConfirmed={onToggleRenterConfirmed}
                        damageFound={damageFound}
                        onToggleDamageFound={onToggleDamageFound}
                        damageNotes={damageNotes}
                        onChangeDamageNotes={onChangeDamageNotes}
                        handoffPhoto={handoffPhoto}
                        onCaptureHandoff={onCaptureHandoff}
                        callPhone={callPhone}
                    />
                </ScrollView>

                {stepMeta.cta && (
                    <Button variant={stepMeta.ctaVariant} leftIcon={stepMeta.ctaIcon} onPress={stepMeta.onCta} disabled={stepMeta.ctaDisabled || isLoading}>
                        {isLoading ? 'Please wait…' : stepMeta.cta}
                    </Button>
                )}
            </Animated.View>
        </View>
    );
}
