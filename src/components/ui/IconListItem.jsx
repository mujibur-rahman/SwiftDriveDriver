// src/components/ui/IconListItem.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * List row with emoji/icon, title, subtitle, and optional right actions / content
 *
 * Props:
 * - icon?: string                 // emoji
 * - leftIcon?: string             // MaterialCommunityIcons name
 * - leftIconSize?: number         // default 22
 * - leftIconColor?: string        // override theme primary
 * - iconBoxVariant?: "muted" | "primary"  // default "muted"; "primary" = bg-primary/15
 * - label: string
 * - subtitle?: string
 * - subtitlePlaceholder?: string  // shown only when subtitle is undefined
 * - rightContent?: ReactNode      // e.g. <Badge />, status chip
 * - onPress?: () => void
 * - onEdit?: () => void
 * - onDelete?: () => void
 * - showEdit?: boolean            // default true if onEdit
 * - showDelete?: boolean          // default true if onDelete
 * - className?: string
 * - disabled?: boolean
 */
export default function IconListItem({
  icon,
  leftIcon,
  leftIconSize = 22,
  leftIconColor,
  iconBoxVariant = "muted",
  label,
  subtitle,
  subtitlePlaceholder = "Tap to set address",
  rightContent,
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
  const hasActions = canEdit || canDelete;
  const resolvedIconColor = leftIconColor ?? primary;

  const iconBoxClass =
    iconBoxVariant === "primary"
      ? "bg-primary/15"
      : "bg-background-muted";

  const body = (
    <>
      {/* Left icon / emoji */}
      {(icon || leftIcon) && (
        <View
          className={`h-11 w-11 items-center justify-center rounded-xl ${iconBoxClass}`}
        >
          {icon ? (
            <Text className="text-2xl">{icon}</Text>
          ) : (
            <Icon
              name={leftIcon}
              size={leftIconSize}
              color={resolvedIconColor}
            />
          )}
        </View>
      )}

      {/* Label + subtitle */}
      <View className="min-w-0 flex-1">
        <Text
          className="text-sm font-inter-medium text-foreground"
          numberOfLines={1}
        >
          {label}
        </Text>
        {(subtitle != null && subtitle !== "") ||
          (subtitle === undefined && subtitlePlaceholder) ? (
          <Text
            className="mt-0.5 text-xs font-inter text-foreground-muted"
            numberOfLines={2}
          >
            {subtitle != null && subtitle !== ""
              ? subtitle
              : subtitlePlaceholder}
          </Text>
        ) : null}
      </View>

      {/* Right: custom content and/or edit/delete */}
      {rightContent ? rightContent : null}

      {hasActions && (
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
    </>
  );

  const rowClass = `
    flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4
    ${disabled ? "opacity-50" : ""}
    ${className}
  `;

  if (onPress) {
    return (
      <TouchableOpacity
        className={rowClass}
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
      >
        {body}
      </TouchableOpacity>
    );
  }

  return <View className={rowClass}>{body}</View>;
}

// Usage — model status rows (FLStatusScreen):
//
// <View className="mb-4 gap-2.5">
//   {MODELS.map((model) => (
//     <IconListItem
//       key={model.type}
//       leftIcon={model.icon}
//       iconBoxVariant="primary"
//       label={model.label}
//       subtitle={model.desc}
//       rightContent={
//         <Badge
//           label={flStatus.hasModels ? "Active" : "Pending"}
//           variant={flStatus.hasModels ? "success" : "warning"}
//           size="sm"
//           shape="pill"
//         />
//       }
//     />
//   ))}
// </View>
//
// Usage — place with edit/delete:
//
// <IconListItem
//   icon="🏠"
//   label="Home"
//   subtitle={address}
//   onPress={openEdit}
//   onEdit={openEdit}
//   onDelete={remove}
// />