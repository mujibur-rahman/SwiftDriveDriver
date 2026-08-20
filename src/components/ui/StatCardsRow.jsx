// src/components/ui/StatCardsRow.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Reusable StatCardsRow component
 *
 * Renders a row (or grid) of stat / metric cards with icons, values, and labels.
 *
 * Props:
 * - items: Array<{
 *     label: string;
 *     value: string | number | React.ReactNode;
 *     icon?: string | React.ReactNode;
 *     iconColor?: string;
 *     iconSize?: number;
 *     color?: string;
 *     onPress?: () => void;
 *     key?: string;
 *   }>
 * - columns?: number
 * - iconSize?: number         (default 20)
 * - iconColor?: string        (defaults to theme primary)
 * - className?: string        // outer row container
 * - cardClassName?: string    // per-card container
 * - valueClassName?: string
 * - labelClassName?: string
 */
export default function StatCardsRow({
  items = [],
  columns,
  iconSize = 20,
  iconColor,
  className = "",
  cardClassName = "",
  valueClassName = "",
  labelClassName = "",
}) {
  const { colors, isDark } = useTheme();
  const defaultIconColor =
    iconColor ?? colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9");
  const cols = columns || items.length;

  if (!items.length) return null;

  return (
    <View className={`flex-row gap-2.5 ${className}`}>
      {items.map((stat, index) => {
        const {
          label,
          value,
          icon,
          color,
          iconColor: itemIconColor,
          iconSize: itemIconSize,
          onPress,
        } = stat;

        const resolvedIconColor =
          itemIconColor ?? color ?? defaultIconColor;
        const resolvedIconSize = itemIconSize ?? iconSize;
        const CardComponent = onPress ? TouchableOpacity : View;

        return (
          <CardComponent
            key={stat.key ?? label ?? String(index)}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : undefined}
            accessibilityRole={onPress ? "button" : undefined}
            accessibilityLabel={onPress ? label : undefined}
            className={`
              items-center gap-1 rounded-2xl border border-border bg-background-muted p-3.5
              ${columns ? "" : "flex-1"}
              ${cardClassName}
            `}
            style={columns ? { width: `${100 / cols}%` } : undefined}
          >
            {icon ? (
              typeof icon === "string" ? (
                <Icon
                  name={icon}
                  size={resolvedIconSize}
                  color={resolvedIconColor}
                />
              ) : (
                icon
              )
            ) : null}

            {typeof value === "string" || typeof value === "number" ? (
              <Text
                className={`mt-1 text-base font-inter-bold text-foreground ${valueClassName}`}
                numberOfLines={1}
              >
                {value}
              </Text>
            ) : (
              value
            )}

            {label ? (
              <Text
                className={`text-center text-[10px] font-inter text-foreground-muted ${labelClassName}`}
                numberOfLines={1}
              >
                {label}
              </Text>
            ) : null}
          </CardComponent>
        );
      })}
    </View>
  );
}

// Usage examples:
//
// Driver Home stats:
// <StatCardsRow
//   items={[
//     { label: "Trips Today", value: todayStats.trips, icon: "car" },
//     { label: "Today's Earnings", value: `$${Number(todayStats.earnings).toFixed(2)}`, icon: "cash" },
//     { label: "Hours Online", value: `${Number(todayStats.hours).toFixed(1)}h`, icon: "clock-outline" },
//   ]}
// />
