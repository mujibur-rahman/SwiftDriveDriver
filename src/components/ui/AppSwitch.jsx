// src/components/ui/AppSwitch.jsx
import React from "react";
import { View, Text, Switch } from "react-native";
import { useTheme } from "@/theme";

/**
 * Themed Switch with optional label support
 *
 * Props:
 * - value: boolean
 * - onValueChange: (value: boolean) => void
 * - disabled?: boolean
 * - size?: "sm" | "md"
 * - activeColor?: string
 * - inactiveTrack?: string
 * - inactiveThumb?: string
 * - label?: string | React.ReactNode
 * - activeLabel?: string
 * - inactiveLabel?: string
 * - labelPosition?: "left" | "right"
 * - labelClassName?: string
 * - className?: string
 * - containerClassName?: string
 */
export default function AppSwitch({
  value = false,
  onValueChange,
  disabled = false,
  size = "md",
  activeColor,
  inactiveTrack,
  inactiveThumb,
  label,
  activeLabel,
  inactiveLabel,
  labelPosition = "left",
  labelClassName = "",
  className = "",
  containerClassName = "",
  ...props
}) {
  const { colors, isDark } = useTheme();
  const scale = size === "sm" ? 0.85 : 1;

  const resolvedActive = activeColor ?? colors.primary;
  const resolvedInactiveTrack =
    inactiveTrack ?? (isDark ? "#1E3A5F" : "#BAE6FD");
  const resolvedInactiveThumb =
    inactiveThumb ?? (isDark ? "#7DD3FC" : "#64748B");

  const resolvedLabel = label ?? (value ? activeLabel : inactiveLabel);

  const switchElement = (
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

  if (!resolvedLabel) {
    return switchElement;
  }

  const renderLabel = () => {
    if (typeof resolvedLabel === "string") {
      return (
        <Text
          className={`text-[13px] font-inter ${
            disabled ? "text-foreground-muted/60" : "text-foreground-muted"
          } ${labelClassName}`}
        >
          {resolvedLabel}
        </Text>
      );
    }
    return resolvedLabel;
  };

  return (
    <View
      className={`flex-row items-center gap-2 ${containerClassName || className}`}
    >
      {labelPosition === "left" && renderLabel()}
      {switchElement}
      {labelPosition === "right" && renderLabel()}
    </View>
  );
}

// Usage examples:
//
// Standalone:
// <AppSwitch value={enabled} onValueChange={setEnabled} />
//
// With active/inactive label:
// <AppSwitch
//   value={isOnline}
//   onValueChange={toggleOnline}
//   activeLabel="Go Offline"
//   inactiveLabel="Go Online"
// />
//
// With static label on right:
// <AppSwitch
//   value={notifications}
//   onValueChange={setNotifications}
//   label="Enable Notifications"
//   labelPosition="right"
// />
