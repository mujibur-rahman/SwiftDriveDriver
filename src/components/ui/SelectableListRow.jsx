// src/components/ui/SelectableListRow.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import Radio from "@/components/ui/Radio";

/**
 * Selectable / radio list row — theme-aware
 * Uses the shared Radio component for the selection indicator.
 *
 * Props (single row):
 * - label: string
 * - subtitle?: string
 * - icon?: string                 // MCI name
 * - selected?: boolean
 * - onPress?: () => void
 * - disabled?: boolean
 * - showRadio?: boolean           // default true
 * - radioSize?: "sm" | "md" | "lg"
 * - radioVariant?: "primary" | "success" | "warning" | "error" | "info"
 * - className?: string
 *
 * List mode:
 * - items: Array<{ id, label, subtitle? | sub?, icon?, disabled? }>
 * - value: string | number
 * - onChange: (id) => void
 * - className?: string
 * - itemClassName?: string
 * - radioSize?: "sm" | "md" | "lg"
 * - radioVariant?: string
 */

function SelectableListRowItem({
    label,
    subtitle,
    icon,
    selected = false,
    onPress,
    disabled = false,
    showRadio = true,
    radioSize = "md",
    radioVariant = "primary",
    className = "",
}) {
    const { colors, isDark } = useTheme();
    const primary = colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9");
    const muted = isDark ? "#7DD3FC" : "#64748B";

    return (
        <TouchableOpacity
            className={`
        flex-row items-center gap-3.5 rounded-2xl border p-4
        ${selected ? "border-primary/40 bg-primary/10" : "border-border bg-card"}
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
            onPress={onPress}
            activeOpacity={0.75}
            disabled={disabled || !onPress}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={label}
        >
            {icon ? (
                <View
                    className={`
            h-11 w-11 items-center justify-center rounded-xl
            ${selected ? "bg-primary/20" : "bg-background-muted"}
          `}
                >
                    <Icon name={icon} size={20} color={selected ? primary : muted} />
                </View>
            ) : null}

            <View className="flex-1">
                <Text className="text-[15px] font-inter-medium text-foreground">
                    {label}
                </Text>
                {subtitle ? (
                    <Text className="mt-0.5 text-xs font-inter text-foreground-muted">
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            {showRadio ? (
                <Radio
                    selected={selected}
                    onPress={onPress}
                    disabled={disabled}
                    size={radioSize}
                    variant={radioVariant}
                />
            ) : null}
        </TouchableOpacity>
    );
}

/**
 * Full selectable list
 *
 * <SelectableListRow
 *   items={PAYOUT_SCHEDULES}
 *   value={schedule}
 *   onChange={setSchedule}
 *   className="mb-7"
 * />
 */
export default function SelectableListRow({
    // list mode
    items,
    value,
    onChange,
    itemClassName = "",
    radioSize = "md",
    radioVariant = "primary",
    // single-row mode
    className = "",
    ...rowProps
}) {
    if (Array.isArray(items)) {
        return (
            <View className={`gap-2.5 ${className}`} accessibilityRole="radiogroup">
                {items.map((opt) => {
                    const id = opt.id ?? opt.value;
                    return (
                        <SelectableListRowItem
                            key={String(id)}
                            label={opt.label}
                            subtitle={opt.subtitle ?? opt.sub}
                            icon={opt.icon}
                            selected={value === id}
                            onPress={() => onChange?.(id)}
                            disabled={opt.disabled}
                            className={itemClassName}
                            radioSize={radioSize}
                            radioVariant={radioVariant}
                            showRadio={rowProps.showRadio !== false}
                        />
                    );
                })}
            </View>
        );
    }

    return (
        <SelectableListRowItem
            className={className}
            radioSize={radioSize}
            radioVariant={radioVariant}
            {...rowProps}
        />
    );
}

// Usage — list (payout schedules):
//
// const PAYOUT_SCHEDULES = [
//   { id: "instant", label: "Instant", sub: "1.5% fee", icon: "lightning-bolt" },
//   { id: "daily",   label: "Daily",   sub: "Every day at 8:00 AM", icon: "calendar-today" },
//   { id: "weekly",  label: "Weekly",  sub: "Every Monday", icon: "calendar-week" },
// ];
//
// <SelectableListRow
//   items={PAYOUT_SCHEDULES}
//   value={schedule}
//   onChange={setSchedule}
//   className="mb-7"
//   radioSize="md"
//   radioVariant="primary"
// />
//
// Usage — single row:
//
// <SelectableListRow
//   label="Weekly"
//   subtitle="Every Monday"
//   icon="calendar-week"
//   selected={schedule === "weekly"}
//   onPress={() => setSchedule("weekly")}
// />