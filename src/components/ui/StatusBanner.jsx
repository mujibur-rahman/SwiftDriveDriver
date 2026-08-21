// src/components/ui/StatusBanner.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Themed status banner — colors only from theme tokens
 *
 * Props:
 * - variant?: "success" | "warning" | "error" | "info" | "primary" | "muted"
 * - icon?: string
 * - title?: string
 * - children | message?: string | ReactNode
 * - className?: string
 * - textClassName?: string
 * - iconSize?: number
 * - onClose?: () => void
 */

const VARIANT_UI = {
    success: {
        wrap: "border-success/30 bg-success/10",
        text: "text-success",
        colorKey: "success",
        defaultIcon: "check-circle",
    },
    warning: {
        wrap: "border-warning/30 bg-warning/10",
        text: "text-warning",
        colorKey: "warning",
        defaultIcon: "alert",
    },
    error: {
        wrap: "border-error/30 bg-error/10",
        text: "text-error",
        colorKey: "error",
        defaultIcon: "alert-circle",
    },
    info: {
        wrap: "border-info/30 bg-info/10",
        text: "text-info",
        colorKey: "info",
        defaultIcon: "information",
    },
    primary: {
        wrap: "border-primary/30 bg-primary/10",
        text: "text-primary",
        colorKey: "primary",
        defaultIcon: "bell-outline",
    },
    muted: {
        wrap: "border-border bg-background-muted",
        text: "text-foreground-muted",
        colorKey: "foregroundMuted", // or muted / foreground-muted
        defaultIcon: "minus-circle-outline",
    },
};

export default function StatusBanner({
    variant = "info",
    icon,
    title,
    children,
    message,
    className = "",
    textClassName = "",
    iconSize = 20,
    onClose,
}) {
    const { colors } = useTheme();
    const v = VARIANT_UI[variant] || VARIANT_UI.info;

    // Vector icons need a resolved hex from theme — never hardcode here
    const iconColor =
        colors?.[v.colorKey] ??
        colors?.primary ??
        colors?.foreground;

    const content = children ?? message;

    return (
        <View
            className={`mb-5 flex-row items-center gap-2.5 rounded-2xl border p-4 ${v.wrap} ${className}`}
        >
            <Icon
                name={icon ?? v.defaultIcon}
                size={iconSize}
                color={iconColor}
            />

            <View className="min-w-0 flex-1">
                {title ? (
                    <Text
                        className={`mb-0.5 text-sm font-inter-semibold ${v.text} ${textClassName}`}
                    >
                        {title}
                    </Text>
                ) : null}

                {typeof content === "string" || typeof content === "number" ? (
                    <Text
                        className={`text-sm font-inter-medium ${v.text} ${textClassName}`}
                    >
                        {content}
                    </Text>
                ) : (
                    content
                )}
            </View>

            {onClose ? (
                <TouchableOpacity onPress={onClose} hitSlop={8} activeOpacity={0.7}>
                    <Icon name="close" size={18} color={iconColor} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
}