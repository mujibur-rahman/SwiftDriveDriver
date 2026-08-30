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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { DARK_MAP_STYLE } from '@/utils/mapStyles';
import LogoAvatar from '@/components/ui/LogoAvatar';
import ServiceCard from '@/components/ServiceCard';
import OnlineStatus from '@/components/OnlineStatus';
import OnlineWaiting from '@/components/OnlineWaiting';
import Button from '@/components/ui/Button';
import IncomingFoodDeliveryModal from '@/components/food/IncomingFoodDeliveryModal';

const DEMO_RESTAURANT_COORDS = { latitude: -33.8842, longitude: 151.2101 };
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
    const [foodModalVisible, setFoodModalVisible] = useState(false);

    useEffect(() => {
        if (incomingRide && rideStatus === 'incoming') {
            const parent = navigation.getParent();
            if (parent) parent.navigate('IncomingRide');
            else navigation.navigate('IncomingRide');
        }
    }, [incomingRide, rideStatus, navigation]);

    useEffect(() => {
        if (!foodModalVisible || !mapRef.current) return;
        const driverPos = currentLocation ?? DEMO_DRIVER;
        const rest = DEMO_RESTAURANT_COORDS;
        const midLat = (driverPos.latitude + rest.latitude) / 2;
        const midLng = (driverPos.longitude + rest.longitude) / 2;
        const deltaLat = Math.max(
            Math.abs(driverPos.latitude - rest.latitude) * 1.6,
            0.018,
        );
        const deltaLng = Math.max(
            Math.abs(driverPos.longitude - rest.longitude) * 1.6,
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
    }, [foodModalVisible, currentLocation]);

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

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {foodModalVisible && (
                <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    customMapStyle={isDark ? DARK_MAP_STYLE : undefined}
                    showsUserLocation
                    showsMyLocationButton={false}
                    initialRegion={{
                        ...DEMO_RESTAURANT_COORDS,
                        latitudeDelta: 0.028,
                        longitudeDelta: 0.028,
                    }}
                >
                    <Marker
                        coordinate={DEMO_RESTAURANT_COORDS}
                        title="Hungry Jack's"
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
                            <Icon name="storefront-outline" size={22} color={warningHex} />
                        </View>
                    </Marker>
                    {currentLocation && (
                        <Polyline
                            coordinates={[currentLocation, DEMO_RESTAURANT_COORDS]}
                            strokeColor={primaryHex}
                            strokeWidth={3}
                            lineDashPattern={[8, 4]}
                        />
                    )}
                </MapView>
            )}

            {!foodModalVisible && (
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
                            <View className="mt-3 mb-3 gap-3">
                                <OnlineWaiting
                                    isOnline={true}
                                    onlineMessage="Waiting for requests..."
                                    showPulse={true}
                                />
                                <View className="gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon="car-arrow-right"
                                        onPress={() => {
                                            const parent = navigation.getParent();
                                            if (parent) parent.navigate('Driver');
                                            else navigation.navigate('Driver');
                                        }}
                                    >
                                        You have 1 Ride Request — View Now
                                    </Button>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        leftIcon="food"
                                        onPress={openFoodModal}
                                    >
                                        You have 1 Food Delivery Request — View Now
                                    </Button>
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
        </View>
    );
}