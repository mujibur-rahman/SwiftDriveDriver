// src/components/ui/Badge.jsx
import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

/**
 * Reusable badge / chip
 *
 * Props:
 * - children / label: string | ReactNode
 * - variant?: "success" | "primary" | "warning" | "error" | "info" | "muted"
 * - size?: "sm" | "md"
 * - shape?: "rounded" | "pill"     // rounded = md corners, pill = full
 * - icon?: string                  // MaterialCommunityIcons name
 * - iconSize?: number
 * - uppercase?: boolean
 * - bordered?: boolean             // show border (default true for non-pill success label style)
 * - className?: string
 * - textClassName?: string
 */
const VARIANTS = {
  success: {
    wrap: "bg-success/15 border-success/25",
    text: "text-success",
    icon: "#34D399",
  },
  primary: {
    wrap: "bg-primary/15 border-primary/25",
    text: "text-primary",
    icon: "#38BDF8",
  },
  warning: {
    wrap: "bg-warning/15 border-warning/25",
    text: "text-warning",
    icon: "#FBBF24",
  },
  error: {
    wrap: "bg-error/15 border-error/25",
    text: "text-error",
    icon: "#F87171",
  },
  info: {
    wrap: "bg-info/15 border-info/25",
    text: "text-info",
    icon: "#60A5FA",
  },
  muted: {
    wrap: "bg-background-muted border-border",
    text: "text-foreground-muted",
    icon: "#7DD3FC",
  },
};

const SIZES = {
  sm: {
    pad: "px-2 py-0.5",
    text: "text-[11px]",
    icon: 12,
    gap: "gap-1",
  },
  md: {
    pad: "px-2.5 py-1",
    text: "text-[10px]",
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
  const v = VARIANTS[variant] || VARIANTS.success;
  const s = SIZES[size] || SIZES.md;
  const content = children ?? label;

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
        <Icon name={icon} size={iconSize ?? s.icon} color={v.icon} />
      ) : null}

      {typeof content === "string" ? (
        <Text
          className={`
            font-inter-bold
            ${s.text}
            ${v.text}
            ${uppercase ? "tracking-[1.5px]" : "font-inter-semibold"}
            ${textClassName}
          `}
        >
          {uppercase ? content.toUpperCase() : content}
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