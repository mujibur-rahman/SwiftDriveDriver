// src/screens/auth/DriverRegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRegisterDriverMutation } from "@/features/auth/authApi";
import AuthHeader from "@/components/ui/AuthHeader";
import Heading from "@/components/ui/Heading";
import AppTextInput from "@/components/ui/AppTextInput";
import Button from "@/components/ui/Button";

export default function DriverRegisterScreen({ navigation }) {
  const [registerDriver, { isLoading, error }] = useRegisterDriverMutation();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    licenseNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehiclePlate: "",
    vehicleColor: "",
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    // validate name, phone, password, licenseNumber...
    if (!form.name || !form.phone || !form.password || !form.licenseNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      console.log("handleRegister ", form);
      await registerDriver(form).unwrap();
      // auto-login হলে RootNavigator main-এ যাবে
      // না হলে:
      // Alert.alert("Success", "Account created. Please sign in.");
      // navigation.navigate("Login");
    } catch (err) {
      Alert.alert(
        "Registration Failed",
        err?.data.message || err?.error || "Something went wrong",
      );
    }
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
          <AuthHeader absolute={false} className="mb-16" />

          <Heading
            title="Become a Driver"
            subtitle="Fill in your details to get started"
            size="lg"
            className="mb-8"
          />

          <Heading
            subtitle="Personal Info"
            className="mb-3"
            subtitleClassName="font-inter-semibold"
          />
          <View className="gap-4 mb-6">
            <AppTextInput
              label="Full Name"
              leftIcon="user"
              required
              value={form.name}
              onChangeText={(text) => updateForm("name", text)}
              placeholder="John Doe"
              autoCapitalize="words"
            />

            <AppTextInput
              label="Phone"
              required
              leftContent="+1"
              value={form.phone}
              onChangeText={(text) => updateForm("phone", text)}
              keyboardType="phone-pad"
              placeholder="(555) 000-0000"
            />

            <AppTextInput
              label="Email"
              leftIcon="mail"
              value={form.email}
              onChangeText={(text) => updateForm("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="john@example.com"
            />

            <AppTextInput
              label="Password"
              leftIcon="lock"
              required
              secureTextEntry
              value={form.password}
              onChangeText={(text) => updateForm("password", text)}
              placeholder="Min 6 characters"
            />

            <AppTextInput
              label="Driver's License Number"
              leftIcon="users"
              required
              value={form.licenseNumber}
              onChangeText={(text) => updateForm("licenseNumber", text)}
              autoCapitalize="characters"
              placeholder="DL12345678"
            />
          </View>

          <Heading
            subtitle="Vehicle Info"
            className="mb-3"
            subtitleClassName="font-inter-semibold"
          />
          <View className="gap-4 mb-6">
            <AppTextInput
              label="Make"
              value={form.vehicleMake}
              onChangeText={(text) => updateForm("vehicleMake", text)}
              placeholder="Toyota"
              autoCapitalize="words"
            />

            <AppTextInput
              label="Model"
              value={form.vehicleModel}
              onChangeText={(text) => updateForm("vehicleModel", text)}
              placeholder="Camry"
              autoCapitalize="words"
            />

            <AppTextInput
              label="Year"
              value={form.vehicleYear}
              onChangeText={(text) => updateForm("vehicleYear", text)}
              placeholder="2020"
              keyboardType="number-pad"
            />

            <AppTextInput
              label="License Plate"
              value={form.vehiclePlate}
              onChangeText={(text) => updateForm("vehiclePlate", text)}
              placeholder="ABC 1234"
              autoCapitalize="characters"
            />
            <AppTextInput
              label="Color"
              value={form.vehicleColor}
              onChangeText={(text) => updateForm("vehicleColor", text)}
              placeholder="Silver"
            />
          </View>

          <Button
            variant="primary"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            className="mt-2"
          >
            Create Account
          </Button>

          <Button
            variant="link"
            size="sm"
            className="mt-6"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="text-center text-base font-inter text-foreground-muted">
              Already have an account?{" "}
              <Text className="font-inter-semibold text-primary">Sign In</Text>
            </Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
