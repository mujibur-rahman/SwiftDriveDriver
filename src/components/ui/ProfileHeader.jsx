// src/components/ui/ProfileHeader.jsx
import React from "react";
import { View, Text } from "react-native";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

/**
 * Reusable Profile Header
 *
 * Props:
 * - name            string
 * - subtitle        string | ReactNode
 * - avatarSize      "sm" | "md" | "lg" | number   (default "lg")
 * - verified        boolean
 * - verifiedLabel   string
 * - onPress         () => void
 * - rightContent    ReactNode
 * - loading         boolean
 * - className       string
 */
export default function ProfileHeader({
  name = "User",
  subtitle,
  avatarSize = "lg",
  verified = false,
  verifiedLabel = "Verified",
  onPress,
  rightContent,
  loading = false,
  className = "",
}) {
  return (
    <View className={`flex-row items-center gap-4 ${className}`}>
      <Avatar
        name={name}
        size={avatarSize}
        onPress={onPress}
        loading={loading}
        className="border-0" // remove border if you prefer cleaner look
      />

      {/* Info */}
      <View className="flex-1">
        <Text
          className="text-lg font-inter-bold text-foreground"
          numberOfLines={1}
        >
          {name}
        </Text>

        {subtitle ? (
          typeof subtitle === "string" ? (
            <Text
              className="mt-0.5 text-sm font-inter text-foreground-muted"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : (
            subtitle
          )
        ) : null}

        {verified && (
          <Badge
            label={verifiedLabel || "Verified"}
            variant="success"
            shape="pill"
            size="sm"
            icon="check-decagram"
            bordered={false}
            className="mt-1.5"
          />
        )}
      </View>

      {rightContent}
    </View>
  );
}
