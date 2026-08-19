// src/screens/main/DriverProfileScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useDriverSocket } from "@/services/DriverSocketContext";
import { logout, selectDriver } from "@/features/auth/authSlice";
import { useTheme } from "@/theme";
import Button from "@/components/ui/Button";
import ProfileHeader from "@/components/ui/ProfileHeader";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Heading from "@/components/ui/Heading";
import StatRow from "@/components/ui/StatRow";

const MenuItem = ({
  icon,
  label,
  value,
  badge,
  onPress,
  error = false,
  isLast = false,
}) => {
  const { colors } = useTheme();
  const iconColor = error
    ? (colors?.error ?? "#F87171")
    : (colors?.primary ?? "#38BDF8");
  const chevronColor = error
    ? (colors?.error ?? "#F87171")
    : colors?.["foreground-muted"]
      ? undefined
      : "#7DD3FC";

  return (
    <TouchableOpacity
      className={`flex-row items-center gap-3 px-4 py-3.5 ${!isLast ? "border-b border-border" : ""
        }`}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${error ? "bg-error/15" : "bg-background-muted"
          }`}
      >
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <Text
        className={`flex-1 text-[15px] font-inter-medium ${error ? "text-error" : "text-foreground"
          }`}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-1.5">
        {badge ? (
          <View className="rounded-md bg-primary/15 px-2 py-0.5">
            <Text className="text-[12px] font-inter-semibold text-primary">
              {badge}
            </Text>
          </View>
        ) : null}
        {value ? (
          <Text className="text-[13px] font-inter text-foreground-muted">
            {value}
          </Text>
        ) : null}
        {onPress ? (
          <Icon name="chevron-right" size={18} color={iconColor} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const Section = ({ title, children }) => (
  <View className="mb-4 px-5">
    <Text className="mb-2 ml-1 text-xs font-inter-semibold tracking-wide text-foreground-muted">
      {title}
    </Text>
    <View className="overflow-hidden rounded-2xl border border-border bg-card">
      {children}
    </View>
  </View>
);

export default function DriverProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const driver = useSelector(selectDriver);
  // fallback if selector not exported yet:
  // const driver = useSelector((s) => s.auth.driver);
  const { disconnect } = useDriverSocket();
  const { isDark, setTheme, preference } = useTheme();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          disconnect?.();
          dispatch(logout());
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${driver?.name || "me"} on SwiftDrive Driver!`,
      });
    } catch (_) {
      // cancelled
    }
  };

  const handleThemeToggle = () => {
    // cycle: system → light → dark → system
    const next =
      preference === "system"
        ? "light"
        : preference === "light"
          ? "dark"
          : "system";
    setTheme(next);
  };

  const vehicleLabel = driver?.vehicle
    ? `${driver.vehicle.year || ""} ${driver.vehicle.make || ""} ${driver.vehicle.model || ""}`.trim()
    : null;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="You"
          showBack={false}
          rightIcon="cog-outline"
          rightVariant="plain"
          rightIconSize={24}
          className="px-5"
          titleClassName="text-2xl"
          onRightPress={() =>
            Alert.alert("Settings", "App settings coming soon!")
          }
        />

        <ProfileHeader
          name={driver?.name || "Driver"}
          subtitle={
            [driver?.phone, driver?.email].filter(Boolean).join(" · ") ||
            "@driver"
          }
          avatarSize={64}
          verified={!!driver?.isVerified}
          verifiedLabel="Verified Driver"
          onPress={() => navigation.navigate("EditProfile")}
          className="mt-5 px-5"
        />

        {/* ── Stats (driver metrics — same data as before) ── */}
        {/* <View className="mx-5 mt-5 flex-row items-center justify-around rounded-2xl border border-border bg-card py-4">
          {[
            {
              label: "Rating",
              value: driver?.rating != null ? String(driver.rating) : "4.92",
            },
            {
              label: "Trips",
              value: driver?.totalTrips ?? 0,
            },
            {
              label: "Accept",
              value: `${driver?.acceptanceRate ?? 100}%`,
            },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View className="h-8 w-px bg-border" />}
              <View className="flex-1 items-center">
                <Text className="text-xl font-inter-bold text-foreground">
                  {s.value}
                </Text>
                <Text className="mt-0.5 text-xs font-inter text-foreground-muted">
                  {s.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View> */}

        <StatRow
          className="mx-5 mt-5 border border-border bg-card py-4"
          items={[
            { label: "Rating", value: driver?.rating != null ? String(driver.rating) : "4.92" },
            { label: "Trips", value: driver?.totalTrips ?? 0 },
            { label: "Accept", value: `${driver?.acceptanceRate ?? 100}%` },
          ]}
        />

        {/* ── Action buttons ── */}
        <View className="mx-5 mt-4 flex-row gap-3">
          <View className="flex-1">
            <Button
              variant="primary"
              size="md"
              onPress={() => navigation.navigate("EditProfile")}
            >
              Edit profile
            </Button>
          </View>
          <View className="flex-1">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onPress={handleShare}
            >
              Share
            </Button>
          </View>
        </View>

        {/* ── Vehicle card (driver-specific, same logic) ── */}
        {driver?.vehicle ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("VehicleDetails")}
            className="mx-5 mt-4 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-background-muted">
              <Text className="text-xl">🚗</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-inter-semibold text-foreground">
                {vehicleLabel || "Vehicle"}
              </Text>
              <Text className="mt-0.5 text-[13px] font-inter text-foreground-muted">
                {[driver.vehicle.plate, driver.vehicle.color]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color="#7DD3FC" />
          </TouchableOpacity>
        ) : null}

        {/* ── Account ── */}
        <View className="mt-6">
          <Section title="Account">
            <MenuItem
              icon="account-edit-outline"
              label="Edit Profile"
              onPress={() => navigation.navigate("EditProfile")}
            />
            <MenuItem
              icon="car-outline"
              label="Vehicle Details"
              value={driver?.vehicle?.plate}
              onPress={() => navigation.navigate("VehicleDetails")}
            />
            <MenuItem
              icon="file-document-outline"
              label="Documents"
              badge="2 pending"
              onPress={() => navigation.navigate("Documents")}
            />
            <MenuItem
              icon="bank-outline"
              label="Payout Settings"
              value="Weekly"
              onPress={() => navigation.navigate("PayoutSettings")}
            />
            <MenuItem
              icon="brain"
              label="AI Model Status"
              value={`v${driver?.modelVersion || 0}`}
              onPress={() => navigation.navigate("FLStatus")}
              isLast
            />
          </Section>
        </View>

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <MenuItem
            icon="bell-outline"
            label="Notifications"
            onPress={() => navigation.navigate("Notifications")}
          />
          <MenuItem
            icon="theme-light-dark"
            label="Appearance"
            value={
              preference === "system" ? "System" : isDark ? "Dark" : "Light"
            }
            onPress={handleThemeToggle}
          />
          <MenuItem
            icon="map-outline"
            label="Preferred Areas"
            onPress={() => Alert.alert("Preferred Areas", "Coming soon!")}
          />
          <MenuItem
            icon="shield-outline"
            label="Safety Center"
            onPress={() =>
              Alert.alert("Safety", "Safety features coming soon!")
            }
            isLast
          />
        </Section>

        {/* ── Support ── */}
        <Section title="Support">
          <MenuItem
            icon="help-circle-outline"
            label="Driver Help Center"
            onPress={() => Alert.alert("Help", "Visit help.swiftride.com")}
          />
          <MenuItem
            icon="chat-outline"
            label="Contact Support"
            onPress={() =>
              Alert.alert("Support", "Email: driver-support@swiftride.com")
            }
          />
          <MenuItem
            icon="alert-circle-outline"
            label="Report an Issue"
            onPress={() => Alert.alert("Report", "Coming soon!")}
            isLast
          />
        </Section>

        {/* ── Sign out ── */}
        <View className="mb-2 px-5">
          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            <MenuItem
              icon="logout"
              label="Sign Out"
              error
              onPress={handleLogout}
              isLast
            />
          </View>
        </View>

        <Heading subtitle="SwiftDrive Driver v1.0.0" size="sm" align="center" className="mt-4" />
      </ScrollView>
    </View>
  );
}
