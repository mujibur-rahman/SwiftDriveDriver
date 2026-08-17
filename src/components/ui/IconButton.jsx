// src/components/ui/IconButton.jsx
import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function IconButton({
  icon,
  onPress,
  size = 40,
  iconSize = 18,
  color = "#38BDF8",
  variant = "primary", // primary | ghost | error
  className = "",
  disabled = false,
}) {
  const variants = {
    primary: "border border-primary/40 bg-primary/15",
    ghost: "bg-background-muted",
    error: "border border-error/40 bg-error/15",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{ width: size, height: size }}
      className={`
        items-center justify-center rounded-full
        ${variants[variant] || variants.primary}
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
    >
      <Icon name={icon} size={iconSize} color={color} />
    </TouchableOpacity>
  );
}
