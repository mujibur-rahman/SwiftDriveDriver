// src/components/ui/AppSwitch.jsx
import React from "react";
import { Switch } from "react-native";
import { useTheme } from "@/theme";

/**
 * Themed Switch
 *
 * Props:
 * - value: boolean
 * - onValueChange: (value: boolean) => void
 * - disabled?: boolean
 * - size?: "sm" | "md"
 * - activeColor?: string
 * - inactiveTrack?: string
 * - inactiveThumb?: string
 */
export default function AppSwitch({
  value = false,
  onValueChange,
  disabled = false,
  size = "md",
  activeColor,
  inactiveTrack,
  inactiveThumb,
  ...props
}) {
  const { colors, isDark } = useTheme();
  const scale = size === "sm" ? 0.85 : 1;

  const resolvedActive = activeColor ?? colors.primary;
  const resolvedInactiveTrack =
    inactiveTrack ?? (isDark ? "#1E3A5F" : "#BAE6FD");
  const resolvedInactiveThumb =
    inactiveThumb ?? (isDark ? "#7DD3FC" : "#64748B");

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: resolvedInactiveTrack,
        true: `${resolvedActive}80`,
      }}
      thumbColor={value ? resolvedActive : resolvedInactiveThumb}
      ios_backgroundColor={resolvedInactiveTrack}
      style={{ transform: [{ scaleX: scale }, { scaleY: scale }] }}
      {...props}
    />
  );
}
