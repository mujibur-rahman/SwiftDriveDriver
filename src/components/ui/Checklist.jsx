// src/components/ui/Checklist.jsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * Checklist
 *
 * Reusable interactive checklist. Theme-aware (success / muted / border / card).
 *
 * Items shape (either works):
 *   { id, label }           — controlled via `checked` map + `onToggle`
 *   { id, label, done }     — uncontrolled per-item done flag (still needs onToggle to change)
 *
 * Props:
 * - items: Array<{ id: string, label: string, done?: boolean }>
 * - checked?: Record<string, boolean>   // controlled checked map by id
 * - onToggle?: (id: string) => void
 * - title?: string | null               // section header — omit / null / "" to hide
 * - showTitle?: boolean                 // default: true when title is non-empty
 * - wrapped?: boolean                   // wrap list in a bordered card — default false
 * - disabled?: boolean
 * - className?: string                  // outer container
 * - itemClassName?: string
 * - titleClassName?: string
 * - iconSize?: number                   // default 22
 * - testID?: string
 *
 * Example:
 *   <Checklist
 *     title="CHECKLIST"
 *     items={[{ id: 'c1', label: 'Mow lawn' }]}
 *     checked={checkedItems}
 *     onToggle={toggleItem}
 *   />
 *
 *   // No title, no card wrapper:
 *   <Checklist items={items} checked={checked} onToggle={onToggle} title={null} />
 */

export default function Checklist({
  items = [],
  checked,
  onToggle,
  title = "CHECKLIST",
  showTitle,
  wrapped = false,
  disabled = false,
  className = "",
  itemClassName = "",
  titleClassName = "",
  iconSize = 22,
  testID,
}) {
  const { colors, isDark } = useTheme();

  const successHex = colors?.success ?? (isDark ? "#34D399" : "#16A34A");
  const mutedHex =
    colors?.foregroundMuted ?? (isDark ? "#7DD3FC" : "#64748B");
  const fgHex = colors?.foreground ?? (isDark ? "#F0F9FF" : "#0F172A");
  const borderHex = colors?.border ?? (isDark ? "#1E3A5F" : "#E2E8F0");
  const cardHex = colors?.card ?? (isDark ? "#0D1E32" : "#F8FAFC");

  const shouldShowTitle =
    showTitle !== undefined
      ? showTitle
      : title != null && String(title).trim().length > 0;

  const list = useMemo(
    () => (Array.isArray(items) ? items.filter(Boolean) : []),
    [items],
  );

  if (list.length === 0) return null;

  const isDone = (item) => {
    if (checked && item.id != null) return !!checked[item.id];
    return !!item.done;
  };

  const content = (
    <View className={`gap-2 ${className}`} testID={testID}>
      {shouldShowTitle ? (
        <Text
          className={`text-[11px] font-inter-semibold uppercase tracking-widest text-foreground-muted ${titleClassName}`}
        >
          {title}
        </Text>
      ) : null}

      {list.map((item, index) => {
        const id = item.id ?? String(index);
        const done = isDone(item);

        return (
          <TouchableOpacity
            key={id}
            onPress={() => {
              if (disabled || !onToggle) return;
              onToggle(id);
            }}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled || !onToggle}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done, disabled }}
            accessibilityLabel={item.label}
            className={`flex-row items-center gap-2.5 rounded-xl border px-2.5 py-2 ${itemClassName}`}
            style={{
              borderColor: done ? successHex : borderHex,
              backgroundColor: done ? `${successHex}14` : cardHex,
              opacity: disabled ? 0.55 : 1,
            }}
          >
            <Icon
              name={
                done
                  ? "checkbox-marked-circle"
                  : "checkbox-blank-circle-outline"
              }
              size={iconSize}
              color={done ? successHex : mutedHex}
            />
            <Text
              className="flex-1 text-sm font-inter text-foreground"
              style={{
                color: fgHex,
                fontWeight: done ? "600" : "400",
                textDecorationLine: done ? "line-through" : "none",
              }}
              numberOfLines={3}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (!wrapped) return content;

  // Optional parent card
  return (
    <View className="rounded-2xl border border-border bg-card px-3 py-3">
      {content}
    </View>
  );
}
