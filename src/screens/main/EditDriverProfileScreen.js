// src/screens/main/EditDriverProfileScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { updateDriverProfile } from "@/features/auth/authSlice";
import { useUpdateDriverStatusMutation } from "@/features/driver/driverApi";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AvatarPicker from "@/components/ui/AvatarPicker";
import Button from "@/components/ui/Button";
import AppTextInput from "@/components/ui/AppTextInput";

export default function EditDriverProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { driver } = useSelector((s) => s.auth);
  const [name, setName] = useState(driver?.name || "");
  const [email, setEmail] = useState(driver?.email || "");
  const [avatarUri, setAvatarUri] = useState(driver?.avatar || null);

  const [updateDriver, { isLoading }] = useUpdateDriverStatusMutation();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    try {
      await updateDriver({ name, email }).unwrap();
      dispatch(updateDriverProfile({ name, email }));
      console.log("updateDriverProfile ", { name, email })
      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log("Failed to update profile ", e?.data)
      const msg =
        e?.data?.detail ??
        e?.data?.message ??
        e?.error ??
        "Failed to update profile";
      Alert.alert("Error", typeof msg === "string" ? msg : "Failed to update profile");
    }
  };

  // ── Image Picker ──────────────────────────────────────────────
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photos to change the profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow camera access to take a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert("Change Photo", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
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
          <ScreenHeader title="Edit Profile" className="mb-4" />

          <AvatarPicker
            name={name || driver?.name}
            uri={avatarUri}
            size={90}
            loading={isLoading}
            onPress={handleChangePhoto}
            className="mb-8"
          />

          <View className="gap-5 mb-8">
            <AppTextInput
              label="Full Name"
              required
              leftIcon="user"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
            />

            <AppTextInput
              label="Email (optional)"
              leftIcon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View>
              <AppTextInput
                label="Phone Number"
                leftContent="+1"
                value={driver?.phone || ""}
                editable={false}
                disabled
                rightContent={
                  <View className="flex-row items-center gap-1 rounded-lg bg-background-muted px-2 py-1">
                    <Icon name="lock" size={12} color="#7DD3FC" />
                    <Text className="text-[11px] font-sans text-foreground-muted">
                      Locked
                    </Text>
                  </View>
                }
              />
              <Text className="mt-1.5 text-xs font-sans text-foreground-muted">
                Phone number cannot be changed
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Button
              variant="primary"
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading}
            >
              Save Changes
            </Button>

            <Button
              variant="outline"
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
