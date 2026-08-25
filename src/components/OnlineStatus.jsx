// src/components/ui/OnlineStatus.jsx
import React, { useMemo } from "react";
import { View, Text, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme";
import AppSwitch from "@/components/ui/AppSwitch";

/**
 * Top overlay header: greeting + online/offline pill + toggle
 * Theme tokens only (global.css / colors.js).
 */

function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
    const h = hex.replace("#", "");
    const full =
        h.length === 3
            ? h
                .split("")
                .map((c) => c + c)
                .join("")
            : h;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return `rgba(0,0,0,${alpha})`;
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

export default function OnlineStatus({
    name,
    isOnline = false,
    onToggleOnline,
    onlineLabel = "Online",
    offlineLabel = "Offline",
    activeSwitchLabel = "Go Offline",
    inactiveSwitchLabel = "Go Online",
    greetingPrefix = "Hello",
    fallbackName = "Driver",
    showSwitch = true,
    showGreeting = false,
    rightContent,
    absolute = true,
    className = "",
    children,
}) {
    const { colors, isDark } = useTheme();

    const firstName = (name || "").trim().split(/\s+/)[0] || fallbackName;

    const gradTop = useMemo(() => {
        const bg = colors?.background ?? (isDark ? "#060E1A" : "#FFFFFF");
        return [
            hexToRgba(bg, 0.95),
            hexToRgba(bg, 0.7),
            hexToRgba(bg, 0),
        ];
    }, [colors?.background, isDark]);

    const topPad = Platform.OS === "android" ? "pt-10" : "pt-12";

    const positionClass = absolute
        ? "absolute left-0 right-0 top-0 px-5"  // ← applied when absolute is true
        : "relative";

    return (
        <LinearGradient
            colors={gradTop}
            className={`${positionClass} ${topPad} ${className}`}
            pointerEvents="box-none"
        >
            <View
                className="flex-row items-center justify-between"
                pointerEvents="box-none"
            >
                <View className="mr-3 flex-1">
                    {showGreeting ? (
                        <Text className="text-lg font-inter-bold text-foreground">
                            {greetingPrefix}, {firstName}
                        </Text>
                    ) : null}

                    <View
                        className={`
              mt-1 flex-row items-center gap-1.5 self-start rounded-full border px-2.5 py-1
              ${isOnline
                                ? "border-success/30 bg-success/10"
                                : "border-border bg-background-muted"
                            }
            `}
                    >
                        <View
                            className={`h-2 w-2 rounded-full ${isOnline ? "bg-success" : "bg-foreground-muted"
                                }`}
                        />
                        <Text
                            className={`text-[13px] font-inter-semibold ${isOnline ? "text-success" : "text-foreground-muted"
                                }`}
                        >
                            {isOnline ? onlineLabel : offlineLabel}
                        </Text>
                    </View>
                </View>

                {rightContent ??
                    (showSwitch ? (
                        <AppSwitch
                            value={isOnline}
                            onValueChange={onToggleOnline}
                            activeLabel={activeSwitchLabel}
                            inactiveLabel={inactiveSwitchLabel}
                        />
                    ) : null)}
            </View>

            {children}
        </LinearGradient>
    );
}

// online status without switch button (only for online label and dot) - NOT USED
// export default function OnlineStatusHeader({
//     name,
//     isOnline = false,
//     onToggleOnline,
//     className = "",
// }) {
//     return (
//         <OnlineStatus
//             name={name}
//             isOnline={isOnline}
//             onToggleOnline={onToggleOnline}
//             showSwitch
//         />
//     );
// }

// online status with switch button (for online label and dot) - USED
// <OnlineStatus
//   isOnline={driverState.isOnline}
//   onToggleOnline={toggleOnline}
//   name={driver.name || "Driver"}
//   absolute={false}
// />