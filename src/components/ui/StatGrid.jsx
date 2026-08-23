// src/components/ui/StatGrid.jsx
import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

/**
 * Reusable stat card grid.
 *
 * Props:
 * - items: Array<{ icon: string, label: string, value: string|number, color: string }>
 * - wrap?: boolean        — flex-wrap for 2×N grid (default false = single row)
 * - iconSize?: number     — default 20
 * - className?: string    — container className override
 * - cardClassName?: string — per-card className override
 */
export default function StatGrid({
  items = [],
  wrap = false,
  iconSize = 20,
  className = "",
  cardClassName = "",
}) {
  const containerClass = wrap
    ? `flex-row flex-wrap gap-2.5 ${className}`
    : `flex-row gap-2.5 ${className}`;

  const baseCardClass = wrap
    ? `min-w-[45%] flex-1 items-center gap-1.5 rounded-2xl border border-border bg-card p-4 ${cardClassName}`
    : `flex-1 items-center gap-1 rounded-2xl border border-border bg-card p-3 ${cardClassName}`;

  const valueClass = wrap
    ? "text-xl font-inter-bold"
    : "text-[15px] font-inter-bold text-foreground";

  return (
    <View className={containerClass}>
      {items.map((stat) => (
        <View key={stat.label} className={baseCardClass}>
          <Icon name={stat.icon} size={iconSize} color={stat.color} />
          <Text className={valueClass} style={{ color: stat.color }}>
            {stat.value}
          </Text>
          <Text className="text-center text-[10px] font-inter text-foreground-muted">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* Usages examples 

<StatGrid
  className="mx-4 mb-4"
  items={[
    { icon: "cash", label: "Today", value: "$42.50", color: "#FF6B35" },
    { icon: "car", label: "Trips", value: 3, color: "#0EA5E9" },
    { icon: "clock", label: "Hours", value: "3.5h", color: "#16A34A" },
    { icon: "lightning", label: "Per Hour", value: "$12.14", color: "#D97706" },
  ]}
/>

<StatGrid
  wrap
  iconSize={24}
  items={[
    { icon: "star", label: "Rating", value: "4.92", color: "#F59E0B" },
    { icon: "hand-thumbs-up", label: "Accept", value: "98%", color: "#3B82F6" },
    { icon: "account-multiple", label: "Total", value: "128", color: "#60A5FA" },
  ]}
/>

*/