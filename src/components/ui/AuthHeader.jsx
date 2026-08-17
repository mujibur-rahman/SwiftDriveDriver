// src/components/ui/AuthHeader.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import SvgIcon from "@/components/ui/SvgIcon";
import BrandBadge from "@/components/ui/BrandBadge";

/**
 * Auth screen top bar: Back link + BrandBadge
 *
 * Props:
 * - showBack?: boolean
 * - backLabel?: string
 * - onBack?: () => void
 * - showBrand?: boolean
 * - brandSize?: number
 * - brandText?: string
 * - rightContent?: ReactNode     // overrides brand
 * - leftContent?: ReactNode      // overrides back
 * - absolute?: boolean           // position absolute (default true)
 * - className?: string
 */
export default function AuthHeader({
  showBack = true,
  backLabel = "Back",
  onBack,
  showBrand = true,
  brandSize = 100,
  brandText,
  rightContent,
  leftContent,
  absolute = true,
  className = "",
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) onBack();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  const left =
    leftContent ??
    (showBack ? (
      <TouchableOpacity
        className="flex-row items-center gap-2"
        onPress={handleBack}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <SvgIcon name="arrowLeft" size={24} color="#38BDF8" />
        <Text className="text-base font-inter-extrabold text-primary">
          {backLabel}
        </Text>
      </TouchableOpacity>
    ) : (
      <View />
    ));

  const right =
    rightContent ??
    (showBrand ? <BrandBadge size={brandSize} text={brandText} /> : <View />);

  return (
    <View
      className={`
        z-10 flex-row items-center justify-between
        ${absolute ? "absolute left-6 right-6" : ""}
        ${className}
      `}
      style={absolute ? { top: insets.top } : { paddingTop: insets.top }}
    >
      {left}
      {right}
    </View>
  );
}


// Register screen (your block)
// <AuthHeader showBack={false} brandSize={100} />

// Login — brand only, no back
// <AuthHeader showBack={false} brandSize={100} />

// Custom back
// <AuthHeader
//   backLabel="Cancel"
//   onBack={() => navigation.navigate("Login")}
//   brandSize={90}
// />

// Brand only, not absolute
// <AuthHeader
//  showBack={false}
//  absolute={false}
//  brandText="SwiftRide"
// />

// Custom right
// <AuthHeader
//  rightContent={<Text className="text-primary">Skip</Text>}
///>