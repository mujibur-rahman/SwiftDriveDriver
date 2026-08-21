// src/screens/main/VehicleDetailsScreen.js
import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useTheme } from "@/theme";
import { useUpdateVehicleMutation } from "@/features/driver/driverApi";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AppTextInput from "@/components/ui/AppTextInput";
import Button from "@/components/ui/Button";

export default function VehicleDetailsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { driver } = useSelector((s) => s.auth);
  const v = driver?.vehicle || {};

  const [form, setForm] = useState({
    make: v.make || "",
    model: v.model || "",
    year: v.year ? String(v.year) : "",
    plate: v.plate || "",
    color: v.color || "",
  });

  const [updateVehicle, { isLoading }] = useUpdateVehicleMutation();

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // Verification badge colors — matching theme/colors.js success/warning
  // tokens directly, since vector-icons need a raw color prop (same
  // pattern already used in components/ui/Badge.jsx).
  const successColor = isDark ? "#34D399" : "#16A34A";
  const warningColor = isDark ? "#FBBF24" : "#D97706";

  const handleSave = async () => {
    if (!form.plate.trim()) {
      Alert.alert("Error", "License plate is required");
      return;
    }
    try {
      await updateVehicle({
        ...form,
        year: form.year ? parseInt(form.year, 10) : null,
      }).unwrap();
      console.log('Success in updateVehicle', form);
      Alert.alert("Success", "Vehicle updated!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const msg =
        e?.data?.detail ?? e?.data?.message ?? e?.error ?? "Failed to update vehicle";
      console.log('catch error ', msg)
      Alert.alert("Error", typeof msg === "string" ? msg : "Failed to update vehicle");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-5 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title="Vehicle Details" className="mb-4" />

          {/* Vehicle card preview */}
          <View className="mb-7 flex-row items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <Text className="text-4xl">🚗</Text>
            <View className="flex-1">
              <Text
                className="text-base font-inter-semibold text-foreground"
                numberOfLines={1}
              >
                {form.year} {form.make} {form.model || "Your Vehicle"}
              </Text>
              <Text className="mt-1 text-[13px] font-inter text-foreground-muted">
                {form.plate || "ABC 1234"} · {form.color || "Color"}
              </Text>
            </View>
          </View>

          <View className="mb-5 gap-4">
            <AppTextInput
              label="Make"
              leftIcon={<Icon name="car" size={18} color={isDark ? "#7DD3FC" : "#64748B"} />}
              value={form.make}
              onChangeText={update("make")}
              placeholder="e.g. Toyota"
            />
            <AppTextInput
              label="Model"
              value={form.model}
              onChangeText={update("model")}
              placeholder="e.g. Camry"
            />
            <AppTextInput
              label="Year"
              value={form.year}
              onChangeText={update("year")}
              placeholder="e.g. 2020"
              keyboardType="number-pad"
            />
            <AppTextInput
              label="License Plate"
              required
              value={form.plate}
              onChangeText={update("plate")}
              placeholder="e.g. ABC 1234"
              autoCapitalize="characters"
            />
            <AppTextInput
              label="Color"
              value={form.color}
              onChangeText={update("color")}
              placeholder="e.g. Silver"
            />
          </View>

          {/* Verification status */}
          <View className="mb-6 flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Icon
              name={v.isVerified ? "check-circle" : "clock-outline"}
              size={20}
              color={v.isVerified ? successColor : warningColor}
            />
            <View className="flex-1">
              <Text className="text-sm font-inter-semibold text-foreground">
                {v.isVerified ? "Vehicle Verified" : "Verification Pending"}
              </Text>
              <Text className="mt-0.5 text-xs font-inter text-foreground-muted">
                {v.isVerified
                  ? "Your vehicle has been approved"
                  : "Submit documents to complete verification"}
              </Text>
            </View>
          </View>

          <Button variant="primary" onPress={handleSave} loading={isLoading} disabled={isLoading}>
            Save Changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}