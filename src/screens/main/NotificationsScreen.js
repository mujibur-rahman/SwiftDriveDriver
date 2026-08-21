// src/screens/main/NotificationsScreen.js
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import AppSwitch from "@/components/ui/AppSwitch";
import SwitchRow from "@/components/ui/SwitchRow";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useTheme } from "@/theme";

const NOTIFICATION_GROUPS = [
  {
    title: 'Ride Requests',
    items: [
      { id: 'new_request', label: 'New Ride Requests', sub: 'Alert when a ride is available', default: true },
      { id: 'surge', label: 'Surge Alerts', sub: 'High demand in your area', default: true },
      { id: 'ride_update', label: 'Ride Status Updates', sub: 'Cancellations and changes', default: true },
    ],
  },
  {
    title: 'Earnings',
    items: [
      { id: 'payout', label: 'Payout Notifications', sub: 'When funds are transferred', default: true },
      { id: 'bonus', label: 'Bonus Alerts', sub: 'New promos and incentives', default: true },
      { id: 'weekly_sum', label: 'Weekly Summary', sub: 'Your weekly earnings report', default: false },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'docs', label: 'Document Updates', sub: 'Approval status changes', default: true },
      { id: 'security', label: 'Security Alerts', sub: 'Login and account changes', default: true },
      { id: 'app_updates', label: 'App Updates', sub: 'New features and fixes', default: false },
    ],
  },
];

export default function NotificationsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? { primary };

  const initialState = {};
  NOTIFICATION_GROUPS.forEach((g) =>
    g.items.forEach((i) => {
      initialState[i.id] = i.default;
    }),
  );

  const [settings, setSettings] = useState(initialState);
  const [masterEnabled, setMasterEnabled] = useState(true);

  const toggle = (id) => setSettings((s) => ({ ...s, [id]: !s[id] }));

  const enabledCount = Object.values(settings).filter(Boolean).length;
  const totalCount = Object.values(settings).length;

  const handleMasterToggle = (value) => {
    setMasterEnabled(value);
    const all = {};
    NOTIFICATION_GROUPS.forEach((g) =>
      g.items.forEach((i) => {
        all[i.id] = value;
      }),
    );
    setSettings(all);
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Notifications" className="px-5" />

      <ScrollView
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Master toggle */}
        <View className="mb-6 flex-row items-center gap-3.5 rounded-2xl border border-border bg-card p-4">
          <View className="h-12 w-12 items-center justify-center rounded-[14px] bg-primary/15">
            <Icon name="bell-outline" size={24} color={primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-sans-semibold text-foreground">
              All Notifications
            </Text>
            <Text className="mt-0.5 text-xs font-sans text-foreground-muted">
              {enabledCount}/{totalCount} types enabled
            </Text>
          </View>
          <AppSwitch value={masterEnabled} onValueChange={handleMasterToggle} />
        </View>

        {/* Groups */}
        {NOTIFICATION_GROUPS.map((group) => (
          <View key={group.title} className="mb-4">
            <Text className="mb-2 ml-1 text-xs font-sans-semibold tracking-wide text-foreground-muted">
              {group.title}
            </Text>

            <View className="overflow-hidden rounded-2xl border border-border bg-card">
              {group.items.map((item, idx) => (
                <SwitchRow
                  key={item.id}
                  label={item.label}
                  subtitle={item.sub}
                  value={settings[item.id] && masterEnabled}
                  onValueChange={() => toggle(item.id)}
                  disabled={!masterEnabled}
                  isLast={idx === group.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        <Text className="mt-2 text-center text-xs font-sans leading-5 text-foreground-muted">
          Notification preferences are saved locally. Push notifications require
          app permissions.
        </Text>
      </ScrollView>
    </View>
  );
}
