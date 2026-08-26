// src/screens/main/home/HomeScreen.js

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDriverSocket } from '@/services/DriverSocketContext';
import { useUpdateDriverStatusMutation } from '@/features/driver/driverApi';
import { setOnlineStatus } from '@/features/driver/driverSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import LogoAvatar from '@/components/ui/LogoAvatar';
import ServiceCard from '@/components/ServiceCard';
import OnlineStatus from '@/components/OnlineStatus';
import OnlineWaiting from '@/components/OnlineWaiting';
import Button from '@/components/ui/Button';

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
    const { isOnline, incomingRide, rideStatus } = useSelector((state) => state.driver);
    const { driver } = useSelector((state) => state.auth);
    const [updateDriverStatus] = useUpdateDriverStatusMutation();
    const { goOnline, goOffline } = useDriverSocket();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    // Open IncomingRideModal when a new request arrives while on Home.
    // Home lives inside Tab → must navigate on parent Stack.
    useEffect(() => {
        if (incomingRide && rideStatus === 'incoming') {
            const parent = navigation.getParent();
            if (parent) {
                parent.navigate('IncomingRide');
            } else {
                navigation.navigate('IncomingRide');
            }
        }
    }, [incomingRide, rideStatus, navigation]);

    const toggleOnline = async (val) => {
        dispatch(setOnlineStatus(val));
        try {
            console.log("[Toggle] sending to API:", { isOnline: val });
            await updateDriverStatus({ isOnline: val }).unwrap();
            if (val) goOnline();
            else goOffline();
            console.log(`[Driver] is_online set to ${val}`);
        } catch (e) {
            console.warn(
                "[Driver] Failed to update online status:",
                e?.data?.message || e.message,
            );
            dispatch(setOnlineStatus(!val));
        }
    };

    return (
        <View
            className="flex-1 bg-background"
            style={{ paddingTop: insets.top }}
        >
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />

            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <LogoAvatar name={driver?.name} useLogoAvatarClass={false} />

                <OnlineStatus
                    name={driver?.name}
                    isOnline={isOnline}
                    onToggleOnline={toggleOnline}
                    absolute={false}
                />

                {/* ── Status banner: 3 states ── */}
                {!isOnline && (
                    // State 1: OFFLINE — default message
                    <OnlineWaiting
                        isOnline={false}
                        offlineMessage="You are offline. Toggle to start receiving requests."
                        showPulse={false}
                        className="mb-4"
                    />
                )}

                {/* {isOnline && !incomingRide && ( */}
                {isOnline && (
                    // State 2: ONLINE but no ride yet — pulsing waiting banner
                    <OnlineWaiting
                        isOnline={true}
                        onlineMessage="Waiting for ride requests..."
                        showPulse={true}
                        className="mb-4"
                    />
                )}

                {/* {isOnline && incomingRide && ( */}
                {isOnline && (
                    // State 3: ONLINE + incoming ride — CTA button
                    <Button
                        variant="primary"
                        size="md"
                        leftIcon="car-arrow-right"
                        className="mb-4"
                        onPress={() => {
                            const parent = navigation.getParent();
                            if (parent) parent.navigate('Driver');
                            else navigation.navigate('Driver');
                        }}
                    >
                        You have 1 Ride Request — View Now
                    </Button>
                )}


                <View className="flex-1 rounded-2xl border border-border bg-card px-4 py-5 mb-2">
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
        </View>
    );
}