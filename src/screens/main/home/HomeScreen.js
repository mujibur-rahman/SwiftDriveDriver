// src/screens/main/home/HomeScreen.js
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDriverSocket } from '@/services/DriverSocketContext';
import { useUpdateDriverStatusMutation } from '@/features/driver/driverApi';
import { setOnlineStatus } from '@/features/driver/driverSlice';
import { setFoodOrderStatus } from '@/features/food/foodSlice';
import { setParcelOrderStatus } from '@/features/parcel/parcelSlice';
import { setGigOrderStatus } from '@/features/gig/gigSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { DARK_MAP_STYLE } from '@/utils/mapStyles';
import LogoAvatar from '@/components/ui/LogoAvatar';
import ServiceCard from '@/components/ServiceCard';
import OnlineStatus from '@/components/OnlineStatus';
import OnlineWaiting from '@/components/OnlineWaiting';
import Badge from '@/components/ui/Badge';
import IncomingFoodDeliveryModal from '@/components/food/IncomingFoodDeliveryModal';
import IncomingParcelDeliveryModal from '@/components/parcel/IncomingParcelDeliveryModal';
import IncomingGigJobModal from '@/components/gig/IncomingGigJobModal';
import IncomingRequestRow from '@/components/ui/IncomingRequestRow';

const DEMO_RESTAURANT_COORDS = { latitude: -33.8842, longitude: 151.2101 };
const DEMO_SENDER_COORDS = { latitude: -33.907, longitude: 151.189 };
const DEMO_DRIVER = { latitude: -33.876, longitude: 151.203 };

const JOBS = [
    { id: '1', title: 'Ride', icon: 'ride' },
    { id: '2', title: 'Food delivery', icon: 'food' },
    { id: '3', title: 'Gig jobs', icon: 'gig' },
    { id: '4', title: 'Parcel delivery', icon: 'delivery' },
    { id: '5', title: 'Shop for me', icon: 'shoppingCart' },
    { id: '6', title: 'Marketplace pickup', icon: 'card' },
    { id: '7', title: 'Car insurance', icon: 'store' },
    { id: '8', title: 'Car rental', icon: 'uploadTruck' },
];

export default function HomeScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { isOnline, incomingRide, rideStatus, currentLocation } = useSelector(
        (state) => state.driver,
    );
    const { driver } = useSelector((state) => state.auth);
    const [updateDriverStatus] = useUpdateDriverStatusMutation();
    const { goOnline, goOffline } = useDriverSocket();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const mapRef = useRef(null);
    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = isDark ? '#34D399' : '#16A34A';
    const [foodModalVisible, setFoodModalVisible] = useState(false);
    const [parcelModalVisible, setParcelModalVisible] = useState(false);
    const [gigModalVisible, setGigModalVisible] = useState(false);
    const anyDeliveryModalVisible =
        foodModalVisible || parcelModalVisible || gigModalVisible;

    useEffect(() => {
        if (incomingRide && rideStatus === 'incoming') {
            const parent = navigation.getParent();
            if (parent) parent.navigate('IncomingRide');
            else navigation.navigate('IncomingRide');
        }
    }, [incomingRide, rideStatus, navigation]);

    useEffect(() => {
        if (!anyDeliveryModalVisible || !mapRef.current) return;
        const driverPos = currentLocation ?? DEMO_DRIVER;
        const pickup = foodModalVisible ? DEMO_RESTAURANT_COORDS : DEMO_SENDER_COORDS;
        const midLat = (driverPos.latitude + pickup.latitude) / 2;
        const midLng = (driverPos.longitude + pickup.longitude) / 2;
        const deltaLat = Math.max(
            Math.abs(driverPos.latitude - pickup.latitude) * 1.6,
            0.018,
        );
        const deltaLng = Math.max(
            Math.abs(driverPos.longitude - pickup.longitude) * 1.6,
            0.018,
        );
        setTimeout(() => {
            mapRef.current?.animateToRegion(
                {
                    latitude: midLat,
                    longitude: midLng,
                    latitudeDelta: deltaLat,
                    longitudeDelta: deltaLng,
                },
                600,
            );
        }, 300);
    }, [anyDeliveryModalVisible, foodModalVisible, currentLocation]);

    const toggleOnline = async (val) => {
        dispatch(setOnlineStatus(val));
        try {
            await updateDriverStatus({ isOnline: val }).unwrap();
            if (val) goOnline();
            else goOffline();
        } catch (e) {
            console.warn(
                '[Driver] Failed to update online status:',
                e?.data?.message || e.message,
            );
            dispatch(setOnlineStatus(!val));
        }
    };

    const openFoodModal = () => {
        dispatch(setFoodOrderStatus('incoming'));
        setFoodModalVisible(true);
    };

    const onFoodDecline = () => {
        setFoodModalVisible(false);
        dispatch(setFoodOrderStatus('idle'));
    };

    const onFoodAccept = () => {
        setFoodModalVisible(false);
        dispatch(setFoodOrderStatus('active'));
        const parent = navigation.getParent();
        if (parent) parent.navigate('FoodDelivery');
        else navigation.navigate('FoodDelivery');
    };

    const openParcelModal = () => {
        dispatch(setParcelOrderStatus('incoming'));
        setParcelModalVisible(true);
    };

    const onParcelDecline = () => {
        setParcelModalVisible(false);
        dispatch(setParcelOrderStatus('idle'));
    };

    const onParcelAccept = () => {
        setParcelModalVisible(false);
        dispatch(setParcelOrderStatus('active'));
        const parent = navigation.getParent();
        if (parent) parent.navigate('ParcelDelivery');
        else navigation.navigate('ParcelDelivery');
    };

    const openGigModal = () => {
        dispatch(setGigOrderStatus('incoming'));
        setGigModalVisible(true);
    };

    const onGigDecline = () => {
        setGigModalVisible(false);
        dispatch(setGigOrderStatus('idle'));
    };

    const onGigAccept = () => {
        setGigModalVisible(false);
        dispatch(setGigOrderStatus('active'));
        const parent = navigation.getParent();
        if (parent) parent.navigate('GigJob');
        else navigation.navigate('GigJob');
    };

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {anyDeliveryModalVisible && (
                <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    customMapStyle={isDark ? DARK_MAP_STYLE : undefined}
                    showsUserLocation
                    showsMyLocationButton={false}
                    initialRegion={{
                        ...(foodModalVisible ? DEMO_RESTAURANT_COORDS : DEMO_SENDER_COORDS),
                        latitudeDelta: 0.028,
                        longitudeDelta: 0.028,
                    }}
                >
                    <Marker
                        coordinate={foodModalVisible ? DEMO_RESTAURANT_COORDS : DEMO_SENDER_COORDS}
                        title={foodModalVisible ? "Hungry Jack's" : 'QuickShip Warehouse'}
                        description="Pickup location"
                    >
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: `${warningHex}28`,
                                borderWidth: 2.5,
                                borderColor: warningHex,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon
                                name={foodModalVisible ? 'storefront-outline' : 'package-variant-closed'}
                                size={22}
                                color={warningHex}
                            />
                        </View>
                    </Marker>
                    {currentLocation && (
                        <Polyline
                            coordinates={[
                                currentLocation,
                                foodModalVisible ? DEMO_RESTAURANT_COORDS : DEMO_SENDER_COORDS,
                            ]}
                            strokeColor={primaryHex}
                            strokeWidth={3}
                            lineDashPattern={[8, 4]}
                        />
                    )}
                </MapView>
            )}

            {!anyDeliveryModalVisible && (
                <>
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingBottom: 16,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        <LogoAvatar size={40} className="mb-1" />
                        <OnlineStatus
                            name={driver?.name}
                            isOnline={isOnline}
                            onToggleOnline={toggleOnline}
                            absolute={false}
                        />
                        {!isOnline && (
                            <OnlineWaiting
                                isOnline={false}
                                offlineMessage="You are offline. Toggle to start receiving requests."
                                showPulse={false}
                                className="mb-4 mt-3"
                            />
                        )}
                        {isOnline && (
                            <View className="mt-3 mb-3">
                                <View className="rounded-2xl border border-border bg-card overflow-hidden">
                                    <View className="flex-row items-center justify-between px-4 pt-3.5 pb-3">
                                        <View className="flex-row items-center gap-2">
                                            <View className="h-2 w-2 rounded-full bg-primary" />
                                            <Text className="text-xs font-inter-semibold text-foreground-muted uppercase tracking-widest">
                                                Incoming Requests
                                            </Text>
                                        </View>
                                        <Badge label="4 new" variant="primary" size="sm" />
                                    </View>

                                    <View className="h-px bg-border mx-4" />
                                    <IncomingRequestRow
                                        icon="car"
                                        iconColor={primaryHex}
                                        title="Ride Request"
                                        subtitle="2.1 km away · Surry Hills"
                                        meta="$8.40"
                                        onPress={() => {
                                            const parent = navigation.getParent();
                                            if (parent) parent.navigate('Driver');
                                            else navigation.navigate('Driver');
                                        }}
                                    />

                                    <View className="h-px bg-border mx-4" />
                                    <IncomingRequestRow
                                        icon="food"
                                        iconColor={warningHex}
                                        title="Food Delivery"
                                        subtitle="Hungry Jack's · 1.8 km"
                                        meta="$8.50"
                                        onPress={openFoodModal}
                                    />

                                    <View className="h-px bg-border mx-4" />
                                    <IncomingRequestRow
                                        icon="package-variant-closed"
                                        iconColor={successHex}
                                        title="Parcel Delivery"
                                        subtitle="QuickShip Warehouse · 2 parcels"
                                        meta="$12.00"
                                        onPress={openParcelModal}
                                    />

                                    <View className="h-px bg-border mx-4" />
                                    <IncomingRequestRow
                                        icon="briefcase-outline"
                                        iconColor={primaryHex}
                                        title="Gig Job · Lawn Mowing"
                                        subtitle="42 Bourke St · 2.4 km"
                                        meta="$50.00"
                                        onPress={openGigModal}
                                    />
                                </View>
                            </View>
                        )}
                        <View className="flex-1 rounded-2xl border border-border bg-card px-4 py-4 mb-4">
                            <Text className="text-xs font-inter-semibold text-foreground-muted mb-3 uppercase tracking-widest">
                                Advertisement
                            </Text>
                            <View className="rounded-xl bg-background-muted items-center justify-center py-10">
                                <Text className="text-primary font-inter-bold text-base">
                                    Your ad will appear here
                                </Text>
                                <Text className="text-foreground-muted font-inter text-xs mt-1">
                                    Promotions · Offers · Updates
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                    <View
                        className="service-grid mx-4"
                        style={{ marginBottom: insets.bottom + 90 }}
                    >
                        {JOBS.map((job) => (
                            <ServiceCard key={job.id} job={job} />
                        ))}
                    </View>
                </>
            )}

            <IncomingFoodDeliveryModal
                visible={foodModalVisible}
                onDecline={onFoodDecline}
                onAccept={onFoodAccept}
            />
            <IncomingParcelDeliveryModal
                visible={parcelModalVisible}
                onDecline={onParcelDecline}
                onAccept={onParcelAccept}
            />
            <IncomingGigJobModal
                visible={gigModalVisible}
                onDecline={onGigDecline}
                onAccept={onGigAccept}
            />
        </View>
    );
}