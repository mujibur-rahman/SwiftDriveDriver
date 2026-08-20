// src/components/ui/AppModal.jsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import Button from "@/components/ui/Button";

/**
 * Reusable bottom-sheet modal
 *
 * Props:
 * - visible: boolean
 * - onClose: () => void
 * - title?: string | React.ReactNode
 * - subtitle?: string | React.ReactNode
 * - children: React.ReactNode
 * - showHandle?: boolean          (default true)
 * - showClose?: boolean           (default false)
 * - closeOnOverlay?: boolean      (default true)
 * - primaryLabel?: string
 * - onPrimary?: () => void
 * - primaryLoading?: boolean
 * - primaryDisabled?: boolean
 * - primaryVariant?: string       (default "primary")
 * - secondaryLabel?: string       (default "Cancel")
 * - onSecondary?: () => void
 * - secondaryLoading?: boolean
 * - secondaryDisabled?: boolean
 * - secondaryVariant?: string     (default "outline")
 * - hideActions?: boolean
 * - scrollable?: boolean          (default true)
 * - className?: string            // sheet container
 * - contentClassName?: string
 * - footerClassName?: string
 */
export default function AppModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showHandle = true,
  showClose = false,
  closeOnOverlay = true,
  primaryLabel,
  onPrimary,
  primaryLoading = false,
  primaryDisabled = false,
  primaryVariant = "primary",
  secondaryLabel = "Cancel",
  onSecondary,
  secondaryLoading = false,
  secondaryDisabled = false,
  secondaryVariant = "outline",
  hideActions = false,
  scrollable = true,
  className = "",
  contentClassName = "",
  footerClassName = "",
}) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const closeIconColor =
    colors?.foregroundMuted ?? (isDark ? "#7DD3FC" : "#64748B");

  const handleSecondary = () => {
    if (onSecondary) onSecondary();
    else onClose?.();
  };

  const body = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerClassName={contentClassName}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={contentClassName}>{children}</View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Overlay */}
        <Pressable
          className="flex-1 justify-end bg-black/80"
          onPress={closeOnOverlay ? onClose : undefined}
          accessibilityRole="none"
        >
          {/* Sheet — stop propagation so taps inside don't close */}
          <Pressable
            accessibilityViewIsModal
            className={`rounded-t-3xl border border-border bg-card px-6 pt-3 ${className}`}
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            {showHandle && (
              <View className="mb-3 items-center">
                <View className="h-1 w-10 rounded-full bg-border" />
              </View>
            )}

            {/* Title & Header row */}
            {(title || subtitle || showClose) && (
              <View className="mb-5 flex-row items-start justify-between">
                <View className="flex-1">
                  {title ? (
                    typeof title === "string" ? (
                      <Text className="text-xl font-inter-bold text-foreground">
                        {title}
                      </Text>
                    ) : (
                      title
                    )
                  ) : null}

                  {subtitle ? (
                    typeof subtitle === "string" ? (
                      <Text className="mt-1 text-sm font-inter text-foreground-muted">
                        {subtitle}
                      </Text>
                    ) : (
                      subtitle
                    )
                  ) : null}
                </View>

                {showClose && (
                  <TouchableOpacity
                    className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-background-muted"
                    onPress={onClose}
                    activeOpacity={0.7}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                  >
                    <Icon name="close" size={20} color={closeIconColor} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {body}

            {/* Actions */}
            {!hideActions && (primaryLabel || secondaryLabel) && (
              <View className={`mt-5 flex-row gap-3 ${footerClassName}`}>
                {secondaryLabel ? (
                  <View className={primaryLabel ? "flex-1" : "flex-1"}>
                    <Button
                      variant={secondaryVariant}
                      onPress={handleSecondary}
                      loading={secondaryLoading}
                      disabled={secondaryDisabled || secondaryLoading}
                    >
                      {secondaryLabel}
                    </Button>
                  </View>
                ) : null}

                {primaryLabel ? (
                  <View className={secondaryLabel ? "flex-1" : "flex-1"}>
                    <Button
                      variant={primaryVariant}
                      onPress={onPrimary}
                      loading={primaryLoading}
                      disabled={primaryDisabled || primaryLoading}
                    >
                      {primaryLabel}
                    </Button>
                  </View>
                ) : null}
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Usage examples:
//
// Confirm only:
// <AppModal
//   visible={open}
//   onClose={() => setOpen(false)}
//   title="Sign out?"
//   primaryLabel="Sign Out"
//   primaryVariant="error"
//   onPrimary={handleLogout}
//   secondaryLabel="Cancel"
// >
//   <Text className="text-[15px] font-inter text-foreground-muted">
//     Are you sure you want to sign out?
//   </Text>
// </AppModal>
//
// Custom content with close button, no footer actions:
// <AppModal
//   visible={open}
//   onClose={() => setOpen(false)}
//   title="Filters"
//   showClose
//   hideActions
// >
//   {/* filter UI */}
// </AppModal>
//
// Primary only:
// <AppModal
//   visible={open}
//   onClose={() => setOpen(false)}
//   title="Success"
//   primaryLabel="Done"
//   onPrimary={() => setOpen(false)}
//   secondaryLabel={null}
// >
//   <Text className="text-foreground">Profile updated.</Text>
// </AppModal>

