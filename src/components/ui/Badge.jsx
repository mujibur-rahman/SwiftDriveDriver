// src/components/ui/Badge.jsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Reusable badge / chip
 *
 * Props:
 * - children / label: string | ReactNode
 * - variant?: "success" | "primary" | "warning" | "error" | "info" | "muted"
 * - size?: "sm" | "md"
 * - shape?: "rounded" | "pill"
 * - icon?: string
 * - iconSize?: number
 * - uppercase?: boolean
 * - bordered?: boolean
 * - className?: string
 * - textClassName?: string
 */

const VARIANT_CLASSES = {
  success: {
    wrap: "bg-success/15 border-success/25",
    text: "text-success",
  },
  primary: {
    wrap: "bg-primary/15 border-primary/25",
    text: "text-primary",
  },
  warning: {
    wrap: "bg-warning/15 border-warning/25",
    text: "text-warning",
  },
  error: {
    wrap: "bg-error/15 border-error/25",
    text: "text-error",
  },
  info: {
    wrap: "bg-info/15 border-info/25",
    text: "text-info",
  },
  muted: {
    wrap: "bg-background-muted border-border",
    text: "text-foreground-muted",
  },
};

const SIZES = {
  sm: {
    pad: "px-2 py-0.5",
    text: "text-[10px]",
    icon: 12,
    gap: "gap-1",
  },
  md: {
    pad: "px-2.5 py-1",
    text: "text-[11px]",
    icon: 12,
    gap: "gap-1",
  },
};

export default function Badge({
  children,
  label,
  variant = "success",
  size = "md",
  shape = "rounded",
  icon,
  iconSize,
  uppercase = false,
  bordered = true,
  className = "",
  textClassName = "",
}) {
  const { colors, isDark } = useTheme();

  // Icon colors from theme hex (className can't style vector icons)
  const iconColors = useMemo(
    () => ({
      success: isDark ? "#34D399" : "#16A34A",
      primary: colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9"),
      warning: isDark ? "#FBBF24" : "#D97706",
      error: isDark ? "#F87171" : "#DC2626",
      info: isDark ? "#60A5FA" : "#2563EB",
      muted: isDark ? "#7DD3FC" : "#64748B",
    }),
    [colors?.primary, isDark],
  );

  const v = VARIANT_CLASSES[variant] || VARIANT_CLASSES.success;
  const s = SIZES[size] || SIZES.md;
  const content = children ?? label;
  const iconColor = iconColors[variant] || iconColors.success;

  return (
    <View
      className={`
        flex-row items-center self-start
        ${s.gap} ${s.pad}
        ${shape === "pill" ? "rounded-full" : "rounded-md"}
        ${v.wrap}
        ${bordered ? "border" : "border-0"}
        ${className}
      `}
    >
      {icon ? (
        <Icon name={icon} size={iconSize ?? s.icon} color={iconColor} />
      ) : null}

      {typeof content === "string" || typeof content === "number" ? (
        <Text
          className={`
            font-inter-bold
            ${s.text}
            ${v.text}
            ${uppercase ? "tracking-[1.5px]" : "font-inter-semibold"}
            ${textClassName}
          `}
        >
          {uppercase ? String(content).toUpperCase() : String(content)}
        </Text>
      ) : (
        content
      )}
    </View>
  );
}


// Usage

// PASSENGER tag (Login)
// <Badge label="Passenger" variant="success" uppercase className="mb-4" />

// <Badge
//  label={verifiedLabel || "Verified"}
//  variant="success"
//  shape="pill"
//  size="sm"
//  icon="check-decagram"
//  bordered={false}
//  className="mt-1.5"
// />

// <Badge label="3 new" variant="primary" shape="pill" size="sm" />
// <Badge label="Default" variant="primary" uppercase />
// <Badge label="Failed" variant="error" icon="alert-circle" shape="pill" size="sm" />
// <Badge label="Pending" variant="warning" uppercase />