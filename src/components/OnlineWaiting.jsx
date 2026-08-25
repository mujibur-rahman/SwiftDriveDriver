// src/components/ui/OnlineWaiting.jsx 
import { View, Text, Animated } from "react-native";
import { usePulseAnimation } from "@/hooks/usePulseAnimation";
/**
 * Online / offline waiting banner — theme tokens only
 * Online state includes a soft pulse on the status indicator.
 *
 * Props:
 * - isOnline?: boolean
 * - onlineMessage?: string
 * - offlineMessage?: string
 * - showPulse?: boolean
 * - className?: string
 * - onlineClassName?: string
 * - offlineClassName?: string
 * - children?: ReactNode
 */

function PulseDot() {
    const { scale, opacity } = usePulseAnimation({
        minScale: 1,
        maxScale: 1.55,
        minOpacity: 0.15,
        maxOpacity: 0.55,
        duration: 900,
    });

    return (
        <View className="h-5 w-5 items-center justify-center">
            {/* Soft expanding ring */}
            <Animated.View
                className="absolute h-5 w-5 rounded-full bg-primary"
                style={{
                    transform: [{ scale }],
                    opacity,
                }}
            />
            {/* Solid core */}
            <View className="h-2.5 w-2.5 rounded-full bg-primary" />
        </View>
    );
}

export default function OnlineWaiting({
    isOnline = false,
    onlineMessage = "Waiting for ride requests...",
    offlineMessage = "You are offline. Toggle to start receiving requests.",
    showPulse = true,
    className = "",
    onlineClassName = "",
    offlineClassName = "",
    children,
}) {
    if (isOnline) {
        return (
            <View
                className={`flex-row items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3.5 ${onlineClassName} ${className}`}
                accessibilityRole="text"
                accessibilityLabel={onlineMessage}
            >
                {showPulse ? <PulseDot /> : null}

                {children ?? (
                    <Text className="flex-1 text-sm font-inter-medium text-primary">
                        {onlineMessage}
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View
            className={`items-center rounded-xl bg-background-muted p-3.5 ${offlineClassName} ${className}`}
            accessibilityRole="text"
            accessibilityLabel={offlineMessage}
        >
            {children ?? (
                <Text className="text-center text-sm font-inter text-foreground-muted">
                    {offlineMessage}
                </Text>
            )}
        </View>
    );
}