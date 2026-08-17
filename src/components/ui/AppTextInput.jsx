import React, { forwardRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import SvgIcon from "@/components/ui/SvgIcon";

const AppTextInput = forwardRef(
  (
    {
      // Label
      label,
      required = false,
      rightLabel, // e.g. "Forgot?"
      onRightLabelPress,

      // Validation
      error,
      helperText,

      // Left side
      leftIcon,
      leftContent,

      // Right side
      rightIcon,
      rightContent,
      onRightPress,

      // Behavior
      secureTextEntry = false,
      disabled = false,

      // Styling
      containerClassName = "",
      inputClassName = "",
      size = "md", // sm | md | lg

      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    // Auto eye icon when secureTextEntry is used
    const showEyeToggle = secureTextEntry;
    const finalRightIcon = showEyeToggle
      ? isSecure
        ? "eye"
        : "eyeOff"
      : rightIcon;

    const handleRightPress = () => {
      if (showEyeToggle) {
        setIsSecure((prev) => !prev);
      } else if (onRightPress) {
        onRightPress();
      }
    };

    // Size variants
    const sizeStyles = {
      sm: "h-11 rounded-xl px-3",
      md: "h-[54px] rounded-2xl px-3.5",
      lg: "h-16 rounded-2xl px-4",
    };

    const hasError = !!error;
    const isFocused = focused && !disabled;

    return (
      <View className={containerClassName}>
        {/* Label row */}
        {(label || rightLabel) && (
          <View className="mb-1.5 flex-row items-center justify-between">
            {label ? (
              <Text className="text-sm font-inter-semibold tracking-wide text-foreground-secondary">
                {label}
                {required && <Text className="text-foreground-secondary"> *</Text>}
              </Text>
            ) : (
              <View />
            )}

            {rightLabel && (
              <TouchableOpacity
                onPress={onRightLabelPress}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text className="text-sm font-inter-medium text-primary">
                  {rightLabel}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Input container */}
        <View
          className={`
            flex-row items-center border
            bg-input
            ${sizeStyles[size] || sizeStyles.md}
            ${isFocused ? "border-ring" : "border-border"}
            ${hasError ? "border-error" : ""}
            ${disabled ? "opacity-50" : ""}
          `}
        >
          {/* Left Content / Icon */}
          {leftContent != null ? (
            <View className="mr-2.5 items-center justify-center">
              {typeof leftContent === "string" ||
              typeof leftContent === "number" ? (
                <Text className="text-base font-inter-semibold text-foreground">
                  {leftContent}
                </Text>
              ) : (
                leftContent
              )}
            </View>
          ) : leftIcon ? (
            <View className="mr-2.5 items-center justify-center">
              <SvgIcon
                name={leftIcon}
                size={20}
                color={isFocused ? "#38BDF8" : "#7DD3FC"}
              />
            </View>
          ) : null}

          {/* TextInput */}
          <TextInput
            ref={ref}
            className={`
              h-full flex-1 p-0
              text-base font-inter text-foreground
              ${inputClassName}
            `}
            placeholderTextColor="#7DD3FC"
            selectionColor="#38BDF8"
            cursorColor="#38BDF8"
            secureTextEntry={isSecure}
            editable={!disabled}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right Content / Icon / Eye */}
          {rightContent != null ? (
            <View className="ml-2.5 items-center justify-center">
              {typeof rightContent === "string" ||
              typeof rightContent === "number" ? (
                <Text className="text-base font-inter-semibold text-foreground">
                  {rightContent}
                </Text>
              ) : (
                rightContent
              )}
            </View>
          ) : finalRightIcon ? (
            <TouchableOpacity
              className="ml-2.5 items-center justify-center"
              onPress={handleRightPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={disabled}
            >
              <SvgIcon
                name={finalRightIcon}
                size={20}
                color={isFocused ? "#38BDF8" : "#7DD3FC"}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Error or Helper text */}
        {hasError ? (
          <Text className="mt-1.5 text-xs font-inter text-error">{error}</Text>
        ) : helperText ? (
          <Text className="mt-1.5 text-xs font-inter text-foreground-muted">
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);

AppTextInput.displayName = "AppTextInput";

export default React.memo(AppTextInput);
