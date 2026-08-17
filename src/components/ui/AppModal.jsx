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
import Button from "@/components/ui/Button";

/**
 * Reusable bottom-sheet modal
 *
 * Props:
 * - visible: boolean
 * - onClose: () => void
 * - title?: string | ReactNode
 * - children: ReactNode
 * - showHandle?: boolean          (default true)
 * - showClose?: boolean           (default false)
 * - closeOnOverlay?: boolean      (default true)
 * - primaryLabel?: string
 * - onPrimary?: () => void
 * - primaryLoading?: boolean
 * - primaryDisabled?: boolean
 * - secondaryLabel?: string       (default "Cancel")
 * - onSecondary?: () => void
 * - hideActions?: boolean
 * - scrollable?: boolean          (default true)
 * - className?: string            // sheet container
 * - contentClassName?: string
 */
export default function AppModal({
  visible,
  onClose,
  title,
  children,
  showHandle = true,
  showClose = false,
  closeOnOverlay = true,
  primaryLabel,
  onPrimary,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryLabel = "Cancel",
  onSecondary,
  hideActions = false,
  scrollable = true,
  className = "",
  contentClassName = "",
}) {
  const insets = useSafeAreaInsets();

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
        >
          {/* Sheet — stop propagation so taps inside don't close */}
          <Pressable
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

            {/* Title row */}
            {(title || showClose) && (
              <View className="mb-5 flex-row items-center justify-between">
                {typeof title === "string" ? (
                  <Text className="flex-1 text-xl font-inter-bold text-foreground">
                    {title}
                  </Text>
                ) : (
                  title
                )}

                {showClose && (
                  <TouchableOpacity
                    className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-background-muted"
                    onPress={onClose}
                    activeOpacity={0.7}
                    hitSlop={8}
                  >
                    <Icon name="close" size={20} color="#7DD3FC" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {body}

            {/* Actions */}
            {!hideActions && (primaryLabel || secondaryLabel) && (
              <View className="mt-5 flex-row gap-3">
                {secondaryLabel ? (
                  <View className={primaryLabel ? "flex-1" : "flex-1"}>
                    <Button variant="outline" onPress={handleSecondary}>
                      {secondaryLabel}
                    </Button>
                  </View>
                ) : null}

                {primaryLabel ? (
                  <View className="flex-2">
                    <Button
                      variant="primary"
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

// {/* Confirm only */}
// <AppModal
//   visible={open}
//   onClose={() => setOpen(false)}
//   title="Sign out?"
//   primaryLabel="Sign Out"
//   onPrimary={handleLogout}
//   secondaryLabel="Cancel"
// >
//   <Text className="text-[15px] font-inter text-foreground-muted">
//     Are you sure you want to sign out?
//   </Text>
// </AppModal>

// {/* Custom content, no footer buttons */}
// <AppModal
//   visible={open}
//   onClose={() => setOpen(false)}
//   title="Filters"
//   showClose
//   hideActions
// >
//   {/* filter UI */}
// </AppModal>

// {/* Primary only */}
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
