// src/components/ui/SearchBar.jsx
import React, { forwardRef, useState } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

/**
 * Reusable search input
 *
 * Props:
 * - value?: string
 * - onChangeText?: (text: string) => void
 * - onSubmit?: (text: string) => void
 * - onClear?: () => void
 * - onFocus?: () => void
 * - onBlur?: () => void
 * - placeholder?: string
 * - debounce?: number              // ms; calls onChangeText after delay
 * - loading?: boolean
 * - showClear?: boolean            (default true)
 * - autoFocus?: boolean
 * - editable?: boolean
 * - size?: "sm" | "md" | "lg"
 * - leftIcon?: string              (default "magnify")
 * - rightIcon?: string             // extra action (filter, etc.)
 * - onRightPress?: () => void
 * - className?: string
 * - inputClassName?: string
 */
const SIZES = {
  sm: "h-11 rounded-xl",
  md: "h-[52px] rounded-2xl",
  lg: "h-14 rounded-2xl",
};

const SearchBar = forwardRef(function SearchBar(
  {
    value: controlledValue,
    onChangeText,
    onSubmit,
    onClear,
    onFocus,
    onBlur,
    placeholder = "Search...",
    debounce = 0,
    loading = false,
    showClear = true,
    autoFocus = false,
    editable = true,
    size = "md",
    leftIcon = "magnify",
    rightIcon,
    onRightPress,
    className = "",
    inputClassName = "",
    ...props
  },
  ref,
) {
  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = useState("");
  const value = isControlled ? controlledValue : internal;

  const timerRef = React.useRef(null);

  const emitChange = (text) => {
    if (!isControlled) setInternal(text);

    if (debounce > 0 && onChangeText) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChangeText(text), debounce);
    } else {
      onChangeText?.(text);
    }
  };

  const handleClear = () => {
    if (!isControlled) setInternal("");
    onChangeText?.("");
    onClear?.();
  };

  const sizeClass = SIZES[size] || SIZES.md;
  const hasClear = showClear && value?.length > 0 && !loading;

  return (
    <View
      className={`
        flex-row items-center gap-2.5 border border-border bg-input px-4
        ${sizeClass}
        ${!editable ? "opacity-50" : ""}
        ${className}
      `}
    >
      <Icon name={leftIcon} size={20} color="#7DD3FC" />

      <TextInput
        ref={ref}
        className={`
          flex-1 p-0 text-[15px] font-inter text-foreground
          ${inputClassName}
        `}
        value={value}
        onChangeText={emitChange}
        onSubmitEditing={() => onSubmit?.(value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#7DD3FC"
        selectionColor="#38BDF8"
        cursorColor="#38BDF8"
        returnKeyType="search"
        autoFocus={autoFocus}
        editable={editable}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
        {...props}
      />

      {loading && <ActivityIndicator size="small" color="#38BDF8" />}

      {hasClear && (
        <TouchableOpacity onPress={handleClear} hitSlop={8} activeOpacity={0.7}>
          <Icon name="close-circle" size={18} color="#7DD3FC" />
        </TouchableOpacity>
      )}

      {rightIcon && !loading && (
        <TouchableOpacity
          onPress={onRightPress}
          hitSlop={8}
          activeOpacity={0.7}
          disabled={!onRightPress}
        >
          <Icon name={rightIcon} size={20} color="#7DD3FC" />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default SearchBar;