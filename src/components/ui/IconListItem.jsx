// src/components/ui/IconListItem.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * List row with emoji/icon, title, subtitle, and action buttons
 *
 * Props:
 * - icon?: string              // emoji or left content
 * - leftIcon?: string          // MaterialCommunityIcons name (if no emoji)
 * - label: string
 * - subtitle?: string
 * - subtitlePlaceholder?: string
 * - onPress?: () => void
 * - onEdit?: () => void
 * - onDelete?: () => void
 * - showEdit?: boolean         (default true if onEdit)
 * - showDelete?: boolean       (default true if onDelete)
 * - className?: string
 * - disabled?: boolean
 */
export default function IconListItem({
  icon,
  leftIcon,
  label,
  subtitle,
  subtitlePlaceholder = "Tap to set address",
  onPress,
  onEdit,
  onDelete,
  showEdit,
  showDelete,
  className = "",
  disabled = false,
}) {
  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9");
  const muted = isDark ? "#7DD3FC" : "#64748B";
  const error = isDark ? "#F87171" : "#DC2626";

  const canEdit = showEdit ?? !!onEdit;
  const canDelete = showDelete ?? !!onDelete;

  return (
    <TouchableOpacity
      className={`
        flex-row items-center gap-3.5 rounded-2xl border border-border bg-card p-4
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      {/* Left icon / emoji */}
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-background-muted">
        {icon ? (
          <Text className="text-2xl">{icon}</Text>
        ) : leftIcon ? (
          <Icon name={leftIcon} size={22} color={primary} />
        ) : null}
      </View>

      {/* Label + subtitle */}
      <View className="flex-1">
        <Text
          className="text-[15px] font-inter-medium text-foreground"
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text
          className="mt-0.5 text-[13px] font-inter text-foreground-muted"
          numberOfLines={1}
        >
          {subtitle || subtitlePlaceholder}
        </Text>
      </View>

      {/* Actions */}
      {(canEdit || canDelete) && (
        <View className="flex-row items-center gap-1.5">
          {canEdit && (
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center rounded-lg bg-background-muted"
              onPress={(e) => {
                e?.stopPropagation?.();
                onEdit?.();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon name="pencil-outline" size={16} color={muted} />
            </TouchableOpacity>
          )}

          {canDelete && (
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center rounded-lg border border-error/30 bg-error/15"
              onPress={(e) => {
                e?.stopPropagation?.();
                onDelete?.();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon name="trash-can-outline" size={16} color={error} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// IconListItem usage examples:

// {/* Icon instead of emoji */}
// <IconListItem
//   leftIcon="map-marker"
//   label="Office"
//   subtitle="123 Main St"
//   onPress={...}
//   onEdit={...}
// />

// {/* No delete */}
// <IconListItem
//   icon="🏠"
//   label="Home"
//   subtitle={address}
//   onPress={openEdit}
//   onEdit={openEdit}
// />

// {/* Read-only row */}
// <IconListItem
//   icon="⭐"
//   label="Favorite"
//   subtitle="Saved place"
//   showEdit={false}
//   showDelete={false}
// />



// {/* Icon instead of emoji */}
// <IconListItem
//   leftIcon="map-marker"
//   label="Office"
//   subtitle="123 Main St"
//   onPress={...}
//   onEdit={...}
// />

// {/* No delete */}
// <IconListItem
//   icon="🏠"
//   label="Home"
//   subtitle={address}
//   onPress={openEdit}
//   onEdit={openEdit}
// />

// {/* Read-only row */}
// <IconListItem
//   icon="⭐"
//   label="Favorite"
//   subtitle="Saved place"
//   showEdit={false}
//   showDelete={false}
// />
