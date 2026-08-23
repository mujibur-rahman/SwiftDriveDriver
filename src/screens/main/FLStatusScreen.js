// src/screens/main/FLStatusScreen.js
/**
 * Shows the FL training status to the driver.
 * Accessible from Profile → AI Model Status
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { useFL } from "@/services/fl/FLContext";
import { getLocalTripStats, getFLState } from "@/services/database/tripStore";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatusBanner from "@/components/ui/StatusBanner";
import Heading from "@/components/ui/Heading";
import IconListItem from "@/components/ui/IconListItem";
import StatGrid from "@/components/ui/StatGrid";

const MODELS = [
  {
    type: "surge",
    label: "Surge Predictor",
    icon: "lightning-bolt",
    desc: "Predicts demand-based pricing",
  },
  {
    type: "eta",
    label: "ETA Predictor",
    icon: "clock-fast",
    desc: "Estimates trip duration",
  },
  {
    type: "demand",
    label: "Demand Predictor",
    icon: "map-marker-radius",
    desc: "Forecasts area demand",
  },
];

export default function FLStatusScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9");
  const info = isDark ? "#60A5FA" : "#2563EB";
  const success = isDark ? "#34D399" : "#16A34A";
  const muted = isDark ? "#7DD3FC" : "#64748B";
  const accent = colors?.accent ?? "#D4AF6A";

  const { flStatus, triggerManualTraining } = useFL();
  const [stats, setStats] = useState({});
  const [flState, setFlState] = useState({});

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const s = await getLocalTripStats();
    const fs = await getFLState();
    setStats(s);
    setFlState(fs);
  };

  const handleManualTrain = () => {
    Alert.alert(
      "Train Model",
      `Start FL training round with ${stats.totalTrips || 0} local trips?\n\nYour data stays on this device.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Train Now", onPress: () => triggerManualTraining() },
      ],
    );
  };

  const canTrain =
    !flStatus.isTraining && (stats.totalTrips || 0) >= 10;
  const tripsNeeded = Math.max(0, 10 - (stats.totalTrips || 0));

  const statItems = [
    {
      icon: "car",
      label: "Local Trips",
      value: stats.totalTrips || 0,
      color: primary,
    },
    {
      icon: "brain",
      label: "FL Rounds",
      value: flState.total_rounds || 0,
      color: info,
    },
    {
      icon: "chip",
      label: "Model Version",
      value: `v${flState.model_version || 0}`,
      color: success,
    },
    {
      icon: "shield-check",
      label: "Privacy (ε)",
      value: "Protected",
      color: accent,
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="AI Model Status" className="mb-4" />

        <StatusBanner
          variant="info"
          icon="shield-lock"
          title="Privacy Protected"
          message="Your trip data stays on this device. Only encrypted model updates are shared."
          className="mb-4"
        />

        {/* Training status */}
        {flStatus.isTraining && (
          <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
            <ActivityIndicator color={primary} />
            <View className="flex-1">
              <Text className="text-sm font-inter-semibold text-primary">
                Training in progress...
              </Text>
              {flStatus.progress ? (
                <Text className="mt-0.5 text-xs font-inter text-primary/70">
                  {flStatus.progress.modelType} — {flStatus.progress.status}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {/* Stats */}
        <StatGrid
          wrap
          iconSize={24}
          items={statItems}
          className="mb-5"
        />

        <Heading subtitle="Model Status" size="xs" align="left" className="mb-3" subtitleClassName="font-inter-semibold uppercase tracking-[0.5px]" />

        <View className="mb-4 gap-2.5">
          {MODELS.map((model) => (
            <IconListItem
              key={model.type}
              leftIcon={model.icon}
              iconBoxVariant="primary"
              label={model.label}
              subtitle={model.desc}
              rightContent={
                <Badge
                  label={flStatus.hasModels ? "Active" : "Pending"}
                  variant={flStatus.hasModels ? "success" : "muted"}
                  size="sm"
                  shape="pill"
                  className="self-center!"
                />
              }
            />
          ))}
        </View>

        {/* Last trained */}
        {flState.last_trained_at ? (
          <View className="mb-4 flex-row items-center gap-2 rounded-xl border border-border bg-card p-3">
            <Icon name="history" size={16} color={muted} />
            <Text className="flex-1 text-xs font-inter text-foreground-muted">
              Last trained:{" "}
              {new Date(flState.last_trained_at).toLocaleString()}
            </Text>
          </View>
        ) : null}

        {/* Manual training */}
        <Button
          variant="primary"
          onPress={handleManualTrain}
          loading={flStatus.isTraining}
          disabled={!canTrain}
          leftIcon="brain"
          className="mb-2"
        >
          {flStatus.isTraining ? "Training..." : "Train Now"}
        </Button>

        {tripsNeeded > 0 ? (
          <Heading subtitle={`Complete ${tripsNeeded} more trip${tripsNeeded > 1 ? "s" : ""} to enable training`} size="xs" align="center" className="mb-2" subtitleClassName="font-inter" />
        ) : null}

        <Heading subtitle={`Training runs automatically every night at 2 AM. ${'\n'} Only gradient updates — never raw data — are shared.`} size="xs" align="center" className="mt-2" subtitleClassName="font-inter leading-5" />
      </ScrollView>
    </View>
  );
}