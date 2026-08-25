import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Avatar from "@/components/ui/Avatar";
import Greeting from "@/components/ui/Greeting";

/**
 * LogoAvatar
 *
 * Renders the top header row: app logo name on the left, avatar on the right,
 * and the time-aware greeting below.
 *
 * Colours are driven entirely by NativeWind theme tokens so the component
 * responds correctly to light / dark mode switching.
 */
const LogoAvatar = () => {
  const navigation = useNavigation();

  return (
    // logo-avatar applies: mb-8 pt-5 (defined in global.css @layer components)
    <View className="logo-avatar">
      <View className="flex-row justify-between items-center">
        {/* App name — accent italic style using theme primary token */}
        <Text className="text-[26px] text-primary font-instrument-italic font-semibold">
          ZyroApp
        </Text>

        {/* User avatar — navigates to Profile on press */}
        <Avatar
          name="Alex Carter"
          onPress={() => navigation.navigate("Profile")}
        />
      </View>

      {/* Time-aware greeting below the header row */}
      <Greeting name="Alex Carter" />
    </View>
  );
};

export default LogoAvatar;
