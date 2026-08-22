// src/screens/main/DocumentsScreen.js
import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { getDocumentsBannerProps } from "@/utils/helpers";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import StatusBanner from "@/components/ui/StatusBanner";

const DOCUMENTS = [
  {
    id: "license",
    label: "Driver's License",
    icon: "card-account-details-outline",
    required: true,
  },
  {
    id: "insurance",
    label: "Vehicle Insurance",
    icon: "shield-car",
    required: true,
  },
  {
    id: "registration",
    label: "Vehicle Registration",
    icon: "file-document-outline",
    required: true,
  },
  {
    id: "profile_photo",
    label: "Profile Photo",
    icon: "camera-outline",
    required: true,
  },
  {
    id: "background",
    label: "Background Check",
    icon: "clipboard-check-outline",
    required: false,
  },
];

const STATUS_META = {
  approved: {
    variant: "success",
    icon: "check-circle",
    label: "Approved",
  },
  pending: {
    variant: "warning",
    icon: "clock-outline",
    label: "Under Review",
  },
  rejected: {
    variant: "error",
    icon: "close-circle",
    label: "Rejected",
  },
  missing: {
    variant: "muted",
    icon: "upload-outline",
    label: "Upload Required",
  },
};

export default function DocumentsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? "#38BDF8";

  const [docStatus] = useState({
    license: "pending",
    insurance: "approved",
    registration: "missing",
    profile_photo: "approved",
    background: "pending",
  });
  const [uploading, setUploading] = useState(null);

  const handleUpload = (docId) => {
    Alert.alert(
      "Upload Document",
      "In production this opens the camera or file picker.\nIntegrate expo-document-picker for real uploads.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Simulate Upload",
          onPress: async () => {
            setUploading(docId);
            await new Promise((r) => setTimeout(r, 1500));
            setUploading(null);
            Alert.alert("Uploaded", "Document submitted for review.");
          },
        },
      ],
    );
  };

  const pendingCount = Object.values(docStatus).filter((s) => s === "pending").length;
  const missingCount = Object.values(docStatus).filter((s) => s === "missing").length;

  const bannerProps = getDocumentsBannerProps({ missingCount, pendingCount });

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Documents" className="px-5" />

      <ScrollView
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <StatusBanner {...bannerProps} className="mb-5" />

        {/* Document list */}
        <View className="gap-2.5">
          {DOCUMENTS.map((doc) => {
            const status = docStatus[doc.id] || "missing";
            const meta = STATUS_META[status];
            const isUploading = uploading === doc.id;
            const isApproved = status === "approved";

            return (
              <View
                key={doc.id}
                className="flex-row items-center gap-3.5 rounded-2xl border border-border bg-card p-4"
              >
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                  <Icon name={doc.icon} size={24} color={primary} />
                </View>

                <View className="flex-1 gap-1.5">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Text className="text-sm font-inter-medium text-foreground">
                      {doc.label}
                    </Text>
                    {doc.required ? (
                      <Badge
                        label="Required"
                        variant="primary"
                        size="sm"
                        shape="rounded"
                        bordered={false}
                      />
                    ) : null}
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Badge
                      label={meta.label}
                      variant={meta.variant}
                      size="sm"
                      shape="pill"
                      icon={meta.icon}
                      bordered={false}
                    />
                  </View>
                </View>

                {/* Upload action — icon-only Button */}
                <Button
                  variant={isApproved ? "success" : "primary"}
                  size="sm"
                  icon={isApproved ? "check" : "upload"}
                  loading={isUploading}
                  disabled={isApproved || isUploading}
                  onPress={() => handleUpload(doc.id)}
                  className="h-10! w-10! px-0!"
                  iconSize={18}
                />
              </View>
            );
          })}
        </View>


        <Heading
          subtitle="Documents are reviewed within 24–48 hours. You&apos;ll be notified once approved."
          size="sm"
          align="center"
          className="mt-6"
        />
      </ScrollView>
    </View>
  );
}