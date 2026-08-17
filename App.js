// App.js  (Driver app — final with FL)
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "./global.css";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '@/store';
import RootNavigator from '@/navigation/RootNavigator';
import { DriverSocketProvider } from '@/services/DriverSocketContext';
import { FLProviderWrapper } from '@/services/fl/FLProviderWrapper';

// Custom dark theme
const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#060E1A",
    card: "#0D1E32",
    border: "#1E3A5F",
    text: "#BAE6FD",
    primary: "#38BDF8",
  },
};

export default function App() {
  // inside App component
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#060E1A");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#060E1A" }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <DriverSocketProvider>
            <FLProviderWrapper>        
              <NavigationContainer theme={AppTheme}>
                <StatusBar barStyle="light-content" backgroundColor="#060E1A" />
                <RootNavigator />
              </NavigationContainer>
            </FLProviderWrapper>
          </DriverSocketProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
