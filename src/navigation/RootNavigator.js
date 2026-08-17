// driver-app/src/navigation/RootNavigator.js
import { useFonts } from "expo-font";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, View } from "react-native";

import AuthNavigator from "@/navigation/AuthNavigator";
import MainNavigator from "@/navigation/MainNavigator";
import { loadDriver } from "@/store/slices/authSlice";
import { recoverActiveRide } from "@/store/slices/driverSlice";
import { useDriverSocket } from "@/services/DriverSocketContext";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function RootNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  const { rideStatus } = useSelector((s) => s.driver);
  const { connect } = useDriverSocket();
  const navigationRef = useRef(null);

  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });

  useEffect(() => {
    dispatch(loadDriver());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
      // Check for any in-progress ride after reconnecting
      dispatch(recoverActiveRide()).then((result) => {
        if (result.payload?.ride) {
          console.log(
            "[Recovery] Active ride found:",
            result.payload.ride.status,
          );
          // Navigate to active ride screen
          navigationRef.current?.navigate("ActiveRide");
        }
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading while fonts or auth are still loading
  if ((!fontsLoaded && !fontError) || loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#060E1A" },
        contentStyle: { backgroundColor: "#060E1A" },
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main">
          {() => <MainNavigator navigationRef={navigationRef} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
