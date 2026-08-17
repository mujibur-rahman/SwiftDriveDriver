// src/components/ui/AppSwitch.jsx
import React from "react";
import { Switch } from "react-native";

/**
 * Themed Switch
 *
 * Props:
 * - value: boolean
 * - onValueChange: (value: boolean) => void
 * - disabled?: boolean
 * - size?: "sm" | "md"   (visual scale via transform)
 * - activeColor?: string  (default primary #38BDF8)
 * - inactiveTrack?: string
 * - inactiveThumb?: string
 */
export default function AppSwitch({
  value = false,
  onValueChange,
  disabled = false,
  size = "md",
  activeColor = "#38BDF8",
  inactiveTrack = "#1E3A5F",
  inactiveThumb = "#7DD3FC",
  ...props
}) {
  const scale = size === "sm" ? 0.85 : 1;

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: inactiveTrack,
        true: `${activeColor}80`, // 50% opacity when on
      }}
      thumbColor={value ? activeColor : inactiveThumb}
      ios_backgroundColor={inactiveTrack}
      style={{ transform: [{ scaleX: scale }, { scaleY: scale }] }}
      {...props}
    />
  );
}
