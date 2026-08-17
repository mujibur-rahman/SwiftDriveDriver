// src/components/ui/ListRow.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

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
const VARIANT = {
  default: {
    container: "border border-border bg-card",
    iconWrap: "bg-primary/15",
    iconColor: "#38BDF8",
    label: "text-foreground",
  },
  dashed: {
    container: "border border-dashed border-primary/30 bg-card",
    iconWrap: "bg-primary/15",
    iconColor: "#38BDF8",
    label: "text-primary",
  },
  danger: {
    container: "border border-error/30 bg-card",
    iconWrap: "bg-error/15",
    iconColor: "#F87171",
    label: "text-error",
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
  const v = VARIANT[variant] || VARIANT.default;
  const color = iconColor || v.iconColor;

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
          <Icon name="chevron-right" size={18} color="#7DD3FC" />
        ) : null)}
    </TouchableOpacity>
  );
}
