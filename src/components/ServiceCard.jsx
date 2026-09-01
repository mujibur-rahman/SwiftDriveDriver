// src/components/ServiceCard.jsx
import React from "react";
import { Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/theme";
import SvgIcon from "@/components/ui/SvgIcon";

const ServiceCard = ({ job, onPress, iconSize = 28, className = "" }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
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
      <View className="service-card-circle">
        <SvgIcon name={job?.icon} size={iconSize} color={primary} />
      </View>
      <Text className="service-card-title" numberOfLines={2}>
        {job?.title}
      </Text>
    </Pressable>
  );
};

export default ServiceCard;
