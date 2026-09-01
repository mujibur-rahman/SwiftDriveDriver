// src/components/ui/AppTextInput.jsx
import React, { forwardRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import SvgIcon from "@/components/ui/SvgIcon";
import { useTheme } from "@/theme";

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
      multiline = false,
      numberOfLines,
      minHeight, // used when multiline (default 72)

      // Styling
      containerClassName = "",
      inputClassName = "",
      size = "md", // sm | md | lg (ignored height when multiline)
      iconSize = 20,
      iconColor,
      placeholderTextColor,
      selectionColor,
      cursorColor,

      ...props
    },
    ref,
  ) => {
    const { colors, isDark } = useTheme();
    const [focused, setFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    // Theme-derived colors
    const primaryColor = colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9");
    const mutedColor =
      colors?.foregroundMuted ?? (isDark ? "#7DD3FC" : "#64748B");
    const resolvedPlaceholder = placeholderTextColor ?? mutedColor;
    const resolvedSelection = selectionColor ?? primaryColor;
    const resolvedCursor = cursorColor ?? primaryColor;
    const resolvedIconColor =
      iconColor ?? (focused && !disabled ? primaryColor : mutedColor);

    // Auto eye icon when secureTextEntry is used (single-line only)
    const showEyeToggle = secureTextEntry && !multiline;
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

    // Size variants (single-line)
    const sizeStyles = {
      sm: "h-11 rounded-xl px-3",
      md: "h-13.5 rounded-2xl px-3.5",
      lg: "h-16 rounded-2xl px-4",
    };

    const hasError = !!error;
    const isFocused = focused && !disabled;

    // Multiline: flexible height, top-aligned content
    const multilineMinH = minHeight ?? (numberOfLines ? numberOfLines * 22 + 24 : 72);
    const containerSizeClass = multiline
      ? "rounded-2xl px-3.5 py-2.5"
      : sizeStyles[size] || sizeStyles.md;
    const containerAlignClass = multiline ? "items-start" : "items-center";

    return (
      <View className={containerClassName}>
        {/* Label row */}
        {(label || rightLabel) && (
          <View className="mb-1.5 flex-row items-center justify-between">
            {label ? (
              <Text className="text-sm font-inter-semibold tracking-wide text-foreground-secondary">
                {label}
                {required && (
                  <Text className="font-inter-bold text-error"> *</Text>
                )}
              </Text>
            ) : (
              <View />
            )}

            {rightLabel && (
              <TouchableOpacity
                onPress={onRightLabelPress}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={rightLabel}
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
            flex-row border
            bg-input
            ${containerAlignClass}
            ${containerSizeClass}
            ${isFocused ? "border-ring" : "border-border"}
            ${hasError ? "border-error" : ""}
            ${disabled ? "opacity-50" : ""}
          `}
          style={multiline ? { minHeight: multilineMinH } : undefined}
        >
          {/* Left Content / Icon */}
          {leftContent != null ? (
            <View
              className={`mr-2.5 items-center justify-center ${multiline ? "mt-1" : ""}`}
            >
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
            <View
              className={`mr-2.5 items-center justify-center ${multiline ? "mt-1" : ""}`}
            >
              {typeof leftIcon === "string" ? (
                <SvgIcon
                  name={leftIcon}
                  size={iconSize}
                  color={resolvedIconColor}
                />
              ) : (
                leftIcon
              )}
            </View>
          ) : null}

          {/* TextInput */}
          <TextInput
            ref={ref}
            className={`
              flex-1 p-0
              text-base font-inter text-foreground
              ${multiline ? "" : "h-full"}
              ${inputClassName}
            `}
            style={
              multiline
                ? {
                  minHeight: multilineMinH - 20,
                  textAlignVertical: "top",
                  paddingTop: 0,
                }
                : undefined
            }
            placeholderTextColor={resolvedPlaceholder}
            selectionColor={resolvedSelection}
            cursorColor={resolvedCursor}
            secureTextEntry={multiline ? false : isSecure}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines ?? 4 : undefined}
            accessibilityLabel={
              props.accessibilityLabel ??
              (typeof label === "string" ? label : undefined)
            }
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
            <View
              className={`ml-2.5 items-center justify-center ${multiline ? "mt-1" : ""}`}
            >
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
              className={`ml-2.5 items-center justify-center ${multiline ? "mt-1" : ""}`}
              onPress={handleRightPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={
                showEyeToggle
                  ? isSecure
                    ? "Show password"
                    : "Hide password"
                  : undefined
              }
            >
              {typeof finalRightIcon === "string" ? (
                <SvgIcon
                  name={finalRightIcon}
                  size={iconSize}
                  color={resolvedIconColor}
                />
              ) : (
                finalRightIcon
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Error or Helper text */}
        {hasError ? (
          <Text
            className="mt-1.5 text-xs font-inter text-error"
            accessibilityRole="alert"
          >
            {error}
          </Text>
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


// Usage

// <AppTextInput
//   label="Job Title"
//   placeholder="Gig title"
//   value={title}
//   onChangeText={setTitle}
// />

// <AppTextInput
//   label="Description"
//   placeholder="Gig description"
//   value={description}
//   onChangeText={setDescription}
//   multiline
//   numberOfLines={3}
// />

// <AppTextInput
//   label="Time estimate (minutes)"
//   placeholder="e.g. 30"
//   value={timeMinutes}
//   onChangeText={setTimeMinutes}
//   keyboardType="number-pad"
//   rightContent="min"
// />

// <AppTextInput
//   label="Price (NZD)"
//   placeholder="0.00"
//   value={jobPrice}
//   onChangeText={setJobPrice}
//   keyboardType="decimal-pad"
//   rightContent="NZD"
// />

// <AppTextInput
//   label="Location"
//   placeholder="123 Example Street, Auckland"
//   value={location}
//   onChangeText={setLocation}
//   rightIcon="map-marker"
// />