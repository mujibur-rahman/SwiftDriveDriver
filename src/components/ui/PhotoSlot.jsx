// src/components/ui/PhotoSlot.jsx
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * PhotoSlot
 *
 * Reusable photo tile — capture, preview, or read-only display.
 *
 * Modes:
 * - capture (default): dashed empty state + camera; solid border when uri set
 * - preview: same as capture but default empty icon is image-outline
 * - display: read-only image box (no dashed border, no press unless onPress given)
 *
 * Props:
 * - uri?: string | null
 * - onPress?: () => void
 * - label?: string
 * - required?: boolean
 * - locked?: boolean
 * - mode?: "capture" | "preview" | "display"
 * - tall?: boolean
 * - size?: "sm" | "md" | "lg"
 * - height?: number
 * - width?: number | string
 * - resizeMode?: "contain" | "cover" | "stretch" | "center"
 * - emptyIcon?: string
 * - showBorder?: boolean
 * - rounded?: "md" | "lg" | "xl" | "2xl" | number
 * - disabled?: boolean
 * - className?: string
 * - style?: object
 * - imageStyle?: object
 * - testID?: string
 */

const SIZE_HEIGHT = {
  sm: 100,
  md: 140,
  lg: 180,
};

const RADIUS = {
  md: 10,
  lg: 12,
  xl: 14,
  "2xl": 16,
};

export default function PhotoSlot({
  uri,
  onPress,
  label,
  required = false,
  locked = false,
  mode = "capture",
  tall = false,
  size = "md",
  height,
  width,
  resizeMode,
  emptyIcon,
  showBorder,
  rounded = "xl",
  disabled = false,
  className = "",
  style,
  imageStyle,
  testID,
}) {
  const { colors, isDark } = useTheme();

  const successHex = colors?.success ?? (isDark ? "#34D399" : "#16A34A");
  const mutedHex =
    colors?.foregroundMuted ?? (isDark ? "#7DD3FC" : "#64748B");
  const borderHex = colors?.border ?? (isDark ? "#1E3A5F" : "#E2E8F0");
  const emptyBg = isDark ? "#0A1628" : "#E8EEF5";

  const isDisplay = mode === "display";
  const isPreview = mode === "preview";

  const resolvedHeight =
    height ?? (tall ? SIZE_HEIGHT.lg : SIZE_HEIGHT[size] ?? SIZE_HEIGHT.md);

  const resolvedRadius =
    typeof rounded === "number" ? rounded : RADIUS[rounded] ?? RADIUS.xl;

  const resolvedResizeMode =
    resizeMode ?? (isDisplay ? "cover" : "contain");

  const resolvedEmptyIcon =
    emptyIcon ??
    (isDisplay || isPreview ? "image-outline" : "camera-outline");

  const resolvedLabel =
    label ??
    (isDisplay ? undefined : isPreview ? "Add image" : "Add photo");

  const hasUri = !!uri;
  const borderEnabled =
    showBorder !== undefined ? showBorder : !isDisplay;

  const isLocked = locked || disabled;
  const canPress = !isLocked && typeof onPress === "function";

  const borderColor = !borderEnabled
    ? "transparent"
    : hasUri
      ? successHex
      : borderHex;

  const borderStyleVal = !borderEnabled
    ? "solid"
    : hasUri
      ? "solid"
      : "dashed";

  const body = (
    <>
      {hasUri ? (
        <Image
          source={{ uri }}
          style={[{ width: "100%", height: "100%" }, imageStyle]}
          resizeMode={resolvedResizeMode}
        />
      ) : (
        <View className="items-center justify-center px-2">
          <Icon
            name={resolvedEmptyIcon}
            size={isDisplay ? 20 : 26}
            color={mutedHex}
          />
          {resolvedLabel ? (
            <Text
              className="mt-1 text-center text-[11px] font-inter text-foreground-muted"
              numberOfLines={2}
            >
              {resolvedLabel}
              {required ? " *" : ""}
            </Text>
          ) : null}
        </View>
      )}
    </>
  );

  const boxStyle = [
    {
      height: resolvedHeight,
      width: width ?? (tall ? "100%" : undefined),
      flex: tall || width ? undefined : isDisplay ? undefined : 1,
      borderRadius: resolvedRadius,
      overflow: "hidden",
      backgroundColor: emptyBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: borderEnabled ? 1.5 : 0,
      borderColor,
      borderStyle: borderStyleVal,
      opacity: locked && !hasUri ? 0.6 : 1,
    },
    style,
  ];

  if (!canPress) {
    return (
      <View testID={testID} className={className} style={boxStyle}>
        {body}
      </View>
    );
  }

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!canPress}
      accessibilityRole="button"
      accessibilityLabel={
        hasUri
          ? resolvedLabel
            ? `${resolvedLabel} photo`
            : "Photo"
          : resolvedLabel
            ? `Add ${resolvedLabel}`
            : "Add photo"
      }
      accessibilityState={{ disabled: !canPress }}
      className={className}
      style={boxStyle}
    >
      {body}
    </TouchableOpacity>
  );
}

// Capture (gig job)
{/* <PhotoSlot label="After" uri={uri} onPress={take} required tall /> */ }

// Side-by-side
{/* <View className="flex-row gap-3">
  <PhotoSlot label="Before" uri={before} locked />
  <PhotoSlot label="After" uri={after} onPress={takeAfter} required />
</View> */}

// Example of using PhotoSlot as a display component in marketplace
{/* <PhotoSlot
  mode="display"
  uri={DEMO.itemPhotoUri}
  height={140}
  rounded="lg"
  resizeMode="cover"
  emptyIcon="image-outline"
/> */}

// Gallery-style preview (tappable)
{/* <PhotoSlot
  mode="preview"
  uri={uri}
  onPress={openGallery}
  height={140}
  resizeMode="cover"
/> */}