// src/components/ui/IconButton.jsx
import React, { useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Theme-aware icon button
 *
 * Props:
 * - icon: string                    // MaterialCommunityIcons name
 * - onPress?: () => void
 * - size?: number                   // outer hit area (default 40)
 * - iconSize?: number               // icon glyph size (default 18)
 * - color?: string                  // override icon hex color
 * - variant?: "primary" | "ghost" | "error" | "success" | "warning" | "info" | "muted"
 * - className?: string
 * - disabled?: boolean
 * - activeOpacity?: number
 */

const VARIANT_CLASSES = {
  primary: "border border-primary/40 bg-primary/15",
  ghost: "bg-background-muted",
  error: "border border-error/40 bg-error/15",
  success: "border border-success/40 bg-success/15",
  warning: "border border-warning/40 bg-warning/15",
  info: "border border-info/40 bg-info/15",
  muted: "border border-border bg-card",
};

export default function IconButton({
  icon,
  onPress,
  size = 40,
  iconSize = 18,
  color,
  variant = "primary",
  className = "",
  disabled = false,
  activeOpacity = 0.7,
  ...props
}) {
  const { colors, isDark } = useTheme();

  const iconColors = useMemo(
    () => ({
      primary: colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9"),
      ghost: isDark ? "#7DD3FC" : "#64748B",
      error: isDark ? "#F87171" : "#DC2626",
      success: isDark ? "#34D399" : "#16A34A",
      warning: isDark ? "#FBBF24" : "#D97706",
      info: isDark ? "#60A5FA" : "#2563EB",
      muted: isDark ? "#7DD3FC" : "#64748B",
    }),
    [colors?.primary, isDark],
  );

  const resolvedColor = color ?? iconColors[variant] ?? iconColors.primary;
  const containerClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={activeOpacity}
      style={{ width: size, height: size }}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`
        items-center justify-center rounded-full
        ${containerClass}
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
      {...props}
    >
      <Icon name={icon} size={iconSize} color={resolvedColor} />
    </TouchableOpacity>
  );
}

// IconButton Usage Examples:
{/* <IconButton
  icon="plus"
  onPress={() => console.log("pressed")}
  size={48}
  iconSize={22}
  variant="primary"
/>   */}