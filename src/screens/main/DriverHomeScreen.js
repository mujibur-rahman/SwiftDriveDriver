// src/screens/main/DriverHomeScreen.js
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Platform,
  Linking,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineStatus } from "@/features/driver/driverSlice";
import { useDriverSocket } from "@/services/DriverSocketContext";
import {
  useGetTodayEarningsQuery,
  useUpdateDriverStatusMutation,
} from "@/features/driver/driverApi";
import { downloadModels } from "@/services/fl/ModelManager";
import { runInference } from "@/services/fl/FLInference";
import { useTheme } from "@/theme";
import QuickActionsRow from "@/components/ui/QuickActionsRow";
import StatRow from "@/components/ui/StatRow";
import StatCardsRow from "@/components/ui/StatCardsRow";
import Button from "@/components/ui/Button";
import OnlineStatus from "@/components/OnlineStatus";

export default function DriverHomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isOnline, currentLocation, rideStatus, incomingRide } = useSelector(
    (s) => s.driver,
  );
  const { driver, isAuthenticated } = useSelector((s) => s.auth);
  const { goOnline, goOffline, updateLocation } = useDriverSocket();
  const { colors, isDark } = useTheme();
  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const locationSub = useRef(null);

  const primary = colors?.primary ?? "#38BDF8";

  const { data: earningsData } = useGetTodayEarningsQuery("today", {
    skip: !isAuthenticated,
  });
  const [updateDriverStatus] = useUpdateDriverStatusMutation();

  const todayStats = {
    trips: earningsData?.summary?.periodTrips ?? 0,
    earnings: earningsData?.summary?.totalBalance ?? 0,
    hours: earningsData?.summary?.hoursOnline ?? 0,
  };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
    }).start();
    requestLocationPermission();
    return () => {
      locationSub.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (incomingRide && rideStatus === "incoming") {
      navigation.navigate("IncomingRide");
    }
  }, [incomingRide, rideStatus]);

  useEffect(() => {
    if (rideStatus === "accepted" || rideStatus === "ongoing") {
      navigation.navigate("ActiveRide");
    }
  }, [rideStatus]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      await startTracking();
    } catch (e) {
      console.warn("Location error:", e.message);
    }
  };

  const startTracking = async () => {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    updateLocation(coords);
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      800,
    );

    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 15,
      },
      (l) =>
        updateLocation({
          latitude: l.coords.latitude,
          longitude: l.coords.longitude,
        }),
    );
  };

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

  const openNavigation = () => {
    if (!currentLocation) {
      Alert.alert("Location unavailable", "Waiting for GPS signal...");
      return;
    }

    const { latitude, longitude } = currentLocation;
    const googleMapsUrl = `google.navigation:q=${latitude},${longitude}&mode=d`;
    const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;

    Linking.canOpenURL(googleMapsUrl)
      .then((supported) => {
        if (supported) return Linking.openURL(googleMapsUrl);
        return Linking.openURL(geoUrl);
      })
      .catch(() => {
        Alert.alert("Navigation unavailable", "Please install Google Maps.");
      });
  };

  const testModelDownload = async () => {
    console.log("[Test] Starting model download...");
    const result = await downloadModels((progress) => {
      console.log("[Test] Progress:", progress);
    });
    console.log("[Test] Download result:", result);
  };

  const testInference = async () => {
    const context = {
      hour: 8,
      day_of_week: 1,
      pickup_lat: -33.8688,
      pickup_lng: 151.2093,
      distance_km: 5.2,
      online_drivers: 10,
      active_orders: 8,
      weather_code: 0,
    };

    console.log("[Test] Running on-device inference...");
    const result = await runInference(context);
    console.log("[Test] Inference result:", JSON.stringify(result, null, 2));
  };

  const gradTop = isDark
    ? ["rgba(6,14,26,0.95)", "rgba(6,14,26,0.7)", "transparent"]
    : ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.75)", "transparent"];

  return (
    <View className="flex-1 bg-background">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: currentLocation?.latitude || -33.8688,
          longitude: currentLocation?.longitude || 151.2093,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        {currentLocation && (
          <Marker coordinate={currentLocation}>
            <View
              className={`h-11 w-11 items-center justify-center rounded-full border-2 ${isOnline
                ? "border-primary bg-primary/30"
                : "border-border bg-background-muted"
                }`}
            >
              <Text className="text-[22px]">🚗</Text>
            </View>
          </Marker>
        )}
      </MapView>

      <OnlineStatus
        showGreeting={true}
        name={driver?.name}
        isOnline={isOnline}
        onToggleOnline={toggleOnline}
      />

      <Animated.View
        className="absolute bottom-0 left-0 right-0 gap-4 rounded-t-3xl border-t border-border bg-card px-5 pb-28 pt-5"
        style={{
          transform: [{ translateY: slideAnim }],
          shadowColor: colors?.foreground ?? "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          elevation: 20,
        }}
      >
        {/* <View className="flex-row gap-2.5">
          {[
            { label: "Trips Today", value: todayStats.trips, icon: "car" },
            {
              label: "Today's Earnings",
              value: `$${Number(todayStats.earnings).toFixed(2)}`,
              icon: "cash",
            },
            {
              label: "Hours Online",
              value: `${Number(todayStats.hours).toFixed(1)}h`,
              icon: "clock-outline",
            },
          ].map((stat) => (
            <View
              key={stat.label}
              className="flex-1 items-center gap-1 rounded-2xl border border-border bg-background-muted p-3.5"
            >
              <Icon name={stat.icon} size={20} color={primary} />
              <Text className="mt-1 text-base font-inter-bold text-foreground">
                {stat.value}
              </Text>
              <Text className="text-center text-[10px] font-inter text-foreground-muted">
                {stat.label}
              </Text>
            </View>
          ))}
        </View> */}

        <StatCardsRow
          items={[
            { label: "Trips Today", value: todayStats.trips, icon: "car" },
            {
              label: "Today's Earnings",
              value: `$${Number(todayStats.earnings).toFixed(2)}`,
              icon: "cash",
            },
            {
              label: "Hours Online",
              value: `${Number(todayStats.hours).toFixed(1)}h`,
              icon: "clock-outline",
            },
          ]}
        />

        <Button
          variant="muted"
          size="sm"
          onPress={testModelDownload}
        >
          Test FL Download
        </Button>

        <Button
          variant="info"
          size="sm"
          onPress={testInference}
        >
          Test Inference
        </Button>

        {isOnline ? (
          <View className="flex-row items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3.5">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-primary/30">
              <View className="h-2.5 w-2.5 rounded-full bg-primary" />
            </View>
            <Text className="text-sm font-inter-medium text-primary">
              Waiting for ride requests...
            </Text>
          </View>
        ) : (
          <View className="items-center rounded-xl bg-background-muted p-3.5">
            <Text className="text-center text-sm font-inter text-foreground-muted">
              You are offline. Toggle to start receiving requests.
            </Text>
          </View>
        )}

        {/* <View className="flex-row justify-between">
          {[
            {
              icon: "chart-bar",
              label: "Earnings",
              onPress: () => navigation.navigate("Earnings"),
            },
            {
              icon: "history",
              label: "History",
              onPress: () => navigation.navigate("RideHistory"),
            },
            {
              icon: "navigation-outline",
              label: "Navigate",
              onPress: openNavigation,
            },
            {
              icon: "account-outline",
              label: "Profile",
              onPress: () => navigation.navigate("Profile"),
            },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              className="flex-1 items-center gap-1.5"
              onPress={a.onPress}
            >
              <Icon name={a.icon} size={22} color={primary} />
              <Text className="text-[11px] font-inter text-foreground-muted">
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}

        <QuickActionsRow
          items={[
            {
              icon: "chart-bar",
              label: "Earnings",
              onPress: () => navigation.navigate("Earnings"),
            },
            {
              icon: "history",
              label: "History",
              onPress: () => navigation.navigate("RideHistory"),
            },
            {
              icon: "navigation-outline",
              label: "Navigate",
              onPress: openNavigation,
            },
            {
              icon: "account-outline",
              label: "Profile",
              onPress: () => navigation.navigate("Profile"),
            },
          ]}
        />

        {/* <View className="flex-row items-center rounded-xl bg-background-muted p-3.5">
          {[
            { label: "Rating", value: `⭐ ${driver?.rating || "4.92"}` },
            {
              label: "Acceptance",
              value: `${driver?.acceptanceRate || 100}%`,
            },
            {
              label: "Completion",
              value: `${driver?.completionRate || 100}%`,
            },
          ].map((m, i) => (
            <React.Fragment key={m.label}>
              {i > 0 && <View className="mx-1 h-8 w-px bg-border" />}
              <View className="flex-1 items-center gap-1">
                <Text className="text-base font-inter-bold text-foreground">
                  {m.value}
                </Text>
                <Text className="text-[11px] font-inter text-foreground-muted">
                  {m.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View> */}

        <StatRow
          items={[
            { label: "Rating", value: `⭐ ${driver?.rating || "4.92"}` },
            {
              label: "Acceptance",
              value: `${driver?.acceptanceRate || 100}%`,
            },
            {
              label: "Completion",
              value: `${driver?.completionRate || 100}%`,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}