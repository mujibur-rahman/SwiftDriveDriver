// src/components/ui/Avatar.jsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { useTheme } from "@/theme";
import SvgIcon from "@/components/ui/SvgIcon";
import { getName } from "@/utils/helpers";

const sizeMap = {
  sm: { className: "w-9 h-9", text: "text-sm", icon: 18, spinner: "small" },
  md: { className: "w-11 h-11", text: "text-base", icon: 22, spinner: "small" },
  lg: { className: "w-14 h-14", text: "text-lg", icon: 26, spinner: "large" },
};

export default function Avatar({
  name,
  uri,
  size = "sm",
  onPress,
  icon = "user",
  className = "",
  textClassName = "",
  showIcon = false,
  loading = false,
  activeOpacity = 0.7,
}) {
  const { colors } = useTheme();
  const primary = colors?.primary;
  const onPrimary = colors?.primaryForeground;

  const isNumber = typeof size === "number";

  const config = isNumber
    ? {
      className: "",
      text: size >= 56 ? "text-xl" : size >= 44 ? "text-lg" : "text-base",
      icon: Math.round(size * 0.5),
      spinner: size > 44 ? "large" : "small",
      style: { width: size, height: size },
    }
    : {
      ...(sizeMap[size] || sizeMap.sm),
      style: undefined,
    };

  let content = null;

  if (loading) {
    content = (
      <ActivityIndicator size={config.spinner} color={onPrimary ?? primary} />
    );
  } else if (uri) {
    content = (
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%", borderRadius: 999 }}
        resizeMode="cover"
      />
    );
  } else if (!showIcon && name) {
    content = (
      <Text
        className={`font-inter-bold text-primary-foreground ${config.text} ${textClassName}`}
      >
        {getName(name)}
      </Text>
    );
  } else {
    content = (
      <SvgIcon name={icon} size={config.icon} color={onPrimary ?? primary} />
    );
  }

  const Container = onPress && !loading ? TouchableOpacity : View;

  return (
    <Container
      onPress={loading ? undefined : onPress}
      activeOpacity={activeOpacity}
      disabled={loading}
      style={config.style}
      accessibilityRole={onPress ? "button" : undefined}
      className={`
        ${config.className}
        items-center justify-center overflow-hidden rounded-full
        border border-border bg-primary
        ${loading ? "opacity-70" : ""}
        ${className}
      `}
    >
      {content}
    </Container>
  );
}