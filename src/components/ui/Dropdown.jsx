// src/components/ui/Dropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

/**
 * Reusable dropdown / select
 *
 * Props:
 * - label?: string
 * - placeholder?: string
 * - options: Array<{ label: string, value: any, icon?: string, subtitle?: string }>
 * - value?: any
 * - onChange: (value, option) => void
 * - disabled?: boolean
 * - error?: string
 * - searchable?: boolean          // filter by label
 * - maxHeight?: number
 * - leftIcon?: string
 * - className?: string
 * - renderOption?: (option, selected) => ReactNode
 */
export default function Dropdown({
  label,
  placeholder = "Select...",
  options = [],
  value,
  onChange,
  disabled = false,
  error,
  maxHeight = 260,
  leftIcon,
  className = "",
  renderOption,
}) {
  const [open, setOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState(null);
  const triggerRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const openMenu = () => {
    if (disabled) return;
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowH = Dimensions.get("window").height;
      const spaceBelow = windowH - (y + height);
      const openUp = spaceBelow < maxHeight && y > maxHeight;

      setMenuLayout({
        x,
        y: openUp
          ? y - Math.min(maxHeight, options.length * 52) - 4
          : y + height + 4,
        width,
        openUp,
      });
      setOpen(true);
    });
  };

  const handleSelect = (option) => {
    onChange?.(option.value, option);
    setOpen(false);
  };

  return (
    <View className={`relative ${className}`}>
      {label ? (
        <Text className="mb-1.5 text-xs font-inter-semibold tracking-wide text-foreground-muted">
          {label}
        </Text>
      ) : null}

      {/* Trigger */}
      <TouchableOpacity
        ref={triggerRef}
        onPress={openMenu}
        activeOpacity={0.75}
        disabled={disabled}
        className={`
          h-12 flex-row items-center gap-2 rounded-xl border bg-input px-3
          ${error ? "border-error" : open ? "border-ring" : "border-border"}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        {leftIcon ? <Icon name={leftIcon} size={18} color="#7DD3FC" /> : null}

        <Text
          className={`flex-1 text-base font-inter ${
            selected ? "text-foreground" : "text-foreground-muted"
          }`}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>

        <Icon
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#7DD3FC"
        />
      </TouchableOpacity>

      {error ? (
        <Text className="mt-1.5 text-xs font-inter text-error">{error}</Text>
      ) : null}

      {/* Menu */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          {menuLayout && (
            <View
              style={{
                position: "absolute",
                top: menuLayout.y,
                left: menuLayout.x,
                width: menuLayout.width,
                maxHeight,
              }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
            >
              <FlatList
                data={options}
                keyExtractor={(item, i) => String(item.value ?? i)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item, index }) => {
                  const isSelected = item.value === value;

                  if (renderOption) {
                    return (
                      <TouchableOpacity
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.7}
                      >
                        {renderOption(item, isSelected)}
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                      className={`
                        flex-row items-center gap-3 px-3.5 py-3
                        ${index < options.length - 1 ? "border-b border-border/60" : ""}
                        ${isSelected ? "bg-primary/10" : ""}
                      `}
                    >
                      {item.icon ? (
                        <View className="size-8 items-center justify-center rounded-full bg-background-muted">
                          <Icon name={item.icon} size={16} color="#38BDF8" />
                        </View>
                      ) : null}

                      <View className="flex-1">
                        <Text
                          className={`text-sm font-inter-semibold ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                        {item.subtitle ? (
                          <Text
                            className="mt-0.5 text-xs font-inter text-foreground-muted"
                            numberOfLines={1}
                          >
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>

                      {isSelected ? (
                        <Icon name="check" size={18} color="#38BDF8" />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

// Usage

// const RIDE_TYPES = [
//   { label: "Economy", value: "economy", icon: "car", subtitle: "Affordable" },
//   { label: "Comfort", value: "comfort", icon: "car-side", subtitle: "Extra space" },
//   { label: "XL", value: "xl", icon: "van-passenger", subtitle: "Up to 6 seats" },
// ];

// <Dropdown
//   label="Ride type"
//   placeholder="Choose ride"
//   options={RIDE_TYPES}
//   value={rideType}
//   onChange={(val) => setRideType(val)}
//   leftIcon="car"
// />

// const [paymentId, setPaymentId] = useState(0);
//   <Dropdown
//   label="Pay with"
//   options={[
//     { label: "Visa •• 4242", value: "card_1", icon: "credit-card" },
//     { label: "Cash", value: "cash", icon: "cash" },
//     { label: "Wallet", value: "wallet", icon: "wallet" },
//   ]}
//   value={paymentId}
//   onChange={setPaymentId}
// />
