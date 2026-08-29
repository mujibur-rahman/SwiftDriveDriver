// src/screens/main/food/components/PlaceRow.jsx
import { View, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Badge from '@/components/ui/Badge';

export default function PlaceRow({ icon, iconColor, title, subtitle, badge }) {
    return (
        <View className="flex-row items-start gap-3 rounded-2xl border border-border bg-background-muted px-4 py-3">
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${iconColor}20`,
                    borderWidth: 1,
                    borderColor: `${iconColor}40`,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon name={icon} size={20} color={iconColor} />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                    <Text
                        className="text-base font-inter-semibold text-foreground"
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    {badge ? (
                        <Badge label={badge} variant="muted" size="sm" />
                    ) : null}
                </View>
                <Text
                    className="text-xs font-inter text-foreground-muted mt-0.5"
                    numberOfLines={2}
                >
                    {subtitle}
                </Text>
            </View>
        </View>
    );
}