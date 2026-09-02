// src/screens/main/gig/GigJobScreen.js
/**
 * Active gig flow after Accept:
 *  accepted → on_the_way → arrive_checkin → start_job → in_progress → proof
 * then navigates to GigWaiting → GigComplete
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme';
import {
  setGigOrderStatus,
  setGigLastSummary,
  clearActiveGigOrder,
} from '@/features/gig/gigSlice';
import { updateTodayStats } from '@/features/driver/driverSlice';
import {
  useCompleteGigJobMutation,
  useUpdateGigStatusMutation,
} from '@/features/gig/gigApi';
import { useDirections } from '@/hooks/useDirections';
import {
  DEMO,
  DEMO_DRIVER,
  getJobTotal,
  formatMoney,
} from '@/screens/main/gig/gigDemo';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import GigMapPanel from '@/components/gig/GigMapPanel';
import GigSheetBody from '@/components/gig/GigSheetBody';

export default function GigJobScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const currentLocation = useSelector((s) => s.driver.currentLocation);
  const activeOrder = useSelector((s) => s.gig.activeOrder);
  const [completeGig, { isLoading }] = useCompleteGigJobMutation();
  const [updateStatus] = useUpdateGigStatusMutation();

  const job = route?.params?.job || activeOrder || DEMO;

  const [step, setStep] = useState(route?.params?.initialStep ?? 'accepted');
  const [checkedItems, setCheckedItems] = useState({});
  const [arrivalPhoto, setArrivalPhoto] = useState(null);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [extraWork, setExtraWork] = useState([]);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [cancelSecondsLeft, setCancelSecondsLeft] = useState(
    (job.cancelWindowMinutes || 15) * 60,
  );

  const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
  const warningHex = isDark ? '#FBBF24' : '#D97706';
  const successHex = isDark ? '#34D399' : '#16A34A';

  const slideAnim = useRef(new Animated.Value(300)).current;
  const mapRef = useRef(null);
  const stepHistoryRef = useRef([]);
  const workTimerRef = useRef(null);
  const cancelTimerRef = useRef(null);

  const extraTotal = extraWork.reduce((s, e) => s + (e.amount || 0), 0);
  const total = getJobTotal(job) + extraTotal;
  const driverCoords = currentLocation ?? DEMO_DRIVER;
  const isNavigating = step === 'accepted' || step === 'on_the_way';
  const destination =
    step === 'accepted' || step === 'on_the_way' ? job.customerCoords : null;

  const {
    routeCoordinates,
    currentStep,
    distanceText,
    durationText,
    isLoading: routeLoading,
  } = useDirections(destination);

  const fallbackRoute = job.routeToJob || DEMO.routeToJob;
  const routeCoords =
    routeCoordinates.length > 0 ? routeCoordinates : fallbackRoute;
  const routeTarget = job.customerCoords;
  const etaDuration = durationText || job.durationToJob;
  const etaDistance = distanceText || job.distanceToJob;

  // Cancel window countdown
  useEffect(() => {
    cancelTimerRef.current = setInterval(() => {
      setCancelSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(cancelTimerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(cancelTimerRef.current);
  }, []);

  // Work timer while in_progress
  useEffect(() => {
    if (step !== 'in_progress') {
      if (workTimerRef.current) clearInterval(workTimerRef.current);
      return;
    }
    workTimerRef.current = setInterval(() => {
      setWorkSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(workTimerRef.current);
  }, [step]);

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
        edgePadding: { top: 100, right: 60, bottom: 340, left: 60 },
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

  const openMaps = () => {
    const c = job.customerCoords;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}&travelmode=driving`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Maps', `Navigate to ${job.customerName}`),
    );
  };

  const callPhone = (phone, who) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Call', `Calling ${who}…`),
    );
  };

  const checklist = job.checklist || [];
  const allChecked =
    checklist.length === 0 || checklist.every((it) => checkedItems[it.id]);
  const toggleItem = (id) =>
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  /**
   * Capture a job photo (arrival / before / after).
   * Unlike EditDriverProfileScreen (avatar uses allowsEditing + aspect [1,1]
   * for a square crop), job proof photos keep the full camera frame so
   * portrait shots are not cropped away before display.
   */
  const takePhoto = async (setter) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow camera access to take job photos.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      // Full frame — do NOT enable allowsEditing (that opens a square crop UI)
      allowsEditing: false,
      quality: 0.85,
      exif: false,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setter(result.assets[0].uri);
    }
  };

  const pingStatus = (status) => {
    updateStatus({ orderId: job.orderNumber, status }).catch(() => { });
  };

  const onStartNavigation = () => {
    openMaps();
    goToStep('on_the_way');
    pingStatus('on_the_way');
  };

  const onImOnTheWay = () => {
    goToStep('on_the_way');
    pingStatus('on_the_way');
  };

  const onCancelJob = () => {
    if (cancelSecondsLeft <= 0) {
      Alert.alert('Cancel closed', 'Cancel window has expired.');
      return;
    }
    Alert.alert('Cancel this job?', 'Customer will be notified.', [
      { text: 'Keep job', style: 'cancel' },
      {
        text: 'Cancel job',
        style: 'destructive',
        onPress: () => {
          dispatch(clearActiveGigOrder());
          dispatch(setGigOrderStatus('idle'));
          navigation.goBack();
        },
      },
    ]);
  };

  const onAddExtraWork = () => {
    Alert.prompt?.(
      'Extra work',
      'Describe the extra work',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (text) => {
            if (!text?.trim()) return;
            setExtraWork((prev) => [
              ...prev,
              { label: text.trim(), amount: 100 },
            ]);
          },
        },
      ],
      'plain-text',
    );
    // Android fallback (Alert.prompt is iOS-only)
    if (!Alert.prompt) {
      setExtraWork((prev) => [
        ...prev,
        { label: 'Extra edge / tidy-up', amount: 100 },
      ]);
      Alert.alert('Extra work added', '+$100 for extra edge / tidy-up');
    }
  };

  const goSubmitProof = () => {
    const summary = {
      orderNumber: job.orderNumber,
      title: job.title,
      category: job.category,
      customerName: job.customerName,
      baseFare: job.baseFare || 0,
      tip: job.tip || 0,
      bonus: job.bonus || 0,
      extraTotal,
      total,
      currencySymbol: job.currencySymbol || '$',
    };

    dispatch(updateTodayStats({ tripsDelta: 1, earningsDelta: summary.total }));
    dispatch(setGigLastSummary(summary));
    dispatch(setGigOrderStatus('waiting_confirm'));

    navigation.replace('GigWaiting', { summary, job });

    completeGig({
      orderId: job.orderNumber,
      beforePhotoUri: beforePhoto,
      afterPhotoUri: afterPhoto,
      arrivalPhotoUri: arrivalPhoto,
      notes,
      checklist: checklist.map((c) => ({
        id: c.id,
        label: c.label,
        done: !!checkedItems[c.id],
      })),
      extraWork,
    })
      .unwrap()
      .catch((e) => console.warn('[GigJob] complete failed', e?.message || e));
  };

  const stepMeta = {
    accepted: {
      title: 'Job Accepted – Go to location',
      subtitle: currentStep?.instruction || 'Head to the job site',
      badge: { label: 'ACCEPTED', variant: 'primary' },
      color: primaryHex,
    },
    on_the_way: {
      title: "I'm on the way",
      subtitle: currentStep?.instruction || 'Navigating to job site',
      badge: { label: 'EN ROUTE', variant: 'primary' },
      color: primaryHex,
      cta: "I've Arrived",
      ctaVariant: 'primary',
      ctaIcon: 'map-marker-check-outline',
      onCta: () => {
        goToStep('arrive_checkin');
        pingStatus('arrived');
      },
    },
    arrive_checkin: {
      title: 'Arrived at Job Site',
      subtitle: 'GPS check-in photo required',
      badge: { label: 'ARRIVED', variant: 'warning' },
      color: warningHex,
      cta: 'Confirm Arrival',
      ctaVariant: 'warning',
      ctaIcon: 'check',
      onCta: () => {
        if (!arrivalPhoto) {
          Alert.alert('Photo required', 'Please take an arrival photo.');
          return;
        }
        goToStep('start_job');
      },
      ctaDisabled: !arrivalPhoto,
    },
    start_job: {
      title: 'Start Job',
      subtitle: 'Checklist + before photo, then begin',
      badge: { label: 'READY', variant: 'warning' },
      color: warningHex,
      cta: 'Start Work',
      ctaVariant: 'warning',
      ctaIcon: 'play',
      onCta: () => {
        if (!beforePhoto) {
          Alert.alert('Photo required', 'Please take a before-work photo.');
          return;
        }
        setWorkSeconds(0);
        goToStep('in_progress');
        pingStatus('in_progress');
      },
      ctaDisabled: !beforePhoto,
    },
    in_progress: {
      title: 'Job In Progress',
      subtitle: 'Complete checklist, add notes if needed',
      badge: { label: 'WORKING', variant: 'success' },
      color: successHex,
      cta: 'Mark Complete',
      ctaVariant: 'success',
      ctaIcon: 'check-circle-outline',
      onCta: () => {
        if (!allChecked) {
          Alert.alert('Checklist', 'Mark all tasks before completing.');
          return;
        }
        goToStep('proof');
      },
      ctaDisabled: !allChecked,
    },
    proof: {
      title: 'Proof of Work',
      subtitle: 'Before is ready — add after photo',
      badge: { label: 'PHOTOS', variant: 'success' },
      color: successHex,
      cta: 'Submit Completion',
      ctaVariant: 'success',
      ctaIcon: 'check-circle',
      onCta: () => {
        if (!beforePhoto || !afterPhoto) {
          Alert.alert('Photos required', 'After photo is required.');
          return;
        }
        goSubmitProof();
      },
      ctaDisabled: !beforePhoto || !afterPhoto,
    },
  }[step] || {
    title: 'Gig Job',
    subtitle: '',
    badge: { label: 'ACTIVE', variant: 'primary' },
    color: primaryHex,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors?.background ?? '#060E1A' }}>
      <GigMapPanel
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
        onOpenMaps={openMaps}
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
            <Text
              className='step-title'
              style={[
                { color: isDark ? '#F0F9FF' : '#0F172A' },
              ]}
            >
              {stepMeta.title}
            </Text>
            <Text
              className='step-subtitle'
              style={[
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
          <GigSheetBody
            step={step}
            job={job}
            primaryHex={primaryHex}
            successHex={successHex}
            warningHex={warningHex}
            isDark={isDark}
            etaDistance={etaDistance}
            etaDuration={etaDuration}
            routeLoading={routeLoading}
            checkedItems={checkedItems}
            toggleItem={toggleItem}
            arrivalPhoto={arrivalPhoto}
            takeArrivalPhoto={() => takePhoto(setArrivalPhoto)}
            beforePhoto={beforePhoto}
            takeBeforePhoto={() => takePhoto(setBeforePhoto)}
            afterPhoto={afterPhoto}
            takeAfterPhoto={() => takePhoto(setAfterPhoto)}
            notes={notes}
            setNotes={setNotes}
            extraWork={extraWork}
            onAddExtraWork={onAddExtraWork}
            workSeconds={workSeconds}
            cancelSecondsLeft={cancelSecondsLeft}
            callPhone={callPhone}
            onStartNavigation={onStartNavigation}
            onImOnTheWay={onImOnTheWay}
            onCancelJob={onCancelJob}
          />
        </ScrollView>

        {stepMeta?.cta ? (
          <Button
            variant={stepMeta.ctaVariant}
            leftIcon={stepMeta.ctaIcon}
            onPress={stepMeta.onCta}
            disabled={stepMeta.ctaDisabled || isLoading}
          >
            {isLoading ? 'Please wait…' : stepMeta.cta}
          </Button>
        ) : null}
      </Animated.View>
    </View>
  );
}
