// src/components/ui/Expandable.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Expandable / accordion row
 *
 * Controlled:
 *   expanded + onToggle
 * Uncontrolled:
 *   defaultExpanded
 *
 * Props:
 * - title: string | ReactNode
 * - children: ReactNode          // expanded body
 * - expanded?: boolean
 * - onToggle?: (next: boolean) => void
 * - defaultExpanded?: boolean
 * - icon?: string                // left icon (MCI)
 * - iconColor?: string
 * - showChevron?: boolean        (default true)
 * - disabled?: boolean
 * - isLast?: boolean             // hide bottom border
 * - className?: string
 * - titleClassName?: string
 * - contentClassName?: string
 * - animate?: boolean            (default true)
 */
export default function Expandable({
  title,
  children,
  expanded: controlledExpanded,
  onToggle,
  defaultExpanded = false,
  icon,
  iconColor = "#38BDF8",
  showChevron = true,
  disabled = false,
  isLast = false,
  className = "",
  titleClassName = "",
  contentClassName = "",
  animate = true,
}) {
  const isControlled = controlledExpanded !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultExpanded);
  const open = isControlled ? controlledExpanded : internalOpen;

  const handlePress = () => {
    if (disabled) return;
    const next = !open;
    if (animate) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    if (!isControlled) setInternalOpen(next);
    onToggle?.(next);
  };

  return (
    <View className={`${!isLast ? "border-b border-border" : ""} ${className}`}>
      <TouchableOpacity
        className="flex-row items-center gap-3 px-4 py-4"
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {icon ? <Icon name={icon} size={20} color={iconColor} /> : null}

        {typeof title === "string" ? (
          <Text
            className={`flex-1 text-[14px] font-inter-medium text-foreground ${titleClassName}`}
          >
            {title}
          </Text>
        ) : (
          <View className="flex-1">{title}</View>
        )}

        {showChevron && (
          <Icon
            name={open ? "chevron-up" : "chevron-down"}
            size={18}
            color="#7DD3FC"
          />
        )}
      </TouchableOpacity>

      {open && (
        <View className={`px-4 pb-4 pt-0 ${contentClassName}`}>
          {typeof children === "string" ? (
            <Text className="text-[13px] font-inter leading-5 text-foreground-muted">
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
}
