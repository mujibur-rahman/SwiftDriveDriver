// src/screens/main/EditDriverProfileScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/api";
import { updateDriverProfile } from "../../store/slices/authSlice";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AvatarPicker from "@/components/ui/AvatarPicker";
import Button from "@/components/ui/Button";
import AppTextInput from "@/components/ui/AppTextInput";
import { useTheme } from "@/theme";

export default function EditDriverProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { driver } = useSelector((s) => s.auth);
  const [name, setName] = useState(driver?.name || "");
  const [email, setEmail] = useState(driver?.email || "");
  const [avatarUri, setAvatarUri] = useState(driver?.avatar || null);
  const [loading, setLoading] = useState(false);

  const { isDark, setTheme, toggleTheme, preference } = useTheme();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/drivers/me", { name, email });
      dispatch(updateDriverProfile({ name, email }));
      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.detail || "Failed to update profile",
      );
    } finally {
      setLoading(false);
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

          <Pressable
            onPress={toggleTheme}
            className="self-end mb-4 px-3 py-2 rounded-xl bg-card border border-border"
          >
            <Text className="text-sm font-inter-medium text-foreground">
              {isDark ? "🌙 Dark" : "☀️ Light"} · {preference}
            </Text>
          </Pressable>

          <AvatarPicker
            // name={name || user?.name}
            name={name || driver?.name}
            uri={avatarUri}
            size={90}
            loading={loading}
            onPress={handleChangePhoto}
            className="mb-8"
          />

          {/* <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View> */}

          {/* <View style={styles.avatarSection}>
            <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.avatar}>
              <Text style={styles.avatarText}>{name?.[0]?.toUpperCase() || 'D'}</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View> */}

          {/* <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName}
                placeholder="Enter your name" placeholderTextColor="#444" selectionColor="#FF6B35" />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email (optional)</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail}
                placeholder="Enter your email" placeholderTextColor="#444"
                keyboardType="email-address" autoCapitalize="none" selectionColor="#FF6B35" />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledText}>{driver?.phone}</Text>
                <View style={styles.lockedBadge}>
                  <Icon name="lock" size={12} color="#888" />
                  <Text style={styles.lockedText}>Locked</Text>
                </View>
              </View>
            </View>
          </View> */}

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

          {/* <TouchableOpacity style={[styles.saveBtn, loading && styles.saveBtnDisabled]} onPress={handleSave} disabled={loading}>
            <LinearGradient colors={['#FF6B35', '#E55A25']} style={styles.saveBtnGrad}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity> */}

          <View className="gap-3">
            <Button
              variant="primary"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
            >
              Save Changes
            </Button>

            <Button
              variant="outline"
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  avatarSection: { alignItems: "center", marginBottom: 36, gap: 12 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "800", fontSize: 36 },
  changePhotoBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  changePhotoText: { color: "#FF6B35", fontSize: 14, fontWeight: "500" },
  form: { gap: 20, marginBottom: 32 },
  fieldWrap: { gap: 8 },
  label: { color: "#888", fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  input: {
    backgroundColor: "#161616",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingHorizontal: 16,
    height: 56,
    color: "#FFF",
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    paddingHorizontal: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabledText: { color: "#555", fontSize: 16 },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockedText: { color: "#888", fontSize: 11 },
  saveBtn: { borderRadius: 14, overflow: "hidden", marginBottom: 12 },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnGrad: { height: 56, justifyContent: "center", alignItems: "center" },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  cancelBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { color: "#666", fontSize: 15 },
});
