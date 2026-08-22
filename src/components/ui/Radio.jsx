// src/components/ui/Radio.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

/**
 * Reusable Radio control — theme-aware
 *
 * Single radio:
 * - selected?: boolean
 * - onPress?: () => void
 * - label?: string
 * - subtitle?: string
 * - disabled?: boolean
 * - size?: "sm" | "md" | "lg"
 * - variant?: "primary" | "success" | "warning" | "error" | "info"
 * - className?: string
 * - labelClassName?: string
 * - subtitleClassName?: string
 *
 * Group mode:
 * - items: Array<{ id | value, label, subtitle?, disabled? }>
 * - value: string | number
 * - onChange: (id) => void
 * - direction?: "vertical" | "horizontal"
 * - className?: string
 * - itemClassName?: string
 */

const SIZES = {
    sm: {
        outer: "h-4 w-4",
        inner: "h-1.5 w-1.5",
        label: "text-sm",
        subtitle: "text-[11px]",
        gap: "gap-2",
    },
    md: {
        outer: "h-[22px] w-[22px]",
        inner: "h-2.5 w-2.5",
        label: "text-[15px]",
        subtitle: "text-xs",
        gap: "gap-3",
    },
    lg: {
        outer: "h-7 w-7",
        inner: "h-3 w-3",
        label: "text-base",
        subtitle: "text-sm",
        gap: "gap-3.5",
    },
};

const VARIANT_SELECTED = {
    primary: {
        border: "border-primary",
        dot: "bg-primary",
    },
    success: {
        border: "border-success",
        dot: "bg-success",
    },
    warning: {
        border: "border-warning",
        dot: "bg-warning",
    },
    error: {
        border: "border-error",
        dot: "bg-error",
    },
    info: {
        border: "border-info",
        dot: "bg-info",
    },
};

function RadioControl({
    selected = false,
    onPress,
    label,
    subtitle,
    disabled = false,
    size = "md",
    variant = "primary",
    className = "",
    labelClassName = "",
    subtitleClassName = "",
}) {
    const s = SIZES[size] || SIZES.md;
    const v = VARIANT_SELECTED[variant] || VARIANT_SELECTED.primary;

    const control = (
        <View
            className={`
        items-center justify-center rounded-full border-2
        ${s.outer}
        ${selected ? v.border : "border-border"}
        ${disabled ? "opacity-50" : ""}
      `}
        >
            {selected ? (
                <View className={`rounded-full ${s.inner} ${v.dot}`} />
            ) : null}
        </View>
    );

    // Bare radio (no label) — still pressable if onPress provided
    if (!label && !subtitle) {
        if (!onPress) return control;
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className={className}
            >
                {control}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            className={`flex-row items-center ${s.gap} ${disabled ? "opacity-50" : ""} ${className}`}
            onPress={onPress}
            disabled={disabled || !onPress}
            activeOpacity={0.75}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={label}
        >
            {control}
            <View className="flex-1">
                {label ? (
                    <Text
                        className={`font-inter-medium text-foreground ${s.label} ${labelClassName}`}
                    >
                        {label}
                    </Text>
                ) : null}
                {subtitle ? (
                    <Text
                        className={`mt-0.5 font-inter text-foreground-muted ${s.subtitle} ${subtitleClassName}`}
                    >
                        {subtitle}
                    </Text>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

/**
 * Radio / RadioGroup
 *
 * // Single
 * <Radio selected={ok} onPress={() => setOk(true)} label="Accept terms" />
 *
 * // Group
 * <Radio
 *   items={[
 *     { id: "a", label: "Option A" },
 *     { id: "b", label: "Option B", subtitle: "Recommended" },
 *   ]}
 *   value={value}
 *   onChange={setValue}
 * />
 */
export default function Radio({
    items,
    value,
    onChange,
    direction = "vertical",
    itemClassName = "",
    className = "",
    ...singleProps
}) {
    if (Array.isArray(items)) {
        const isHorizontal = direction === "horizontal";
        return (
            <View
                className={`
          ${isHorizontal ? "flex-row flex-wrap gap-4" : "gap-3"}
          ${className}
        `}
                accessibilityRole="radiogroup"
            >
                {items.map((opt) => {
                    const id = opt.id ?? opt.value;
                    return (
                        <RadioControl
                            key={String(id)}
                            label={opt.label}
                            subtitle={opt.subtitle ?? opt.sub}
                            selected={value === id}
                            onPress={() => onChange?.(id)}
                            disabled={opt.disabled}
                            className={itemClassName}
                            size={singleProps.size}
                            variant={singleProps.variant}
                            labelClassName={singleProps.labelClassName}
                            subtitleClassName={singleProps.subtitleClassName}
                        />
                    );
                })}
            </View>
        );
    }

    return <RadioControl className={className} {...singleProps} />;
}


// Radio usage examples:
// Single
{/* <Radio
  selected={notify}
  onPress={() => setNotify(true)}
  label="Email me updates"
  subtitle="Weekly summary"
/> */}

// Group
{/* <Radio
  items={[
    { id: "instant", label: "Instant", subtitle: "1.5% fee" },
    { id: "weekly", label: "Weekly", subtitle: "Every Monday" },
  ]}
  value={schedule}
  onChange={setSchedule}
  size="md"
  variant="primary"
/> */}

// Bare control (for custom rows)
{/* <Radio selected={active} onPress={onSelect} size="sm" /> */ }