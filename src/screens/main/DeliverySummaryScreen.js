// src/screens/main/DeliverySummaryScreen.js
//
// Shared "delivery complete" screen for every on-demand delivery flow
// (food, parcel, and any future ones — gig, etc.). Previously lived at
// src/screens/main/food/FoodDeliverySummaryScreen.js under a food-specific
// name even though nothing in it was food-specific. Moved to a common
// location and renamed so the intent is honest: one summary screen, one
// route ("DeliverySummary"), reused by every delivery type.
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useGetEarningsQuery } from '@/features/earnings/earningsApi';
import Button from '@/components/ui/Button';

export default function DeliverySummaryScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const successHex = isDark ? '#34D399' : '#16A34A';

    const summary = route.params?.summary ?? {
        orderNumber: '—',
        baseFare: 0,
        tip: 0,
        bonus: 0,
        total: 0,
    };

    const { data: earnings } = useGetEarningsQuery(
        { period: 'today' },
        { refetchOnMountOrArgChange: false },
    );
    const todayTotal = earnings?.summary?.totalBalance;

    const rows = [
        { label: 'Base fare', value: summary.baseFare },
        { label: 'Tip', value: summary.tip },
        { label: 'Bonus', value: summary.bonus },
    ].filter((r) => r.value != null && r.value !== 0);

    return (
        <View
            className="flex-1 bg-background"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
        >
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                <View className="items-center py-6">
                    <View
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            backgroundColor: `${successHex}22`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12,
                        }}
                    >
                        <Icon name="check-circle" size={40} color={successHex} />
                    </View>
                    <Text className="text-xl font-inter-bold text-foreground">
                        Delivery complete
                    </Text>
                    <Text className="text-xs font-inter text-foreground-muted mt-1">
                        #{summary.orderNumber}
                    </Text>
                </View>

                <View className="rounded-2xl border border-border bg-card px-4 py-4 gap-3">
                    <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                        Earnings summary
                    </Text>
                    {rows.map((r) => (
                        <View key={r.label} className="flex-row justify-between">
                            <Text className="text-sm font-inter text-foreground-muted">
                                {r.label}
                            </Text>
                            <Text className="text-sm font-inter-semibold text-foreground">
                                ${Number(r.value).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                    <View className="h-px bg-border" />
                    <View className="flex-row justify-between">
                        <Text className="text-base font-inter-bold text-foreground">
                            Total
                        </Text>
                        <Text
                            className="text-base font-inter-bold"
                            style={{ color: successHex }}
                        >
                            ${Number(summary.total).toFixed(2)}
                        </Text>
                    </View>
                </View>

                {todayTotal != null && (
                    <Text className="text-center text-xs font-inter text-foreground-muted mt-4">
                        Today’s earnings: ${Number(todayTotal).toFixed(2)}
                    </Text>
                )}
            </ScrollView>

            <View className="px-5 gap-2">
                <Button
                    variant="primary"
                    leftIcon="wifi"
                    onPress={() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
                        });
                    }}
                >
                    Go Online again
                </Button>
                <Button
                    variant="outline"
                    leftIcon="cash"
                    onPress={() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Tabs', params: { screen: 'Earnings' } }],
                        });
                    }}
                >
                    View all earnings
                </Button>
            </View>
        </View>
    );
}