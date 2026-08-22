// src/components/ui/ListRow.jsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Reusable list / action row
 *
 * Props:
 * - icon?: string
 * - iconColor?: string
 * - iconSize?: number
 * - label: string
 * - subtitle?: string
 * - labelClassName?: string
 * - onPress?: () => void
 * - showChevron?: boolean        (default true)
 * - variant?: "default" | "dashed" | "danger"
 * - rightContent?: ReactNode     // custom right side
 * - leftContent?: ReactNode      // overrides icon box
 * - disabled?: boolean
 * - className?: string
 */

const VARIANT_CLASSES = {
  default: {
    container: "border border-border bg-card",
    iconWrap: "bg-primary/15",
    label: "text-foreground",
    iconKey: "primary",
  },
  dashed: {
    container: "border border-dashed border-primary/30 bg-card",
    iconWrap: "bg-primary/15",
    label: "text-primary",
    iconKey: "primary",
  },
  danger: {
    container: "border border-error/30 bg-card",
    iconWrap: "bg-error/15",
    label: "text-error",
    iconKey: "error",
  },
};

export default function ListRow({
  icon,
  iconColor,
  iconSize = 22,
  label,
  subtitle,
  labelClassName = "",
  onPress,
  showChevron = true,
  variant = "default",
  rightContent,
  leftContent,
  disabled = false,
  className = "",
}) {
  const { colors, isDark } = useTheme();

  const themeIcons = useMemo(
    () => ({
      primary: colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9"),
      error: isDark ? "#F87171" : "#DC2626",
      muted: isDark ? "#7DD3FC" : "#64748B",
    }),
    [colors?.primary, isDark],
  );

  const v = VARIANT_CLASSES[variant] || VARIANT_CLASSES.default;
  const color = iconColor || themeIcons[v.iconKey] || themeIcons.primary;
  const chevronColor = themeIcons.muted;

  return (
    <TouchableOpacity
      className={`
        flex-row items-center gap-3.5 rounded-2xl p-4
        ${v.container}
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      {/* Left */}
      {leftContent ??
        (icon ? (
          <View
            className={`h-11 w-11 items-center justify-center rounded-xl ${v.iconWrap}`}
          >
            <Icon name={icon} size={iconSize} color={color} />
          </View>
        ) : null)}

      {/* Center */}
      <View className="flex-1">
        <Text
          className={`text-[15px] font-inter-medium ${v.label} ${labelClassName}`}
          numberOfLines={1}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            className="mt-0.5 text-xs font-inter text-foreground-muted"
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right */}
      {rightContent ??
        (showChevron ? (
          <Icon name="chevron-right" size={18} color={chevronColor} />
        ) : null)}
    </TouchableOpacity>
  );
}


// ListRow usage examples:

// Default action row
{/* <ListRow
  icon="wallet"
  label="Payment methods"
  subtitle="Manage cards and accounts"
  onPress={handlePayments}
/> */}

// Dashed (creating something)
{/* <ListRow
  icon="plus-circle-outline"
  label="Add payment method"
  subtitle="Start earning"
  variant="dashed"
  onPress={openAddPayment}
/> */}

// Danger (destructive action)
{/* <ListRow
  icon="trash-can-outline"
  label="Delete account"
  subtitle="Permanent action"
  variant="danger"
  onPress={handleDelete}
/> */}

// Custom right side
{/* <ListRow
  icon="bell"
  label="Notifications"
  rightContent={
    <View className="items-center">
      <Switch value={notify} onValueChange={toggleNotify} />
    </View>
  }
/> */}

// No chevron
{/* <ListRow
  icon="lock"
  label="Privacy Policy"
  onPress={showPolicy}
  showChevron={false}
/> */}