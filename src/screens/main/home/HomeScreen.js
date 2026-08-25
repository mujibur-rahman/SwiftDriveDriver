// src/screens/main/home/HomeScreen.js

import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StatusBar, ScrollView } from 'react-native';
import { useDriverSocket } from '@/services/DriverSocketContext';
import { useUpdateDriverStatusMutation } from '@/features/driver/driverApi';
import { setOnlineStatus } from '@/features/driver/driverSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import LogoAvatar from '@/components/ui/LogoAvatar';
import ServiceCard from '@/components/ServiceCard';
import OnlineStatus from '@/components/OnlineStatus';
import OnlineWaiting from '@/components/OnlineWaiting';

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
    const { isOnline } = useSelector((state) => state.driver);
    const { driver } = useSelector((state) => state.auth);
    const [updateDriverStatus] = useUpdateDriverStatusMutation();
    const { goOnline, goOffline } = useDriverSocket();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

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

            {/* ── Scrollable upper content ─────────────────────────────── */}
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header: Logo + Avatar + Greeting */}
                <LogoAvatar name={driver?.name} useLogoAvatarClass={false} />

                <OnlineStatus
                    name={driver?.name}
                    isOnline={isOnline}
                    onToggleOnline={toggleOnline}
                    absolute={false}
                />

                <OnlineWaiting
                    isOnline={isOnline}
                    onlineMessage="Waiting for ride requests..."
                    offlineMessage="You are offline. Toggle to start receiving requests."
                    showPulse={true}
                    className="mb-4"
                />

                {/* ── Advertisement / Middle section ──────────────────── */}
                {/* Height grows automatically with inner content.         */}
                {/* Future sections can be added below this card.          */}
                <View className="flex-1 rounded-2xl border border-border bg-card px-4 py-5 mb-2">
                    <Text className="text-xs font-inter-semibold text-foreground-muted mb-3 uppercase tracking-widest">
                        Advertisement
                    </Text>

                    {/* Placeholder banner — replace with real ad component */}
                    <View className="rounded-xl bg-background-muted items-center justify-center py-10">
                        <Text className="text-primary font-inter-bold text-base">
                            Your ad will appear here
                        </Text>
                        <Text className="text-foreground-muted font-inter text-xs mt-1">
                            Promotions · Offers · Updates
                        </Text>
                    </View>

                    {/* Future sections go below here */}
                </View>
            </ScrollView>

            {/* ── Service grid — always pinned to bottom ──────────────── */}
            {/* marginBottom clears the floating pill tab bar (~90px) + device bottom inset */}
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