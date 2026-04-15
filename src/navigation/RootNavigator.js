// driver-app/src/navigation/RootNavigator.js
import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { loadDriver }        from '../store/slices/authSlice';
import { recoverActiveRide } from '../store/slices/driverSlice';
import { useDriverSocket }   from '../services/DriverSocketContext';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  const { rideStatus } = useSelector((s) => s.driver);
  const { connect }    = useDriverSocket();
  const navigationRef  = useRef(null);

  useEffect(() => {
    dispatch(loadDriver());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
      // Check for any in-progress ride after reconnecting
      dispatch(recoverActiveRide()).then((result) => {
        if (result.payload?.ride) {
          console.log('[Recovery] Active ride found:', result.payload.ride.status);
          // Navigate to active ride screen
          navigationRef.current?.navigate('ActiveRide');
        }
      });
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated
        ? <Stack.Screen name="Main">
            {() => <MainNavigator navigationRef={navigationRef} />}
          </Stack.Screen>
        : <Stack.Screen name="Auth" component={AuthNavigator} />}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
});