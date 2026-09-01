// src/screens/main/gig/GigJobScreen.js
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
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { setGigOrderStatus } from '@/features/gig/gigSlice';
import { updateTodayStats } from '@/features/driver/driverSlice';
import { useCompleteGigJobMutation } from '@/features/gig/gigApi';
import { useDirections } from '@/hooks/useDirections';
import { DEMO, DEMO_DRIVER } from '@/screens/main/gig/gigDemo';
import { gigStyles as styles } from '@/screens/main/gig/gigStyles';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import GigMapPanel from '@/components/gig/GigMapPanel';
import GigSheetBody from '@/components/gig/GigSheetBody';

/**
 * Active gig-job flow (Accept → Complete).
 *
 * Steps:
 *   to_location → arrived → start_job → in_progress → complete_photos → summary
 *
 * Mirrors FoodDeliveryScreen / ParcelDeliveryScreen so behaviour is familiar.
 */
export default function GigJobScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const currentLocation = useSelector((s) => s.driver.currentLocation);
  const [completeGig, { isLoading }] = useCompleteGigJobMutation();

  const [step, setStep] = useState(route?.params?.initialStep ?? 'to_location');
  const [checkedItems, setCheckedItems] = useState({});
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [notes, setNotes] = useState('');

  const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
  const warningHex = isDark ? '#FBBF24' : '#D97706';
  const successHex = isDark ? '#34D399' : '#16A34A';

  const slideAnim = useRef(new Animated.Value(300)).current;
  const mapRef = useRef(null);
  const stepHistoryRef = useRef([]);

  const total = DEMO.baseFare + (DEMO.tip || 0) + (DEMO.bonus || 0);
  const driverCoords = currentLocation ?? DEMO_DRIVER;
  const isNavigating = step === 'to_location';

  const destination = step === 'to_location' ? DEMO.customerCoords : null;

  const {
    routeCoordinates,
    currentStep,
    distanceText,
    durationText,
    isLoading: routeLoading,
  } = useDirections(destination);

  const fallbackRoute = DEMO.routeToJob;
  const routeCoords =
    routeCoordinates.length > 0 ? routeCoordinates : fallbackRoute;
  const routeTarget = DEMO.customerCoords;

  const etaDuration = durationText || DEMO.durationToJob;
  const etaDistance = distanceText || DEMO.distanceToJob;

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

  const allItemsChecked = DEMO.checklist.every((it) => checkedItems[it.id]);
  const toggleItem = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const takePhoto = async (setter) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Camera access is required for job photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setter(result.assets[0].uri);
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

  // Optimistic complete — same pattern as food/parcel so EarningsScreen
  // updates immediately even if the API is offline.
  const goComplete = () => {
    const summary = {
      orderNumber: DEMO.orderNumber,
      baseFare: DEMO.baseFare,
      tip: DEMO.tip || 0,
      bonus: DEMO.bonus || 0,
      total,
    };

    dispatch(updateTodayStats({ tripsDelta: 1, earningsDelta: summary.total }));
    dispatch(setGigOrderStatus('completed'));

    openSummary(summary);

    completeGig({
      orderId: DEMO.orderNumber,
      beforePhotoUri: beforePhoto,
      afterPhotoUri: afterPhoto,
      notes,
      checklist: DEMO.checklist.map((c) => ({
        id: c.id,
        label: c.label,
        done: !!checkedItems[c.id],
      })),
    })
      .unwrap()
      .catch((e) => {
        console.warn('[GigJob] complete API failed', e?.message || e);
      });
  };

  const stepMeta = {
    to_location: {
      title: 'Navigate to Job Site',
      subtitle:
        currentStep?.instruction || 'Head to the customer location',
      badge: { label: 'EN ROUTE', variant: 'primary' },
      color: primaryHex,
      cta: "I've Arrived",
      ctaVariant: 'primary',
      ctaIcon: 'map-marker-check-outline',
      onCta: () => goToStep('arrived'),
    },
    arrived: {
      title: 'Arrived at Job Site',
      subtitle: 'Confirm arrival and start when ready',
      badge: { label: 'ARRIVED', variant: 'warning' },
      color: warningHex,
    },
    start_job: {
      title: 'Start Job',
      subtitle: 'Review checklist, then begin work',
      badge: { label: 'READY', variant: 'warning' },
      color: warningHex,
      cta: 'Begin Work',
      ctaVariant: 'warning',
      ctaIcon: 'play',
      onCta: () => goToStep('in_progress'),
    },
    in_progress: {
      title: 'Job In Progress',
      subtitle: 'Complete tasks, then finish with photos',
      badge: { label: 'WORKING', variant: 'success' },
      color: successHex,
      cta: 'Mark Complete',
      ctaVariant: 'success',
      ctaIcon: 'check-circle-outline',
      onCta: () => {
        if (!allItemsChecked) {
          Alert.alert(
            'Checklist',
            'Please mark all tasks as done before completing.',
          );
          return;
        }
        goToStep('complete_photos');
      },
      ctaDisabled: !allItemsChecked,
    },
    complete_photos: {
      title: 'Proof of Work',
      subtitle: 'Before & after photos required',
      badge: { label: 'PHOTOS', variant: 'success' },
      color: successHex,
      cta: 'Submit & Complete',
      ctaVariant: 'success',
      ctaIcon: 'check-circle',
      onCta: () => {
        if (!beforePhoto || !afterPhoto) {
          Alert.alert(
            'Photos required',
            'Please take both before and after photos.',
          );
          return;
        }
        goComplete();
      },
      ctaDisabled: !beforePhoto || !afterPhoto,
    },
  }[step];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors?.background ?? '#060E1A',
      }}
    >
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
        onOpenMaps={() => openMaps(routeTarget, DEMO.customerName)}
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
          <GigSheetBody
            step={step}
            setStep={goToStep}
            primaryHex={primaryHex}
            warningHex={warningHex}
            successHex={successHex}
            colors={colors}
            isDark={isDark}
            etaDistance={etaDistance}
            etaDuration={etaDuration}
            total={total}
            routeLoading={routeLoading}
            checkedItems={checkedItems}
            toggleItem={toggleItem}
            beforePhoto={beforePhoto}
            afterPhoto={afterPhoto}
            takeBeforePhoto={() => takePhoto(setBeforePhoto)}
            takeAfterPhoto={() => takePhoto(setAfterPhoto)}
            notes={notes}
            setNotes={setNotes}
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
