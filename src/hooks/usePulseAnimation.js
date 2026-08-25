// src/hooks/usePulseAnimation.js
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export function usePulseAnimation({
    minScale = 1,
    maxScale = 1.55,
    minOpacity = 0.15,
    maxOpacity = 0.55,
    duration = 900,
} = {}) {
    const scale = useRef(new Animated.Value(minScale)).current;
    const opacity = useRef(new Animated.Value(maxOpacity)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: maxScale,
                        duration,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: minScale,
                        duration,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: minOpacity,
                        duration,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: maxOpacity,
                        duration,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [scale, opacity, minScale, maxScale, minOpacity, maxOpacity, duration]);

    return { scale, opacity };
}