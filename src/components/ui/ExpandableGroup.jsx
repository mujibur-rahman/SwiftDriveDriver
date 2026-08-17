// src/components/ui/ExpandableGroup.jsx
import React from "react";
import { View, Text } from "react-native";

/**
 * Card wrapper for a list of Expandable items
 *
 * Props:
 * - title?: string   // section label above the card
 * - children
 * - className?: string
 */
export default function ExpandableGroup({ title, children, className = "" }) {
  return (
    <View className={`mb-4 ${className}`}>
      {title ? (
        <Text className="mb-2 ml-1 text-xs font-inter-semibold tracking-wide text-foreground-muted">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-2xl border border-border bg-card">
        {children}
      </View>
    </View>
  );
}
