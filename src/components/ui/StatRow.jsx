// src/components/ui/StatRow.jsx
import React from "react";
import { View, Text } from "react-native";

/**
 * Horizontal stats / metrics row with optional dividers
 *
 * Props:
 * - items: Array<{
 *     label: string;
 *     value: string | number | React.ReactNode;
 *     key?: string;
 *   }>
 * - showDividers?: boolean     // default true
 * - className?: string         // outer container
 * - itemClassName?: string
 * - valueClassName?: string
 * - labelClassName?: string
 * - dividerClassName?: string
 */
export default function StatRow({
    items = [],
    showDividers = true,
    className = "",
    itemClassName = "",
    valueClassName = "",
    labelClassName = "",
    dividerClassName = "",
}) {
    if (!items.length) return null;

    return (
        <View
            className={`flex-row items-center rounded-xl bg-background-muted p-3.5 ${className}`}
        >
            {items.map((item, index) => (
                <React.Fragment key={item.key ?? item.label ?? String(index)}>
                    {showDividers && index > 0 ? (
                        <View
                            className={`mx-1 h-8 w-px bg-border ${dividerClassName}`}
                        />
                    ) : null}

                    <View className={`flex-1 items-center gap-1 ${itemClassName}`}>
                        {typeof item.value === "string" || typeof item.value === "number" ? (
                            <Text
                                className={`text-base font-inter-bold text-foreground ${valueClassName}`}
                                numberOfLines={1}
                            >
                                {item.value}
                            </Text>
                        ) : (
                            item.value
                        )}

                        {item.label ? (
                            <Text
                                className={`text-[11px] font-inter text-foreground-muted ${labelClassName}`}
                                numberOfLines={1}
                            >
                                {item.label}
                            </Text>
                        ) : null}
                    </View>
                </React.Fragment>
            ))}
        </View>
    );
}

// Profile-style stats
{/* <StatRow
  className="mx-5 mt-5 border border-border bg-card py-4"
  items={[
    { label: "Trips", value: 128 },
    { label: "Rating", value: "4.92" },
    { label: "Accept", value: "98%" },
  ]}
/> */}

// No dividers + custom text size
{/* <StatRow
  showDividers={false}
  valueClassName="text-xl"
  items={[
    { label: "Today", value: "$42.50" },
    { label: "Week", value: "$310" },
  ]}
/> */}