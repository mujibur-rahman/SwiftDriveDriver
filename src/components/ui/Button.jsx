// src/components/ui/Button.jsx
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const VARIANTS = {
  primary: {
    container: "bg-primary",
    text: "text-primary-foreground",
    spinner: "#060E1A",
    icon: "#060E1A",
  },
  secondary: {
    container: "bg-secondary",
    text: "text-secondary-foreground",
    spinner: "#BAE6FD",
    icon: "#BAE6FD",
  },
  error: {
    container: "bg-error",
    text: "text-white",
    spinner: "#fff",
    icon: "#fff",
  },
  success: {
    container: "bg-success",
    text: "text-primary-foreground",
    spinner: "#060E1A",
    icon: "#060E1A",
  },
  outline: {
    container: "bg-transparent border border-border",
    text: "text-foreground",
    spinner: "#F0F9FF",
    icon: "#BAE6FD",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-foreground",
    spinner: "#F0F9FF",
    icon: "#BAE6FD",
  },
  card: {
    // map / floating controls
    container: "bg-card/90 border border-border",
    text: "text-foreground",
    spinner: "#BAE6FD",
    icon: "#BAE6FD",
  },
  link: {
    container: "bg-transparent",
    text: "text-primary",
    spinner: "#38BDF8",
    icon: "#38BDF8",
  },
};

const SIZES = {
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
  leftIcon, // ReactNode or MCI name string
  rightIcon,
  className = "",
  textClassName = "",
  ...props
}) {
  const config = VARIANTS[variant] || VARIANTS.primary;
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
          color={config.icon}
        />
      );
    }
    return nameOrNode;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
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
        <ActivityIndicator color={config.spinner} />
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

// Your back button
{
  /* <Button
  icon="arrow-left"
  variant="card"
  size="md"
  fullWidth={false}
  onPress={() => navigation.goBack()}
  className="absolute left-4"
  style={{ top: insets.top + 10 }}
/> */
}

// Primary CTA
{
  /* <Button onPress={handleSave}>Save Changes</Button> */
}

// With left icon
{
  /* <Button
  variant="secondary"
  leftIcon="share-variant-outline"
  onPress={onShare}
>
  Share Trip
</Button> */
}

// Error
{
  /* <Button variant="error" onPress={handleCancel} loading={isCancelling}>
  Cancel
</Button> */
}

// Phone icon-only
{
  /* <Button
  icon="phone"
  variant="outline"
  size="sm"
  fullWidth={false}
  onPress={() => Linking.openURL(`tel:${phone}`)}
/> */
}
