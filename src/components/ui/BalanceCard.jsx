// src/components/ui/BalanceCard.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Reusable Balance / summary card
 *
 * Props:
 * - label?: string                         // e.g. "Available Balance"
 * - amount: string | number | ReactNode    // e.g. "$284.50" or 284.5
 * - currency?: string                      // prefix when amount is number (default "$")
 * - actionLabel?: string                   // e.g. "Withdraw Now"
 * - onActionPress?: () => void
 * - actionIcon?: string                    // MCI name next to action label
 * - icon?: string                          // optional leading icon in the card
 * - iconSize?: number
 * - variant?: "primary" | "card" | "success" | "warning" | "error" | "info"
 * - size?: "sm" | "md" | "lg"
 * - formatAmount?: boolean                 // auto-format number with toFixed(2)
 * - className?: string
 * - labelClassName?: string
 * - amountClassName?: string
 * - actionClassName?: string
 * - actionTextClassName?: string
 * - children?: ReactNode                   // extra content below amount / action
 */

const VARIANTS = {
    primary: {
        wrap: "bg-primary",
        label: "text-primary-foreground/80",
        amount: "text-primary-foreground",
        actionWrap: "bg-primary-foreground/20",
        actionText: "text-primary-foreground",
        iconKey: "primaryForeground",
    },
    card: {
        wrap: "bg-card border border-border",
        label: "text-foreground-muted",
        amount: "text-foreground",
        actionWrap: "bg-primary/15",
        actionText: "text-primary",
        iconKey: "primary",
    },
    success: {
        wrap: "bg-success",
        label: "text-white/80",
        amount: "text-white",
        actionWrap: "bg-white/20",
        actionText: "text-white",
        iconKey: "white",
    },
    warning: {
        wrap: "bg-warning",
        label: "text-white/80",
        amount: "text-white",
        actionWrap: "bg-white/20",
        actionText: "text-white",
        iconKey: "white",
    },
    error: {
        wrap: "bg-error",
        label: "text-white/80",
        amount: "text-white",
        actionWrap: "bg-white/20",
        actionText: "text-white",
        iconKey: "white",
    },
    info: {
        wrap: "bg-info",
        label: "text-white/80",
        amount: "text-white",
        actionWrap: "bg-white/20",
        actionText: "text-white",
        iconKey: "white",
    },
};

const SIZES = {
    sm: {
        pad: "p-4",
        gap: "gap-1.5",
        label: "text-xs",
        amount: "text-2xl",
        actionPad: "px-3.5 py-2",
        actionText: "text-xs",
        rounded: "rounded-xl",
        actionRounded: "rounded-lg",
        icon: 18,
    },
    md: {
        pad: "p-6",
        gap: "gap-2",
        label: "text-sm",
        amount: "text-4xl",
        actionPad: "px-5 py-2.5",
        actionText: "text-sm",
        rounded: "rounded-2xl",
        actionRounded: "rounded-xl",
        icon: 22,
    },
    lg: {
        pad: "p-7",
        gap: "gap-2.5",
        label: "text-base",
        amount: "text-5xl",
        actionPad: "px-6 py-3",
        actionText: "text-base",
        rounded: "rounded-2xl",
        actionRounded: "rounded-xl",
        icon: 26,
    },
};

function formatValue(amount, currency, formatAmount) {
    if (typeof amount === "number") {
        const n = formatAmount ? amount.toFixed(2) : String(amount);
        return `${currency}${n}`;
    }
    return amount;
}

export default function BalanceCard({
    label = "Available Balance",
    amount,
    currency = "$",
    actionLabel,
    onActionPress,
    actionIcon,
    icon,
    iconSize,
    variant = "primary",
    size = "md",
    formatAmount = true,
    className = "",
    labelClassName = "",
    amountClassName = "",
    actionClassName = "",
    actionTextClassName = "",
    children,
}) {
    const { colors, isDark } = useTheme();
    const v = VARIANTS[variant] || VARIANTS.primary;
    const s = SIZES[size] || SIZES.md;

    const iconColorMap = {
        primary: colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9"),
        primaryForeground: isDark ? "#060E1A" : "#FFFFFF",
        white: "#FFFFFF",
    };
    const resolvedIconColor = iconColorMap[v.iconKey] ?? iconColorMap.primary;
    const resolvedIconSize = iconSize ?? s.icon;

    const displayAmount = formatValue(amount, currency, formatAmount);

    return (
        <View
            className={`
        items-start
        ${s.rounded} ${s.pad} ${s.gap}
        ${v.wrap}
        ${className}
      `}
        >
            {icon ? (
                <View className="mb-0.5">
                    <Icon
                        name={icon}
                        size={resolvedIconSize}
                        color={resolvedIconColor}
                    />
                </View>
            ) : null}

            {label ? (
                <Text
                    className={`
            font-inter
            ${s.label}
            ${v.label}
            ${labelClassName}
          `}
                >
                    {label}
                </Text>
            ) : null}

            {typeof displayAmount === "string" || typeof displayAmount === "number" ? (
                <Text
                    className={`
            font-inter-bold
            ${s.amount}
            ${v.amount}
            ${amountClassName}
          `}
                >
                    {displayAmount}
                </Text>
            ) : (
                displayAmount
            )}

            {actionLabel && onActionPress ? (
                <TouchableOpacity
                    className={`
            mt-1 flex-row items-center gap-1.5
            ${s.actionRounded} ${s.actionPad}
            ${v.actionWrap}
            ${actionClassName}
          `}
                    onPress={onActionPress}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={actionLabel}
                >
                    {actionIcon ? (
                        <Icon
                            name={actionIcon}
                            size={resolvedIconSize - 4}
                            color={resolvedIconColor}
                        />
                    ) : null}
                    <Text
                        className={`
              font-inter-bold
              ${s.actionText}
              ${v.actionText}
              ${actionTextClassName}
            `}
                    >
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            ) : null}

            {children}
        </View>
    );
}

// Usage:
//
// <BalanceCard
//   label="Available Balance"
//   amount={284.5}
//   actionLabel="Withdraw Now"
//   onActionPress={handleWithdraw}
//   className="mb-7"
// />
//
// <BalanceCard
//   variant="card"
//   size="sm"
//   label="Today's Earnings"
//   amount="$42.00"
//   icon="cash"
//   actionLabel="View details"
//   actionIcon="chevron-right"
//   onActionPress={() => navigation.navigate("Earnings")}
// />
//
// <BalanceCard variant="success" label="Paid out" amount={1200} currency="$" />