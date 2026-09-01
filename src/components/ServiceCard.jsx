// src/components/ServiceCard.jsx
import React from "react";
import { Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/theme";
import SvgIcon from "@/components/ui/SvgIcon";

/**
 * ServiceCard
 *
 * Renders a single tappable service icon card.
 * Layout and colors are driven by global.css component classes:
 *   .service-card        → w-[30%] items-center
 *   .service-card-circle → rounded-full border bg-background-muted
 *   .service-card-title  → text-center text-xs text-primary
 *
 * `useTheme` is only used to pass the raw primary hex to <SvgIcon>
 * which requires a JS color string (not a className).
 *
 * Props:
 * - job: { id, title, icon }
 * - onPress?: (job) => void   override default navigation
 * - iconSize?: number         default 28
 * - className?: string        extra classes on the Pressable
 */
const ServiceCard = ({ job, onPress, iconSize = 28, className = "" }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  // Raw hex needed only for the SVG icon color prop
  const primary = colors?.primary;

  const handlePress = () => {
    if (onPress) {
      onPress(job);
      return;
    }
    if (job?.id === "1" || job?.title === "Ride") {
      navigation.navigate("Driver");
    }

    if (job?.id === "2" || job?.title === "Food delivery") {
      navigation.navigate("FoodDelivery");
    }

    // Gig jobs — opens the active-job screen in demo mode (or waiting
    // state). Incoming requests still come from the Home "Incoming
    // Requests" list / modal, same as food & parcel.
    if (job?.id === "3" || job?.title === "Gig jobs") {
      navigation.navigate("GigJob");
    }

    if (job?.id === "4" || job?.title === "Parcel delivery") {
      navigation.navigate("ParcelDelivery");
    }
  };

  return (
    <Pressable
      className={`service-card ${className}`}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={job?.title}
    >
      {/* Circle container — bg-background-muted + border-border from global.css */}
      <View className="service-card-circle">
        <SvgIcon name={job?.icon} size={iconSize} color={primary} />
      </View>

      {/* Label — text-primary font-inter-medium from global.css */}
      <Text className="service-card-title" numberOfLines={2}>
        {job?.title}
      </Text>
    </Pressable>
  );
};

export default ServiceCard;
