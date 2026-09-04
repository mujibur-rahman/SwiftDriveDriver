// src/screens/main/carInsurance/CarInsuranceScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Alert, Linking, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/theme';
import {
    setCarInsuranceOrderStatus,
    setActiveCarInsuranceOrder,
    setOwnerVerified,
    setVinCapture,
    setConditionPhoto,
    setExistingDamage,
    setOwnerConsent,
    setClaimantVerified,
    addDamagePhoto,
    updateDamagePhotoNote,
    removeDamagePhoto,
    setIncidentNotes,
    setPoliceReportNumber,
    setSeverity,
    setClaimantConsent,
    selectConditionPhotos,
    selectDamagePhotos,
    selectConditionComplete,
} from '@/features/carInsurance/carInsuranceSlice';
import { updateTodayStats } from '@/features/driver/driverSlice';
import {
    useSubmitVinMutation,
    useSubmitConditionPhotoMutation,
    useSubmitOwnerConsentMutation,
    useSubmitDamagePhotoMutation,
    useSubmitIncidentDetailsMutation,
    useSubmitSeverityMutation,
    useSubmitClaimantConsentMutation,
    useCompleteCarInsuranceOrderMutation,
} from '@/features/carInsurance/carInsuranceApi';
import { useDirections } from '@/hooks/useDirections';
import { DEMO_PRE_POLICY, DEMO_DRIVER, getCarInsuranceTotal } from '@/screens/main/carInsurance/carInsuranceDemo';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import InsuranceInspectionMapPanel from '@/components/carInsurance/InsuranceInspectionMapPanel';
import InsuranceInspectionSheetBody from '@/components/carInsurance/InsuranceInspectionSheetBody';

// Two separate step sequences — a pre_policy job and a claim job never
// share a screen instance. Both driven by this ONE screen (job.phase picks
// the list), same convention as CarRentalScreen.js.
const PRE_POLICY_STEPS = ['to_location', 'at_location', 'verify_owner', 'vin_capture', 'condition_inspection', 'existing_damage', 'owner_consent', 'submit_report'];
const CLAIM_STEPS = ['to_location', 'at_location', 'verify_claimant', 'damage_photos', 'incident_details', 'severity', 'claimant_consent', 'submit_report'];

export default function CarInsuranceScreen({ navigation, route }) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const currentLocation = useSelector((s) => s.driver.currentLocation);
    const activeOrder = useSelector((s) => s.carInsurance.activeOrder);
    const ownerVerified = useSelector((s) => s.carInsurance.ownerVerified);
    const vinPhotoUri = useSelector((s) => s.carInsurance.vinPhotoUri);
    const vinNumber = useSelector((s) => s.carInsurance.vinNumber);
    const conditionPhotos = useSelector(selectConditionPhotos);
    const conditionComplete = useSelector(selectConditionComplete);
    const existingDamageFound = useSelector((s) => s.carInsurance.existingDamageFound);
    const existingDamageNotes = useSelector((s) => s.carInsurance.existingDamageNotes);
    const ownerConsent = useSelector((s) => s.carInsurance.ownerConsent);
    const claimantVerified = useSelector((s) => s.carInsurance.claimantVerified);
    const damagePhotos = useSelector(selectDamagePhotos);
    const incidentNotes = useSelector((s) => s.carInsurance.incidentNotes);
    const policeReportNumber = useSelector((s) => s.carInsurance.policeReportNumber);
    const severity = useSelector((s) => s.carInsurance.severity);
    const claimantConsent = useSelector((s) => s.carInsurance.claimantConsent);

    const job = route?.params?.job || activeOrder || DEMO_PRE_POLICY;
    const isClaim = job.phase === 'claim';
    const steps = isClaim ? CLAIM_STEPS : PRE_POLICY_STEPS;

    useEffect(() => {
        if (!activeOrder) dispatch(setActiveCarInsuranceOrder(job));
    }, []);

    const [submitVin] = useSubmitVinMutation();
    const [submitConditionPhoto] = useSubmitConditionPhotoMutation();
    const [submitOwnerConsent] = useSubmitOwnerConsentMutation();
    const [submitDamagePhoto] = useSubmitDamagePhotoMutation();
    const [submitIncidentDetails] = useSubmitIncidentDetailsMutation();
    const [submitSeverity] = useSubmitSeverityMutation();
    const [submitClaimantConsent] = useSubmitClaimantConsentMutation();
    const [completeCarInsuranceOrder, { isLoading }] = useCompleteCarInsuranceOrderMutation();

    const [step, setStep] = useState(route?.params?.initialStep ?? steps[0]);
    const stepHistoryRef = useRef([]);

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = isDark ? '#34D399' : '#16A34A';

    const slideAnim = useRef(new Animated.Value(300)).current;
    const mapRef = useRef(null);

    const total = getCarInsuranceTotal(job);
    const driverCoords = currentLocation ?? DEMO_DRIVER;
    const isNavigating = step === 'to_location';
    const destinationCoords = isClaim ? job.claimantCoords : job.ownerCoords;
    const destinationLabel = isClaim ? job.claimantName : job.ownerName;

    const { routeCoordinates, currentStep, distanceText, durationText, isLoading: routeLoading } = useDirections(isNavigating ? destinationCoords : null);

    const fallbackRoute = isClaim ? job.routeToClaimant : job.routeToOwner;
    const routeCoords = routeCoordinates.length > 0 ? routeCoordinates : fallbackRoute;
    const routeTarget = isNavigating ? destinationCoords : null;

    const etaDuration = durationText || (isClaim ? job.durationToClaimant : job.durationToOwner);
    const etaDistance = distanceText || (isClaim ? job.distanceToClaimant : job.distanceToOwner);

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

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow camera access to take this photo.');
            return null;
        }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.8 });
        if (!result.canceled && result.assets?.[0]?.uri) {
            return result.assets[0].uri;
        }
        return null;
    };

    // ── pre_policy handlers ─────────────────────────────────────────
    const onToggleOwnerVerified = () => dispatch(setOwnerVerified(!ownerVerified));

    const onCaptureVin = async () => {
        const uri = await takePhoto();
        if (!uri) return;
        dispatch(setVinCapture({ photoUri: uri }));
        submitVin({ orderId: job.orderNumber, photoUri: uri, number: vinNumber })
            .unwrap()
            .catch((e) => console.warn('[CarInsurance] submit-vin failed', e?.message || e));
    };
    const onChangeVinNumber = (number) => dispatch(setVinCapture({ number }));

    const onCaptureConditionPhoto = async (side) => {
        const uri = await takePhoto();
        if (!uri) return;
        dispatch(setConditionPhoto({ side, uri }));
        submitConditionPhoto({ orderId: job.orderNumber, side, photoUri: uri })
            .unwrap()
            .catch((e) => console.warn('[CarInsurance] submit-condition-photo failed', e?.message || e));
    };

    const onToggleExistingDamage = (found) => dispatch(setExistingDamage({ found, notes: found ? existingDamageNotes : '' }));
    const onChangeExistingDamageNotes = (notes) => dispatch(setExistingDamage({ notes }));

    const onToggleOwnerConsent = () => {
        const next = !ownerConsent;
        dispatch(setOwnerConsent(next));
        if (next) {
            submitOwnerConsent({ orderId: job.orderNumber })
                .unwrap()
                .catch((e) => console.warn('[CarInsurance] submit-owner-consent failed', e?.message || e));
        }
    };

    // ── claim handlers ───────────────────────────────────────────────
    const onToggleClaimantVerified = () => dispatch(setClaimantVerified(!claimantVerified));

    const onAddDamagePhoto = async () => {
        const uri = await takePhoto();
        if (!uri) return;
        const id = `dmg_${Date.now()}`;
        dispatch(addDamagePhoto({ id, uri, note: '' }));
        submitDamagePhoto({ orderId: job.orderNumber, photoUri: uri, note: '' })
            .unwrap()
            .catch((e) => console.warn('[CarInsurance] submit-damage-photo failed', e?.message || e));
    };
    const onChangeDamagePhotoNote = (id, note) => dispatch(updateDamagePhotoNote({ id, note }));
    const onRemoveDamagePhoto = (id) => dispatch(removeDamagePhoto(id));

    const onChangeIncidentNotes = (notes) => dispatch(setIncidentNotes(notes));
    const onChangePoliceReportNumber = (num) => dispatch(setPoliceReportNumber(num));

    const goIncidentDetailsContinue = () => {
        if (!incidentNotes.trim()) {
            Alert.alert('Add a note', 'Briefly describe what happened before continuing.');
            return;
        }
        submitIncidentDetails({ orderId: job.orderNumber, notes: incidentNotes, policeReportNumber })
            .unwrap()
            .catch((e) => console.warn('[CarInsurance] submit-incident failed', e?.message || e));
        goToStep('severity');
    };

    const onChangeSeverity = (level) => dispatch(setSeverity(level));

    const goSeverityContinue = () => {
        submitSeverity({ orderId: job.orderNumber, severity })
            .unwrap()
            .catch((e) => console.warn('[CarInsurance] submit-severity failed', e?.message || e));
        goToStep('claimant_consent');
    };

    const onToggleClaimantConsent = () => {
        const next = !claimantConsent;
        dispatch(setClaimantConsent(next));
        if (next) {
            submitClaimantConsent({ orderId: job.orderNumber })
                .unwrap()
                .catch((e) => console.warn('[CarInsurance] submit-claimant-consent failed', e?.message || e));
        }
    };

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
            damagePhotoCount: isClaim ? damagePhotos.length : null,
            severity: isClaim ? severity : null,
        };

        dispatch(updateTodayStats({ tripsDelta: 1, earningsDelta: total }));
        dispatch(setCarInsuranceOrderStatus('completed'));

        openSummary(summary);

        completeCarInsuranceOrder({ orderId: job.orderNumber, phase: job.phase })
            .unwrap()
            .catch((e) => console.warn('[CarInsurance] complete failed', e?.message || e));
    };

    const stepMeta = {
        to_location: {
            title: isClaim ? 'Navigate to Incident' : 'Navigate to Owner',
            subtitle: currentStep?.instruction || `Head to ${destinationLabel}`,
            badge: { label: 'EN ROUTE', variant: 'primary' },
            color: primaryHex,
            cta: "I've Arrived",
            ctaVariant: 'primary',
            ctaIcon: 'map-marker-outline',
            onCta: () => goToStep('at_location'),
        },
        at_location: {
            title: isClaim ? 'Meet the Claimant' : 'Meet the Owner',
            subtitle: isClaim ? 'Verify identity, then document the damage' : 'Verify identity, then inspect the vehicle',
            badge: { label: 'ARRIVED', variant: 'success' },
            color: successHex,
            cta: isClaim ? 'Verify Claimant' : 'Verify Owner',
            ctaVariant: 'success',
            ctaIcon: 'card-account-details-outline',
            onCta: () => goToStep(isClaim ? 'verify_claimant' : 'verify_owner'),
        },
        verify_owner: {
            title: 'Verify Owner & Policy',
            subtitle: 'Confirm identity and policy number',
            badge: { label: 'VERIFYING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to VIN',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('vin_capture'),
            ctaDisabled: !ownerVerified,
        },
        vin_capture: {
            title: 'Capture VIN',
            subtitle: 'Photo + typed chassis number',
            badge: { label: 'VIN', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Inspection',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('condition_inspection'),
            ctaDisabled: !vinPhotoUri || !vinNumber.trim(),
        },
        condition_inspection: {
            title: 'Condition Inspection',
            subtitle: `${Object.values(conditionPhotos).filter(Boolean).length} / 6 photos captured`,
            badge: { label: 'INSPECTING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('existing_damage'),
            ctaDisabled: !conditionComplete,
        },
        existing_damage: {
            title: 'Existing Damage',
            subtitle: 'Note anything already there',
            badge: { label: 'REVIEW', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Consent',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('owner_consent'),
            ctaDisabled: existingDamageFound && !existingDamageNotes.trim(),
        },
        owner_consent: {
            title: 'Owner Sign-off',
            subtitle: 'Confirm the report is accurate',
            badge: { label: 'CONSENT', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Submit',
            ctaVariant: 'success',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('submit_report'),
            ctaDisabled: !ownerConsent,
        },
        verify_claimant: {
            title: 'Verify Claimant',
            subtitle: 'Confirm identity and claim number',
            badge: { label: 'VERIFYING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Photos',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('damage_photos'),
            ctaDisabled: !claimantVerified,
        },
        damage_photos: {
            title: 'Damage Photos',
            subtitle: `${damagePhotos.length} photo${damagePhotos.length === 1 ? '' : 's'} added`,
            badge: { label: 'DOCUMENTING', variant: 'warning' },
            color: warningHex,
            cta: 'Continue',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('incident_details'),
            ctaDisabled: damagePhotos.length === 0,
        },
        incident_details: {
            title: 'Incident Details',
            subtitle: 'What happened, and when',
            badge: { label: 'DETAILS', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Severity',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: goIncidentDetailsContinue,
        },
        severity: {
            title: 'Damage Severity',
            subtitle: 'Tag for the adjuster',
            badge: { label: 'TRIAGE', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Consent',
            ctaVariant: 'warning',
            ctaIcon: 'arrow-right',
            onCta: goSeverityContinue,
            ctaDisabled: !severity,
        },
        claimant_consent: {
            title: 'Claimant Sign-off',
            subtitle: 'Confirm the report is accurate',
            badge: { label: 'CONSENT', variant: 'warning' },
            color: warningHex,
            cta: 'Continue to Submit',
            ctaVariant: 'success',
            ctaIcon: 'arrow-right',
            onCta: () => goToStep('submit_report'),
            ctaDisabled: !claimantConsent,
        },
        submit_report: {
            title: 'Submit Report',
            subtitle: isClaim ? 'Send to the claims adjuster' : 'Send to the insurer',
            badge: { label: 'READY', variant: 'success' },
            color: successHex,
            cta: 'Submit & Complete',
            ctaVariant: 'success',
            ctaIcon: 'check-circle-outline',
            onCta: goComplete,
        },
    }[step];

    return (
        <View style={{ flex: 1, backgroundColor: colors?.background ?? '#060E1A' }}>
            <InsuranceInspectionMapPanel
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
                onOpenMaps={() => openMaps(destinationCoords, destinationLabel)}
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
                    <InsuranceInspectionSheetBody
                        step={step}
                        job={job}
                        primaryHex={primaryHex}
                        warningHex={warningHex}
                        successHex={successHex}
                        isDark={isDark}
                        etaDistance={etaDistance}
                        etaDuration={etaDuration}
                        routeLoading={routeLoading}
                        ownerVerified={ownerVerified}
                        onToggleOwnerVerified={onToggleOwnerVerified}
                        vinPhotoUri={vinPhotoUri}
                        vinNumber={vinNumber}
                        onCaptureVin={onCaptureVin}
                        onChangeVinNumber={onChangeVinNumber}
                        conditionPhotos={conditionPhotos}
                        onCaptureConditionPhoto={onCaptureConditionPhoto}
                        existingDamageFound={existingDamageFound}
                        onToggleExistingDamage={onToggleExistingDamage}
                        existingDamageNotes={existingDamageNotes}
                        onChangeExistingDamageNotes={onChangeExistingDamageNotes}
                        ownerConsent={ownerConsent}
                        onToggleOwnerConsent={onToggleOwnerConsent}
                        claimantVerified={claimantVerified}
                        onToggleClaimantVerified={onToggleClaimantVerified}
                        damagePhotos={damagePhotos}
                        onAddDamagePhoto={onAddDamagePhoto}
                        onChangeDamagePhotoNote={onChangeDamagePhotoNote}
                        onRemoveDamagePhoto={onRemoveDamagePhoto}
                        incidentNotes={incidentNotes}
                        onChangeIncidentNotes={onChangeIncidentNotes}
                        policeReportNumber={policeReportNumber}
                        onChangePoliceReportNumber={onChangePoliceReportNumber}
                        severity={severity}
                        onChangeSeverity={onChangeSeverity}
                        claimantConsent={claimantConsent}
                        onToggleClaimantConsent={onToggleClaimantConsent}
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
