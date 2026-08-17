// src/components/ui/Heading.jsx
import React from "react";
import { View, Text } from "react-native";

/**
 * Page / section heading + optional subtitle
 *
 * Props:
 * - title: string | ReactNode
 * - subtitle?: string | ReactNode
 * - size?: "sm" | "md" | "lg" | "xl"
 * - align?: "left" | "center" | "right"
 * - className?: string
 * - titleClassName?: string
 * - subtitleClassName?: string
 * - as?: "h1" | "h2" | "h3"   // semantic only; all render Text
 */
const SIZES = {
  sm: {
    title: "text-xl font-inter-bold",
    subtitle: "text-sm",
    gap: "mt-1",
  },
  md: {
    title: "text-2xl font-inter-bold",
    subtitle: "text-[15px]",
    gap: "mt-1.5",
  },
  lg: {
    title: "text-3xl font-inter-extrabold",
    subtitle: "text-base",
    gap: "mt-2",
  },
  xl: {
    title: "text-[36px] font-inter-extrabold leading-[44px]",
    subtitle: "text-[15px]",
    gap: "mt-2",
  },
};

const ALIGN = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
};

const TEXT_ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function Heading({
  title,
  subtitle,
  size = "lg",
  align = "left",
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}) {
  const s = SIZES[size] || SIZES.lg;
  const a = ALIGN[align] || ALIGN.left;
  const ta = TEXT_ALIGN[align] || TEXT_ALIGN.left;

  return (
    <View className={`${a} ${className}`}>
      {typeof title === "string" ? (
        <Text className={`${s.title} text-foreground ${ta} ${titleClassName}`}>
          {title}
        </Text>
      ) : (
        title
      )}

      {subtitle ? (
        typeof subtitle === "string" ? (
          <Text
            className={`${s.gap} ${s.subtitle} font-inter text-foreground-muted ${ta} ${subtitleClassName}`}
          >
            {subtitle}
          </Text>
        ) : (
          <View className={s.gap}>{subtitle}</View>
        )
      ) : null}
    </View>
  );
}
