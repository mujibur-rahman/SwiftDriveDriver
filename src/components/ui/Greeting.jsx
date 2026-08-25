import { View, Text } from "react-native";

/**
 * Reusable Greeting component.
 *
 * Props:
 * - name?: string              → user first name (default: "there")
 * - subtitle?: string          → second line text
 * - greeting?: string          → force a specific greeting string
 * - className?: string         → extra classes on the container View
 * - titleClassName?: string    → extra classes on the greeting title Text
 * - subtitleClassName?: string → extra classes on the subtitle Text
 *
 * Colors come from the theme via NativeWind tokens
 * (text-foreground, text-foreground-muted) so they update
 * automatically when the user switches light / dark mode.
 */
export default function Greeting({
  name = "there",
  subtitle = "What do you need today?",
  greeting,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}) {
  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = name?.split(" ")[0] || "there";

  return (
    <View className={className}>
      {/* Primary greeting line — uses theme foreground color */}
      <Text
        className={`mt-3.5 text-xl font-inter-semibold text-foreground ${titleClassName}`}
      >
        {getGreeting()}, {firstName}
      </Text>

      {/* Optional subtitle — uses muted foreground for visual hierarchy */}
      {subtitle ? (
        <Text
          className={`mt-0.5 text-[13px] font-inter text-foreground-muted ${subtitleClassName}`}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
