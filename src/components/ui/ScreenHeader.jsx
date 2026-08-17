// src/components/ui/ScreenHeader.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

/**
 * Props:
 * - title?: string | ReactNode
 * - showBack?: boolean
 * - onBack?: () => void
 * - backIcon?: string
 * - rightIcon?: string
 * - onRightPress?: () => void
 * - rightContent?: ReactNode
 * - leftContent?: ReactNode
 * - rightVariant?: "button" | "plain"
 * - iconSize?: number              ← applies to both (default 22)
 * - backIconSize?: number         ← overrides iconSize for back
 * - rightIconSize?: number        ← overrides iconSize for right
 * - transparent?: boolean
 * - className?: string
 * - titleClassName?: string
 */
export default function ScreenHeader({
  title,
  showBack = true,
  onBack,
  backIcon = "arrow-left",
  rightIcon,
  onRightPress,
  rightContent,
  leftContent,
  rightVariant = "button",
  iconSize = 22,
  backIconSize,
  rightIconSize,
  transparent = false,
  className = "",
  titleClassName = "text-lg",
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const backSize = backIconSize ?? iconSize;
  const rightSize = rightIconSize ?? iconSize;

  const handleBack = () => {
    if (onBack) onBack();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  const left =
    leftContent ??
    (showBack ? (
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Icon name={backIcon} size={backSize} color="#38BDF8" />
      </TouchableOpacity>
    ) : (
      <View className="h-10 w-10" />
    ));

  const rightIconNode = rightIcon ? (
    rightVariant === "plain" ? (
      <TouchableOpacity
        onPress={onRightPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        disabled={!onRightPress}
      >
        <Icon name={rightIcon} size={rightSize} color="#7DD3FC" />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
        onPress={onRightPress}
        activeOpacity={0.7}
        disabled={!onRightPress}
      >
        <Icon name={rightIcon} size={rightSize} color="#38BDF8" />
      </TouchableOpacity>
    )
  ) : null;

  const right =
    rightContent ??
    rightIconNode ??
    (showBack ? (
      <View className="h-10 w-10" />
    ) : (
      <View className="h-10 w-10" />
    ));

  const isRootStyle = !showBack && !leftContent;

  return (
    <View
      className={`
        flex-row items-center justify-between pb-4
        ${transparent ? "bg-transparent" : "bg-background"}
        ${className}
      `}
      style={{ paddingTop: insets.top + 8 }}
    >
      {isRootStyle ? (
        <>
          {typeof title === "string" ? (
            <Text
              className={`text-2xl font-inter-bold text-foreground ${titleClassName}`}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {right}
        </>
      ) : (
        <>
          {left}
          {typeof title === "string" ? (
            <Text
              className={`font-inter-bold text-foreground ${titleClassName}`}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {right}
        </>
      )}
    </View>
  );
}

// // Right action
// <ScreenHeader
//   title="Notifications"
//   rightIcon="cog-outline"
//   onRightPress={() => Alert.alert("Settings")}
// />

// // Custom right content
// <ScreenHeader
//   title="Accounts"
//   showBack={false}
//   rightContent={
//     <View className="flex-row items-center gap-3">
//       <TouchableOpacity onPress={onSearch}>
//         <Icon name="magnify" size={24} color="#7DD3FC" />
//       </TouchableOpacity>
//       <TouchableOpacity onPress={onAdd}>
//         <Icon name="plus" size={26} color="#7DD3FC" />
//       </TouchableOpacity>
//     </View>
//   }
// />

// // No back (root tab screen)
// <ScreenHeader title="You" showBack={false} rightIcon="cog-outline" onRightPress={...} />

{
  /* <ScreenHeader
    title="You"
    showBack={false}
    rightIcon="cog-outline"
    rightVariant="plain"
    className="px-5"
    onRightPress={() =>
    Alert.alert("Settings", "App settings coming soon!")
    }
/>

<ScreenHeader title="Payment Methods" rightIcon="cog-outline" rightVariant="button" />

<ScreenHeader
    title="Accounts"
    rightVariant="button"
    showBack={false}
    rightContent={
    <View className="flex-row items-center gap-4">
        <TouchableOpacity hitSlop={8}>
        <Icon name="magnify" size={24} color="#7DD3FC" />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={8} onPress={() => {}}>
        <Icon name="plus" size={26} color="#7DD3FC" />
        </TouchableOpacity>
    </View>
    }
/> */
}
