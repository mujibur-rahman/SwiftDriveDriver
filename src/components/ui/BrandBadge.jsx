// src/components/ui/BrandBadge.jsx
import React from "react";
import { View, Text } from "react-native";

/**
 * Circular brand mark
 *
 * Props:
 * - text?: string
 * - size?: number
 * - fontSize?: number
 * - className?: string
 * - textClassName?: string
 */
export default function BrandBadge({
  text = "ZyroApp",
  size = 90,
  fontSize = 26,
  className = "",
  textClassName = "",
}) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`items-center justify-center border border-border bg-card ${className}`}
    >
      <Text
        style={{ fontSize }}
        className={`font-instrument-italic font-semibold text-primary ${textClassName}`}
      >
        {text}
      </Text>
    </View>
  );
}
