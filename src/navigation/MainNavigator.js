// src/navigation/MainNavigator.js
import React from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";

import DriverHomeScreen from "@/screens/main/DriverHomeScreen";
import ActiveRideScreen from "@/screens/main/ActiveRideScreen";
import RideCompletedScreen from "@/screens/main/RideCompletedScreen";
import EarningsScreen from "@/screens/main/EarningsScreen";
import DriverProfileScreen from "@/screens/main/DriverProfileScreen";
import IncomingRideModal from "@/screens/main/IncomingRideModal";
import EditDriverProfileScreen from "@/screens/main/EditDriverProfileScreen";
import VehicleDetailsScreen from "@/screens/main/VehicleDetailsScreen";
import DocumentsScreen from "@/screens/main/DocumentsScreen";
import PayoutSettingsScreen from "@/screens/main/PayoutSettingsScreen";
import NotificationsScreen from "@/screens/main/NotificationsScreen";
import RideHistoryScreen from "@/screens/main/RideHistoryScreen";
import FLStatusScreen from "@/screens/main/FLStatusScreen";
import HomeScreen from "@/screens/main/home/HomeScreen";
import FoodDeliveryScreen from "@/screens/main/food/FoodDeliveryScreen";
import ParcelDeliveryScreen from "@/screens/main/parcel/ParcelDeliveryScreen";
import GigJobScreen from "@/screens/main/gig/GigJobScreen";
import MarketplacePickupScreen from "@/screens/main/marketplace/MarketplacePickupScreen";
import ShopDeliveryScreen from "@/screens/main/shop/ShopDeliveryScreen";
import CarRentalScreen from "@/screens/main/carRental/CarRentalScreen";
import CarInsuranceScreen from "@/screens/main/carInsurance/CarInsuranceScreen";
import GigWaitingScreen from "@/screens/main/gig/GigWaitingScreen";
import GigCompleteScreen from "@/screens/main/gig/GigCompleteScreen";
import DeliverySummaryScreen from "@/screens/main/DeliverySummaryScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Home: {
    label: "Home",
    icon: "home-outline",
    iconFocused: "home",
  },
  Driver: {
    label: "Driver",
    icon: "steering",
    iconFocused: "steering",
  },
  Earnings: {
    label: "Activity",
    icon: "clock-outline",
    iconFocused: "clock",
  },
  Profile: {
    label: "Profile",
    icon: "account-outline",
    iconFocused: "account",
  },
};

/** Floating pill tab bar — matches reference UI */
function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // Pill colors (reference-style cyan bar)
  const pillBg = colors?.primary ?? "#38BDF8";
  const activeIcon = isDark ? "#060E1A" : "#FFFFFF";
  const inactiveIcon = isDark ? "rgba(6,14,26,0.55)" : "rgba(255,255,255,0.7)";
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: bottomPad,
        paddingHorizontal: 20,
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: pillBg,
          borderRadius: 999,
          paddingVertical: 10,
          paddingHorizontal: 8,
          width: "100%",
          maxWidth: 400,
          // soft shadow
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
            },
            android: { elevation: 12 },
          }),
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const cfg = TAB_CONFIG[route.name] || {
            label: route.name,
            icon: "circle-outline",
            iconFocused: "circle",
          };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 4,
              }}
            >
              <Icon
                name={focused ? cfg.iconFocused : cfg.icon}
                size={22}
                color={focused ? activeIcon : inactiveIcon}
              />
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  fontWeight: focused ? "700" : "500",
                  color: focused ? activeIcon : inactiveIcon,
                }}
              >
                {cfg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // content above floating bar
        tabBarStyle: { position: "absolute" },
        sceneContainerStyle: {
          backgroundColor: colors?.background ?? "#060E1A",
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Driver" component={DriverHomeScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={DriverProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator({ navigationRef }) {
  const { colors } = useTheme();
  const bg = colors?.background ?? "#060E1A";

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: bg },
        contentStyle: { backgroundColor: bg },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
      <Stack.Screen name="RideCompleted" component={RideCompletedScreen} />
      <Stack.Screen name="EditProfile" component={EditDriverProfileScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="PayoutSettings" component={PayoutSettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
      <Stack.Screen name="FLStatus" component={FLStatusScreen} />
      <Stack.Screen name="FoodDelivery" component={FoodDeliveryScreen} />
      <Stack.Screen name="ParcelDelivery" component={ParcelDeliveryScreen} />
      <Stack.Screen name="GigJob" component={GigJobScreen} />
      {/*
        Marketplace pickup has no async customer-confirmation wait (unlike
        gig) — the buyer is present at hand-off, so it completes straight
        to the shared DeliverySummary like food/parcel do.
      */}
      <Stack.Screen name="MarketplacePickup" component={MarketplacePickupScreen} />
      {/*
        Shop for me has two navigation legs (store, then customer) plus an
        in-between shopping/checkout stretch with no navigation at all —
        closer to marketplace's shape than food's, so it also completes
        straight to the shared DeliverySummary.
      */}
      <Stack.Screen name="ShopDelivery" component={ShopDeliveryScreen} />
      {/*
        Car Rental has two legs — delivery and collection — that arrive as
        two SEPARATE jobs, days apart. Both use this one screen; job.phase
        picks which step sequence and copy to show (see CarRentalScreen.js).
      */}
      <Stack.Screen name="CarRentalHandover" component={CarRentalScreen} />
      {/*
        Car Insurance also has two job types (pre_policy, claim) that never
        share an activeOrder, same pattern as Car Rental's two legs — one
        screen, job.phase picks the step sequence.
      */}
      <Stack.Screen name="CarInsuranceInspection" component={CarInsuranceScreen} />
      <Stack.Screen name="GigWaiting" component={GigWaitingScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="GigComplete" component={GigCompleteScreen} options={{ gestureEnabled: false }} />
      {/*
        One shared summary screen for every delivery type — food, parcel,
        gig, and any future ones. openSummary() navigates here with
        { summary } params.
        animationEnabled:false + gestureEnabled:false makes the transition
        feel instant when the driver taps "Confirm Delivery".
      */}
      <Stack.Screen
        name="DeliverySummary"
        component={DeliverySummaryScreen}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 180 } },
            close: { animation: 'timing', config: { duration: 120 } },
          },
        }}
      />
      <Stack.Screen
        name="IncomingRide"
        component={IncomingRideModal}
        options={{
          presentation: "transparentModal",
          cardStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack.Navigator>
  );
}