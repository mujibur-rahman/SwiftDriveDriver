// src/components/ui/AppSwitch.jsx
import React, { useMemo } from "react";
import { View, Text, Switch } from "react-native";
import { useTheme } from "@/theme";

/**
 * Themed Switch — sizes + semantic colors from theme only
 *
 * Props:
 * - value: boolean
 * - onValueChange: (value: boolean) => void
 * - disabled?: boolean
 * - size?: "sm" | "md" | "lg" | "xl" | number   // number = custom scale (1 = default)
 * - color?: "primary" | "success" | "warning" | "error" | "info" | "accent"
 * - activeColor?: string     // rare override (prefer `color`)
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

const SIZE_PRESETS = {
  sm: { scale: 0.75, label: "text-sm", gap: "gap-1.5" },
  md: { scale: 1, label: "text-md", gap: "gap-2" },
  lg: { scale: 1.15, label: "text-lg", gap: "gap-2.5" },
  xl: { scale: 1.3, label: "text-xl", gap: "gap-3" },
};

const COLOR_KEYS = {
  primary: "primary",
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  accent: "accent",
};

export default function AppSwitch({
  value = false,
  onValueChange,
  disabled = false,
  size = "md",
  color = "primary",
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
  const { colors } = useTheme();

  const sizeConfig = useMemo(() => {
    if (typeof size === "number") {
      const scale = size;
      let label = "text-sm";
      if (scale < 0.85) label = "text-xs";
      else if (scale >= 1.25) label = "text-base";
      else if (scale >= 1.1) label = "text-[15px]";
      return {
        scale,
        label,
        gap: scale >= 1.2 ? "gap-3" : scale < 0.9 ? "gap-1.5" : "gap-2",
      };
    }
    return SIZE_PRESETS[size] || SIZE_PRESETS.md;
  }, [size]);

  const resolvedActive = useMemo(() => {
    if (activeColor) return activeColor;
    const key = COLOR_KEYS[color] || "primary";
    return colors?.[key] ?? colors?.primary;
  }, [activeColor, color, colors]);

  // Inactive from theme tokens only
  const resolvedInactiveTrack =
    inactiveTrack ?? colors?.border ?? colors?.secondary;
  const resolvedInactiveThumb =
    inactiveThumb ?? colors?.foregroundMuted ?? colors?.text;

  const resolvedLabel = label ?? (value ? activeLabel : inactiveLabel);

  const switchElement = (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: resolvedInactiveTrack,
        true: `${resolvedActive}99`,
      }}
      thumbColor={value ? resolvedActive : resolvedInactiveThumb}
      ios_backgroundColor={resolvedInactiveTrack}
      style={{
        transform: [
          { scaleX: sizeConfig.scale },
          { scaleY: sizeConfig.scale },
        ],
      }}
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
          className={`
            font-inter
            ${sizeConfig.label}
            ${disabled ? "text-foreground-muted/60" : "text-foreground-muted"}
            ${labelClassName}
          `}
        >
          {resolvedLabel}
        </Text>
      );
    }
    return resolvedLabel;
  };

  return (
    <View
      className={`flex-row items-center ${sizeConfig.gap} ${containerClassName || className}`}
    >
      {labelPosition === "left" && renderLabel()}
      {switchElement}
      {labelPosition === "right" && renderLabel()}
    </View>
  );
}

// Usage:
// <AppSwitch value={on} onValueChange={setOn} size="sm" color="success" />
// <AppSwitch value={on} onValueChange={setOn} size="xl" color="error" activeLabel="On" inactiveLabel="Off" />
// <AppSwitch value={on} onValueChange={setOn} size={1.4} color="info" />