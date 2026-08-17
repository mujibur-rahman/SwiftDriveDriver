// src/components/ui/SwitchRow.jsx
import React from "react";
import { View, Text } from "react-native";
import AppSwitch from "@/components/ui/AppSwitch";

/**
 * Settings-style row with Switch
 *
 * Props:
 * - label: string
 * - subtitle?: string
 * - value: boolean
 * - onValueChange: (v: boolean) => void
 * - disabled?: boolean
 * - isLast?: boolean   (hides bottom border)
 * - className?: string
 */
export default function SwitchRow({
  label,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  isLast = false,
  className = "",
}) {
  return (
    <View
      className={`
        flex-row items-center gap-3 px-4 py-3.5
        ${!isLast ? "border-b border-border" : ""}
        ${className}
      `}
    >
      <View className="flex-1">
        <Text
          className={`text-[15px] font-inter-medium ${
            disabled ? "text-foreground-muted" : "text-foreground"
          }`}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs font-inter text-foreground-muted">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <AppSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
}
