// src/screens/auth/DriverSplashScreen.js
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import AuthHeader from "@/components/ui/AuthHeader";
import Badge from "@/components/ui/Badge";

export default function DriverSplashScreen({ navigation }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => navigation.replace("Login"), 1200);
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Animated.View
        className="items-center"
        style={{
          transform: [{ scale }],
          opacity,
        }}
      >
        <AuthHeader showBack={false} absolute={false} className="mx-auto" />
        <Badge
          label="DRIVER"
          variant="primary"
          uppercase
          className="mt-4 mx-auto"
        />
        <Animated.Text
          className="mt-3 text-sm font-inter tracking-[1px] text-foreground-muted"
          style={{ opacity: taglineOpacity }}
        >
          Drive. Earn. Thrive.
        </Animated.Text>
      </Animated.View>
    </View>
  );
}
