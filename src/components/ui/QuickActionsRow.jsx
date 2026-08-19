// src/components/ui/QuickActionsRow.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import Badge from "@/components/ui/Badge";

/**
 * items[] badge supports:
 *  - string | number  → <Badge label={...} />
 *  - object matching Badge props:
 *      label | children
 *      variant?: "success" | "primary" | "warning" | "error" | "info" | "muted"
 *      size?: "sm" | "md"
 *      shape?: "rounded" | "pill"
 *      icon?: string
 *      iconSize?: number
 *      uppercase?: boolean
 *      bordered?: boolean
 *      className?: string
 *      textClassName?: string
 *      dot?: boolean   // QuickActionsRow-only: small status dot, no Badge text
 */
export default function QuickActionsRow({
    items = [],
    columns,
    iconSize = 22,
    iconColor,
    className = "",
    itemClassName = "",
    labelClassName = "",
    showBadge = true,
}) {
    const { colors } = useTheme();
    const defaultColor = iconColor ?? colors?.primary ?? "#38BDF8";
    const cols = columns ?? items.length;

    return (
        <View className={`flex-row flex-wrap justify-between ${className}`}>
            {items.map((item, index) => {
                const {
                    icon,
                    label,
                    onPress,
                    color,
                    disabled = false,
                    badge,
                } = item;

                const badgeProps =
                    badge == null || badge === false
                        ? null
                        : typeof badge === "object"
                            ? badge
                            : { label: String(badge) };

                const isDot = badgeProps?.dot === true;
                const badgeSize = badgeProps?.size ?? "sm";

                return (
                    <TouchableOpacity
                        key={item.key ?? label ?? String(index)}
                        onPress={onPress}
                        disabled={disabled || !onPress}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={label ?? "action"}
                        accessibilityState={{ disabled: disabled || !onPress }}
                        className={`items-center gap-1.5 ${columns ? "" : "flex-1"} ${disabled ? "opacity-40" : ""
                            } ${itemClassName}`}
                        style={columns ? { width: `${100 / cols}%` } : undefined}
                    >
                        <View className="relative">
                            <Icon
                                name={icon}
                                size={iconSize}
                                color={color ?? defaultColor}
                            />

                            {showBadge && badgeProps ? (
                                isDot ? (
                                    <View
                                        className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-card ${badgeProps.variant === "error"
                                            ? "bg-error"
                                            : badgeProps.variant === "success"
                                                ? "bg-success"
                                                : badgeProps.variant === "warning"
                                                    ? "bg-warning"
                                                    : badgeProps.variant === "info"
                                                        ? "bg-info"
                                                        : badgeProps.variant === "muted"
                                                            ? "bg-foreground-muted"
                                                            : "bg-primary"
                                            } ${badgeProps.className ?? ""}`}
                                    />
                                ) : (
                                    // FIX: offset now scales with badge size so "md" badges
                                    // don't overlap/clip against the icon.
                                    <View
                                        className={`absolute ${badgeSize === "md" ? "-right-4 -top-2.5" : "-right-3 -top-2"
                                            }`}
                                    >
                                        <Badge
                                            label={badgeProps.label}
                                            // children allowed if you pass ReactNode instead of label
                                            {...(badgeProps.children != null
                                                ? { children: badgeProps.children }
                                                : {})}
                                            variant={badgeProps.variant ?? "primary"}
                                            size={badgeSize}
                                            shape={badgeProps.shape ?? "pill"}
                                            icon={badgeProps.icon}
                                            iconSize={badgeProps.iconSize}
                                            uppercase={badgeProps.uppercase ?? false}
                                            bordered={badgeProps.bordered ?? false}
                                            className={badgeProps.className ?? ""}
                                            textClassName={badgeProps.textClassName ?? ""}
                                        />
                                    </View>
                                )
                            ) : null}
                        </View>

                        {label ? (
                            <Text
                                className={`text-center text-[11px] font-inter text-foreground-muted ${labelClassName}`}
                                numberOfLines={1}
                            >
                                {label}
                            </Text>
                        ) : null}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
