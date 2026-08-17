// src/components/ui/AvatarPicker.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Avatar from "@/components/ui/Avatar";

/**
 * Avatar + optional action button (e.g. "Change Photo")
 *
 * Props:
 * - name?: string
 * - uri?: string | null
 * - size?: "sm" | "md" | "lg" | number   (default 90)
 * - loading?: boolean
 * - onPress?: () => void                 // avatar + button both call this
 * - onAvatarPress?: () => void           // avatar only
 * - onButtonPress?: () => void           // button only
 * - showButton?: boolean                 (default true)
 * - buttonLabel?: string                 (default "Change Photo")
 * - buttonClassName?: string
 * - buttonTextClassName?: string
 * - className?: string                   // wrapper
 * - disabled?: boolean
 */
export default function AvatarPicker({
  name,
  uri,
  size = 90,
  loading = false,
  onPress,
  onAvatarPress,
  onButtonPress,
  showButton = true,
  buttonLabel = "Change Photo",
  buttonClassName = "",
  buttonTextClassName = "",
  className = "",
  disabled = false,
}) {
  const handleAvatar = () => {
    if (disabled || loading) return;
    if (onAvatarPress) onAvatarPress();
    else onPress?.();
  };

  const handleButton = () => {
    if (disabled || loading) return;
    if (onButtonPress) onButtonPress();
    else onPress?.();
  };

  return (
    <View className={`items-center gap-3 ${className}`}>
      <Avatar
        name={name}
        uri={uri}
        size={size}
        onPress={handleAvatar}
        loading={loading}
      />

      {showButton && (
        <TouchableOpacity
          className={`rounded-full border border-border bg-card px-4 py-1.5 ${
            disabled || loading ? "opacity-50" : ""
          } ${buttonClassName}`}
          activeOpacity={0.7}
          onPress={handleButton}
          disabled={disabled || loading}
        >
          <Text
            className={`text-sm font-inter-medium text-primary ${buttonTextClassName}`}
          >
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
