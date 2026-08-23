// src/screens/main/ActiveRideScreen.js  (Driver)
import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Alert,
  Linking,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useTheme } from "@/theme";
import {
  useStartRideMutation,
  useCompleteRideMutation,
} from "@/features/driver/driverApi";
import { useDriverSocket } from "@/services/DriverSocketContext";
import { DARK_MAP_STYLE } from "@/utils/mapStyles";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import IconButton from "@/components/ui/IconButton";
import Avatar from "@/components/ui/Avatar";

export default function ActiveRideScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9");
  const success = isDark ? "#34D399" : "#16A34A";
  const info = isDark ? "#60A5FA" : "#2563EB";
  const error = isDark ? "#F87171" : "#DC2626";
  const onPrimary = isDark ? "#060E1A" : "#FFFFFF";

  const { rideStatus, activeRide, passenger, currentLocation } = useSelector(
    (s) => s.driver,
  );
  const { arrivedAtPickup } = useDriverSocket();
  const [startRide] = useStartRideMutation();
  const [completeRide] = useCompleteRideMutation();
  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const stepConfig = useMemo(
    () => ({
      accepted: {
        title: "Head to Pickup",
        subtitle: "Navigate to passenger location",
        primaryBtn: "I've Arrived",
        primaryAction: "arrived",
        color: primary,
        badgeVariant: "primary",
        buttonVariant: "primary",
      },
      arrived: {
        title: "Passenger Pickup",
        subtitle: "Waiting for passenger to board",
        primaryBtn: "Start Ride",
        primaryAction: "start",
        color: info,
        badgeVariant: "info",
        buttonVariant: "info",
      },
      ongoing: {
        title: "Trip in Progress",
        subtitle: "Navigate to destination",
        primaryBtn: "Complete Ride",
        primaryAction: "complete",
        color: success,
        badgeVariant: "success",
        buttonVariant: "success",
      },
    }),
    [primary, info, success],
  );

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    if (rideStatus === "completed") {
      setTimeout(() => navigation.replace("RideCompleted"), 500);
    }
  }, [rideStatus, navigation]);

  const handlePrimaryAction = async (action) => {
    if (action === "arrived") {
      await arrivedAtPickup(activeRide?.id).unwrap();
    } else if (action === "start") {
      await startRide(activeRide?.id).unwrap();
    } else if (action === "complete") {
      Alert.alert("Complete Ride", "Confirm ride completion?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => completeRide(activeRide?.id).unwrap(),
        },
      ]);
    }
  };

  const openNavigation = () => {
    const coords =
      rideStatus === "ongoing" ? activeRide?.destination : activeRide?.pickup;
    if (coords) {
      Linking.openURL(
        `google.navigation:q=${coords.latitude},${coords.longitude}`,
      );
    }
  };

  const config = stepConfig[rideStatus] || stepConfig.accepted;
  const targetCoords =
    rideStatus === "ongoing" ? activeRide?.destination : activeRide?.pickup;

  return (
    <View className="flex-1 bg-background">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        customMapStyle={isDark ? DARK_MAP_STYLE : undefined}
        showsUserLocation
        initialRegion={{
          latitude: currentLocation?.latitude || 37.7749,
          longitude: currentLocation?.longitude || -122.4194,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {activeRide?.pickup ? (
          <Marker coordinate={activeRide.pickup}>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-success">
              <Icon name="account" size={16} color="#FFF" />
            </View>
          </Marker>
        ) : null}

        {activeRide?.destination ? (
          <Marker coordinate={activeRide.destination}>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-error">
              <Icon name="flag-checkered" size={16} color="#FFF" />
            </View>
          </Marker>
        ) : null}

        {currentLocation && targetCoords ? (
          <Polyline
            coordinates={[currentLocation, targetCoords]}
            strokeColor={config.color}
            strokeWidth={3}
            lineDashPattern={rideStatus === "accepted" ? [8, 4] : undefined}
          />
        ) : null}
      </MapView>

      {/* Floating nav FAB */}
      <View className="absolute bottom-75 right-5">
        <IconButton
          icon="navigation"
          onPress={openNavigation}
          size={52}
          iconSize={22}
          variant="primary"
          color={onPrimary}
        />
      </View>

      {/* Bottom panel */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 gap-3.5 rounded-t-3xl border-t border-border bg-card px-5 pb-9 pt-5"
        style={{ transform: [{ translateY: slideAnim }] }}
      >
        {/* Status header */}
        <View
          className="flex-row items-center justify-between border-l-[3px] pl-3"
          style={{ borderLeftColor: config.color }}
        >
          <View className="mr-3 flex-1">
            <Text className="text-lg font-inter-bold text-foreground">
              {config.title}
            </Text>
            <Text className="mt-0.5 text-[13px] font-inter text-foreground-muted">
              {config.subtitle}
            </Text>
          </View>
          <Badge
            label={(rideStatus || "accepted").toUpperCase()}
            variant={config.badgeVariant}
            size="sm"
            uppercase
          />
        </View>

        {/* Passenger card */}
        {passenger ? (
          <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-background-muted p-3.5">
            <Avatar name={passenger.name || "P"} size="md" />
            <View className="min-w-0 flex-1">
              <Text
                className="text-base font-inter-semibold text-foreground"
                numberOfLines={1}
              >
                {passenger.name}
              </Text>
              <View className="mt-0.5 flex-row gap-2.5">
                <Text className="text-[13px] font-inter text-foreground-muted">
                  ⭐ {passenger.rating || "4.7"}
                </Text>
                <Text className="text-[13px] font-inter text-foreground-muted">
                  {passenger.trips || "32"} trips
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <IconButton
                icon="phone"
                size={40}
                iconSize={18}
                variant="primary"
                onPress={() =>
                  passenger?.phone && Linking.openURL(`tel:${passenger.phone}`)
                }
              />
              <IconButton
                icon="message-outline"
                size={40}
                iconSize={18}
                variant="primary"
                onPress={() => { }}
              />
            </View>
          </View>
        ) : null}

        {/* Fare row */}
        <View className="flex-row items-center justify-between rounded-xl border border-border bg-background-muted p-3.5">
          <Text className="text-sm font-inter text-foreground-muted">
            Estimated Earnings
          </Text>
          <Text
            className="text-xl font-inter-bold"
            style={{ color: config.color }}
          >
            ${activeRide?.estimatedFare?.toFixed(2) || "12.50"}
          </Text>
        </View>

        {/* Primary CTA */}
        <Button
          variant={config.buttonVariant}
          onPress={() => handlePrimaryAction(config.primaryAction)}
        >
          {config.primaryBtn}
        </Button>
      </Animated.View>
    </View>
  );
}