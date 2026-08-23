// src/components/ui/EarningsBalanceCard.jsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme";
import Heading from "@/components/ui/Heading";

/**
 * Earnings total-balance card — theme tokens only (global.css / colors.js).
 *
 * LinearGradient needs hex; those come from useTheme().colors (themeHex),
 * never ad-hoc values. Text uses primary-foreground utility classes.
 *
 * Props:
 * - totalBalance: number | string
 * - pendingPayout: number | string
 * - totalTrips: number | string
 * - currency?: string
 * - variant?: "primary" | "success" | "info" | "accent"
 * - className?: string
 */

function formatMoney(value, currency = "$") {
  if (typeof value === "number") {
    return `${currency}${value.toFixed(2)}`;
  }
  if (value == null || value === "") return `${currency}0.00`;
  const s = String(value);
  return s.startsWith(currency) ? s : `${currency}${s}`;
}

export default function EarningsBalanceCard({
  totalBalance,
  pendingPayout,
  totalTrips,
  currency = "$",
  variant = "primary",
  className = "",
}) {
  const { colors } = useTheme();

  // Gradient stops: only palette tokens from themeHex (via ThemeContext)
  const gradientColors = useMemo(() => {
    const start =
      {
        primary: colors.primary,
        success: colors.success,
        info: colors.info,
        accent: colors.accent,
      }[variant] ?? colors.primary;

    // Depth end stop = secondary (defined in colors.js) — no new hex
    const end = colors.secondary ?? colors.backgroundMuted ?? start;

    return [start, end];
  }, [colors, variant]);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20 }}
      className={`mx-4 mb-4 p-6 ${className}`}
    >
      <Heading
        subtitle="Total Balance"
        size="md"
        subtitleClassName="font-inter text-primary-foreground/70"
      />
      <Heading
        title={formatMoney(totalBalance ?? 0, currency)}
        size="xl"
        titleClassName="text-primary-foreground"
      />

      <View className="my-4 h-px bg-primary-foreground/20" />

      <View className="flex-row items-center">
        <View className="flex-1 items-center gap-1">
          <Text className="text-xl font-inter-bold text-primary-foreground">
            {formatMoney(pendingPayout ?? 0, currency)}
          </Text>
          <Text className="text-[12px] font-inter text-primary-foreground/70">
            Pending Payout
          </Text>
        </View>

        <View className="h-9 w-px bg-primary-foreground/20" />

        <View className="flex-1 items-center gap-1">
          <Text className="text-xl font-inter-bold text-primary-foreground">
            {totalTrips ?? 0}
          </Text>
          <Text className="text-[12px] font-inter text-primary-foreground/70">
            Total Trips
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

// <Usage example>
/*
<EarningsBalanceCard
  totalBalance={1284.5}
  pendingPayout={284.5}
  totalTrips={142}
  variant="success"
/>
*/