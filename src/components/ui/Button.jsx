// src/components/ui/Button.jsx
import React, { useMemo } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Reusable Button component
 *
 * Props:
 * - children: React.ReactNode | string
 * - onPress?: () => void
 * - variant?: "primary" | "secondary" | "error" | "success" | "warning" | "info" | "muted" | "outline" | "ghost" | "card" | "link"
 * - size?: "xs" | "sm" | "md" | "lg"
 * - loading?: boolean
 * - disabled?: boolean
 * - fullWidth?: boolean
 * - icon?: string (MaterialCommunityIcons name for icon-only button)
 * - iconSize?: number
 * - iconColor?: string
 * - spinnerColor?: string
 * - leftIcon?: string | React.ReactNode
 * - rightIcon?: string | React.ReactNode
 * - activeOpacity?: number
 * - className?: string
 * - textClassName?: string
 */

const SIZES = {
  xs: {
    height: "h-9",
    text: "text-xs",
    px: "px-3",
    rounded: "rounded-xl",
    iconBox: "size-8",
    icon: 16,
  },
  sm: {
    height: "h-10",
    text: "text-sm",
    px: "px-4",
    rounded: "rounded-xl",
    iconBox: "size-9",
    icon: 18,
  },
  md: {
    height: "h-14",
    text: "text-base",
    px: "px-5",
    rounded: "rounded-2xl",
    iconBox: "size-11",
    icon: 22,
  },
  lg: {
    height: "h-16",
    text: "text-lg",
    px: "px-6",
    rounded: "rounded-2xl",
    iconBox: "size-12",
    icon: 24,
  },
};

export default function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = true,
  // icon-only mode
  icon, // MCI name → icon-only button
  iconSize,
  iconColor,
  spinnerColor,
  leftIcon, // ReactNode or MCI name string
  rightIcon,
  activeOpacity = 0.85,
  className = "",
  textClassName = "",
  ...props
}) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware variant configurations for container classes, text classes,
  // and vector icon / spinner hex colors
  const variants = useMemo(() => {
    const primaryHex = colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9");
    const foregroundHex = colors?.foreground ?? (isDark ? "#F0F9FF" : "#0F172A");
    const mutedHex = isDark ? "#7DD3FC" : "#64748B";
    const secondaryTextHex = isDark ? "#BAE6FD" : "#0369A1";
    const onPrimaryTextHex = isDark ? "#060E1A" : "#FFFFFF";

    return {
      primary: {
        container: "bg-primary",
        text: "text-primary-foreground",
        spinner: onPrimaryTextHex,
        icon: onPrimaryTextHex,
      },
      secondary: {
        container: "bg-secondary",
        text: "text-secondary-foreground",
        spinner: secondaryTextHex,
        icon: secondaryTextHex,
      },
      error: {
        container: "bg-error",
        text: "text-white",
        spinner: "#FFFFFF",
        icon: "#FFFFFF",
      },
      success: {
        container: "bg-success",
        text: "text-primary-foreground",
        spinner: isDark ? "#060E1A" : "#FFFFFF",
        icon: isDark ? "#060E1A" : "#FFFFFF",
      },
      warning: {
        container: "bg-warning",
        text: "text-primary-foreground",
        spinner: isDark ? "#060E1A" : "#FFFFFF",
        icon: isDark ? "#060E1A" : "#FFFFFF",
      },
      info: {
        container: "bg-info",
        text: "text-white",
        spinner: "#FFFFFF",
        icon: "#FFFFFF",
      },
      muted: {
        container: "bg-background-muted",
        text: "text-foreground",
        spinner: mutedHex,
        icon: mutedHex,
      },
      outline: {
        container: "bg-transparent border border-border",
        text: "text-foreground",
        spinner: foregroundHex,
        icon: isDark ? "#BAE6FD" : primaryHex,
      },
      ghost: {
        container: "bg-transparent",
        text: "text-foreground",
        spinner: foregroundHex,
        icon: isDark ? "#BAE6FD" : primaryHex,
      },
      card: {
        // map / floating controls
        container: "bg-card/90 border border-border",
        text: "text-foreground",
        spinner: isDark ? "#BAE6FD" : primaryHex,
        icon: isDark ? "#BAE6FD" : primaryHex,
      },
      link: {
        container: "bg-transparent",
        text: "text-primary",
        spinner: primaryHex,
        icon: primaryHex,
      },
    };
  }, [colors?.primary, colors?.foreground, isDark]);

  const config = variants[variant] || variants.primary;
  const sizeConfig = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;
  const isIconOnly = !!icon && children == null;

  const renderIcon = (nameOrNode, fallbackSize) => {
    if (!nameOrNode) return null;
    if (typeof nameOrNode === "string") {
      return (
        <Icon
          name={nameOrNode}
          size={iconSize ?? fallbackSize}
          color={iconColor ?? config.icon}
        />
      );
    }
    return nameOrNode;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={activeOpacity}
      className={`
        items-center justify-center
        ${isIconOnly ? sizeConfig.iconBox : `${sizeConfig.height} ${sizeConfig.px} flex-row`}
        ${sizeConfig.rounded}
        ${config.container}
        ${!isIconOnly && fullWidth ? "w-full" : "self-start"}
        ${isDisabled ? "opacity-60" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor ?? config.spinner} />
      ) : isIconOnly ? (
        renderIcon(icon, sizeConfig.icon)
      ) : (
        <View className="flex-row items-center gap-2">
          {renderIcon(leftIcon, sizeConfig.icon - 2)}
          {typeof children === "string" ? (
            <Text
              className={`
                ${sizeConfig.text}
                font-inter-bold tracking-[0.3px]
                ${config.text}
                ${textClassName}
              `}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {renderIcon(rightIcon, sizeConfig.icon - 2)}
        </View>
      )}
    </TouchableOpacity>
  );
}

// Usage examples:
//
// Primary CTA:
// <Button onPress={handleSave}>Save Changes</Button>
//
// Muted Button:
// <Button variant="muted" size="sm" onPress={testModelDownload}>Test FL Download</Button>
//
// Info Button:
// <Button variant="info" size="sm" onPress={testInference}>Test Inference</Button>
//
// With left icon:
// <Button variant="secondary" leftIcon="share-variant-outline" onPress={onShare}>Share Trip</Button>
//
// Error / Cancel:
// <Button variant="error" onPress={handleCancel} loading={isCancelling}>Cancel</Button>
//
// Icon-only button:
// <Button icon="phone" variant="outline" size="sm" fullWidth={false} onPress={() => Linking.openURL(`tel:${phone}`)} />


