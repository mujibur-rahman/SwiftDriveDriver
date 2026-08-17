import { Text, View } from "react-native";
import {
  useFonts,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import { useNavigation } from "@react-navigation/native";
import Avatar from "./Avatar";
import Greeting from "./Greeting";

const LogoAvatar = () => {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    InstrumentSerif: InstrumentSerif_400Regular_Italic,
  });

  if (!fontsLoaded) return null;

  return (
    <View className="logo-avatar">
      <View className="flex-row justify-between items-center">
        <Text className="text-[26px] text-primary font-instrument font-semibold">
          ZyroApp
        </Text>

        <Avatar
          name="Alex Carter"
          onPress={() => navigation.navigate("Profile")}
        />
      </View>

      <Greeting name="Alex Carter" />
    </View>
  );
};

export default LogoAvatar;
