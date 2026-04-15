// src/navigation/MainNavigator.js  (Driver - FINAL COMPLETE)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import DriverHomeScreen        from '../screens/main/DriverHomeScreen';
import ActiveRideScreen        from '../screens/main/ActiveRideScreen';
import RideCompletedScreen     from '../screens/main/RideCompletedScreen';
import EarningsScreen          from '../screens/main/EarningsScreen';
import DriverProfileScreen     from '../screens/main/DriverProfileScreen';
import IncomingRideModal       from '../screens/main/IncomingRideModal';
import EditDriverProfileScreen from '../screens/main/EditDriverProfileScreen';
import VehicleDetailsScreen    from '../screens/main/VehicleDetailsScreen';
import DocumentsScreen         from '../screens/main/DocumentsScreen';
import PayoutSettingsScreen    from '../screens/main/PayoutSettingsScreen';
import NotificationsScreen     from '../screens/main/NotificationsScreen';
import RideHistoryScreen from '../screens/main/RideHistoryScreen';



const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111', borderTopColor: '#222',
          borderTopWidth: 1, height: 60, paddingBottom: 8, paddingTop: 8,
        },
        tabBarActiveTintColor:   '#FF6B35',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Drive:    'steering',
            Earnings: focused ? 'cash' : 'cash-multiple',
            Profile:  focused ? 'account-circle' : 'account-circle-outline',
          };
          return <Icon name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Drive"    component={DriverHomeScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile"  component={DriverProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"            component={TabNavigator} />
      <Stack.Screen name="ActiveRide"      component={ActiveRideScreen} />
      <Stack.Screen name="RideCompleted"   component={RideCompletedScreen} />
      <Stack.Screen name="EditProfile"     component={EditDriverProfileScreen} />
      <Stack.Screen name="VehicleDetails"  component={VehicleDetailsScreen} />
      <Stack.Screen name="Documents"       component={DocumentsScreen} />
      <Stack.Screen name="PayoutSettings"  component={PayoutSettingsScreen} />
      <Stack.Screen name="Notifications"   component={NotificationsScreen} />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
      <Stack.Screen
        name="IncomingRide"
        component={IncomingRideModal}
        options={{ presentation: 'transparentModal', cardStyle: { backgroundColor: 'transparent' } }}
      />
    </Stack.Navigator>
  );
}
