// src/components/ui/IncomingRequestRow.jsx
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

/**
 * One tappable row inside the "Incoming Requests" card on Home.
 * Compact, consistent height, colored icon badge on the left, key price/
 * distance info on the right, chevron to signal it opens something.
 *
 * Props:
 * - icon, iconColor: MaterialCommunityIcons name + hex color for the badge
 * - title, subtitle: e.g. "Ride Request", "2.1 km · Surry Hills"
 * - meta?: short right-aligned value, e.g. "$8.40"
 * - onPress: () => void
 */
export default function IncomingRequestRow({
    icon,
    iconColor,
    title,
    subtitle,
    meta,
    onPress,
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center gap-3 px-4 py-3.5"
        >
            <View
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: `${iconColor}1F`,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon name={icon} size={21} color={iconColor} />
            </View>

            <View className="flex-1">
                <Text
                    className="text-sm font-inter-semibold text-foreground"
                    numberOfLines={1}
                >
                    {title}
                </Text>
                <Text
                    className="text-xs font-inter text-foreground-muted mt-0.5"
                    numberOfLines={1}
                >
                    {subtitle}
                </Text>
            </View>

            {meta ? (
                <Text className="text-sm font-inter-bold text-foreground mr-1">
                    {meta}
                </Text>
            ) : null}

            <Icon name="chevron-right" size={20} color={iconColor} />
        </TouchableOpacity>
    );
}

// Example:

{/* <View className="rounded-xl border border-border bg-card">
  <IncomingRequestRow
    icon="car-pickup"
    iconColor="#2563EB" // blue
    title="Ride Request"
    subtitle="2.1 km · Surry Hills"
    meta="$8.40"
    onPress={() => console.log('accepted')}
  />
</View> */}

{/* <View className="rounded-xl border border-border bg-card">
  <IncomingRequestRow
    icon="package"
    iconColor="#059669" // green
    title="Delivery Request"
    subtitle="Express · 4.5 km · CBD"
    meta="$12.90"
    onPress={() => console.log('delivery accepted')}
  />
</View> */}