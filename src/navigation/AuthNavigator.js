// driver-app/src/navigation/AuthNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DriverSplashScreen from "@/screens/auth/DriverSplashScreen";
import DriverLoginScreen from "@/screens/auth/DriverLoginScreen";
import DriverRegisterScreen from "@/screens/auth/DriverRegisterScreen";
import VehicleSetupScreen from "@/screens/auth/VehicleSetupScreen";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#060E1A" },
        contentStyle: { backgroundColor: "#060E1A" },
      }}
    >
      <Stack.Screen name="Splash" component={DriverSplashScreen} />
      <Stack.Screen name="Login" component={DriverLoginScreen} />
      <Stack.Screen name="Register" component={DriverRegisterScreen} />
      <Stack.Screen name="VehicleSetup" component={VehicleSetupScreen} />
    </Stack.Navigator>
  );
}
