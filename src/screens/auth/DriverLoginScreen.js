// src/screens/auth/DriverLoginScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loginDriver, clearError } from "@/store/slices/authSlice";
import Heading from "@/components/ui/Heading";
import Badge from "@/components/ui/Badge";
import AuthHeader from "@/components/ui/AuthHeader";
import AppTextInput from "@/components/ui/AppTextInput";
import Button from "@/components/ui/Button";

export default function DriverLoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading: isLoading, error } = useSelector((s) => s.auth);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error);
      dispatch(clearError());
    }
  }, [error]);

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    dispatch(loginDriver({ phone, password }));
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader showBack={false} />
          

          <View className="mb-10 mt-8">
            <Badge
              label="DRIVER PORTAL"
              variant="primary"
              uppercase
              className="mb-4"
            />

            <Heading
              title="Start Driving 🚗"
              subtitle="Sign in to your driver account"
              size="xl"
            />
          </View>
          <View className="gap-4">
            <AppTextInput
              label="Phone Number"
              required
              leftContent="+1"
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 000-0000"
              keyboardType="phone-pad"
            />
            <AppTextInput
              label="Password"
              rightLabel="Forgot?"
              onRightLabelPress={() => navigation.navigate("ForgotPassword")}
              required
              leftIcon="lock"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
            />

            <Button
              variant="primary"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              className="mt-2"
            >
              Sign In
            </Button>
          </View>

          <Button
            variant="link"
            size="sm"
            className="mt-8"
            onPress={() => navigation.navigate("Register")}
          >
            <Text className="text-center text-base font-inter text-foreground-muted">
              New driver?{" "}
              <Text className="font-inter-semibold text-primary">
                Sign up here
              </Text>
            </Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
