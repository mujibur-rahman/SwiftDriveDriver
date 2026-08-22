// src/components/ui/StatusBanner.jsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Themed status / info banner — NativeWind + useTheme
 *
 * Matches patterns like the FL "Privacy Protected" card.
 *
 * Props:
 * - variant?: "success" | "warning" | "error" | "info" | "primary" | "muted"
 * - icon?: string                    // MCI name (defaults per variant)
 * - iconSize?: number                // default 24
 * - title?: string
 * - message?: string | ReactNode     // alias: children
 * - children?: ReactNode
 * - onClose?: () => void
 * - onPress?: () => void             // makes whole banner pressable
 * - align?: "center" | "start"       // default "start" when title+message
 * - className?: string
 * - titleClassName?: string
 * - messageClassName?: string
 */

const VARIANT_UI = {
    success: {
        wrap: "border-success/30 bg-success/10",
        title: "text-success",
        message: "text-success/80",
        colorKey: "success",
        defaultIcon: "check-circle",
    },
    warning: {
        wrap: "border-warning/30 bg-warning/10",
        title: "text-warning",
        message: "text-warning/80",
        colorKey: "warning",
        defaultIcon: "alert",
    },
    error: {
        wrap: "border-error/30 bg-error/10",
        title: "text-error",
        message: "text-error/80",
        colorKey: "error",
        defaultIcon: "alert-circle",
    },
    info: {
        wrap: "border-info/30 bg-info/10",
        title: "text-info",
        message: "text-info/80",
        colorKey: "info",
        defaultIcon: "information",
    },
    primary: {
        wrap: "border-primary/30 bg-primary/10",
        title: "text-primary",
        message: "text-primary/80",
        colorKey: "primary",
        defaultIcon: "bell-outline",
    },
    muted: {
        wrap: "border-border bg-background-muted",
        title: "text-foreground",
        message: "text-foreground-muted",
        colorKey: "foregroundMuted",
        defaultIcon: "information-outline",
    },
};

export default function StatusBanner({
    variant = "info",
    icon,
    iconSize = 24,
    title,
    message,
    children,
    onClose,
    onPress,
    align,
    className = "",
    titleClassName = "",
    messageClassName = "",
}) {
    const { colors, isDark } = useTheme();
    const v = VARIANT_UI[variant] || VARIANT_UI.info;

    const iconColors = useMemo(
        () => ({
            primary: colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9"),
            success: isDark ? "#34D399" : "#16A34A",
            warning: isDark ? "#FBBF24" : "#D97706",
            error: isDark ? "#F87171" : "#DC2626",
            info: isDark ? "#60A5FA" : "#2563EB",
            foregroundMuted: isDark ? "#7DD3FC" : "#64748B",
        }),
        [colors?.primary, isDark],
    );

    const iconColor =
        iconColors[v.colorKey] ?? colors?.[v.colorKey] ?? iconColors.primary;

    const content = children ?? message;
    const hasTitleAndBody = !!title && content != null && content !== "";
    const rowAlign =
        align === "center"
            ? "items-center"
            : align === "start"
                ? "items-start"
                : hasTitleAndBody
                    ? "items-start"
                    : "items-center";

    const Wrapper = onPress ? TouchableOpacity : View;
    const wrapperProps = onPress
        ? { onPress, activeOpacity: 0.75, accessibilityRole: "button" }
        : {};

    return (
        <Wrapper
            className={`
        flex-row gap-3 rounded-2xl border p-4
        ${rowAlign}
        ${v.wrap}
        ${className}
      `}
            {...wrapperProps}
        >
            <Icon name={icon ?? v.defaultIcon} size={iconSize} color={iconColor} />

            <View className="min-w-0 flex-1">
                {title ? (
                    <Text
                        className={`text-sm font-inter-bold ${v.title} ${titleClassName}`}
                    >
                        {title}
                    </Text>
                ) : null}

                {content != null && content !== "" ? (
                    typeof content === "string" || typeof content === "number" ? (
                        <Text
                            className={`
                text-xs font-inter leading-4.5
                ${title ? "mt-1" : ""}
                ${title ? v.message : v.title}
                ${messageClassName}
              `}
                        >
                            {content}
                        </Text>
                    ) : (
                        content
                    )
                ) : null}
            </View>

            {onClose ? (
                <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss"
                >
                    <Icon name="close" size={18} color={iconColor} />
                </TouchableOpacity>
            ) : null}
        </Wrapper>
    );
}

// Other examples

// Training
{/* <StatusBanner
  variant="primary"
  icon="brain"
  title="Training in progress..."
  message={`${modelType} — ${status}`}
  className="mb-4"
/> */}

// Dismissible
{/* <StatusBanner
  variant="warning"
  title="Action needed"
  message="Upload your documents to stay online."
  onClose={() => setShow(false)}
/> */}

// Pressable
{/* <StatusBanner
  variant="error"
  title="Payment failed"
  message="Tap to retry"
  onPress={retry}
/> */}