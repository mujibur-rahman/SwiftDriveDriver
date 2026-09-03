// src/components/shop/ShopItemRow.jsx
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';

/**
 * One row in the "Shop for me" checklist. Fully driven by `item.status` —
 * the shopping screen never branches on step, it just renders
 * items.map(item => <ShopItemRow item={item} .../>), so any number of
 * items (dynamic list, not a fixed count) works without changes here.
 *
 * item shape: { id, name, qty, unit, price, note, status, actualPrice, substitutedWith }
 * status: pending | found | unavailable | pending_approval | substituted | skipped
 *
 * Props:
 * - item
 * - onFound(item)        // mark found at listed price
 * - onCantFind(item)      // opens SubstituteRequestModal for this item
 * - disabled?: boolean
 */
export default function ShopItemRow({ item, onFound, onCantFind, disabled = false }) {
    const { colors, isDark } = useTheme();
    const successHex = colors?.success ?? (isDark ? '#34D399' : '#16A34A');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const mutedHex = colors?.foregroundMuted ?? (isDark ? '#7DD3FC' : '#64748B');
    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');

    const qtyLabel = item.unit ? `${item.qty} × ${item.unit}` : `Qty ${item.qty}`;
    const lineTotal = (Number(item.actualPrice ?? item.price) || 0) * (item.qty || 1);

    // ── Resolved states — compact single-line rows ────────────────────
    if (item.status === 'found') {
        return (
            <View className="flex-row items-center gap-2.5 rounded-xl border border-success/30 bg-success/10 px-3 py-2.5">
                <Icon name="check-circle" size={18} color={successHex} />
                <View className="flex-1">
                    <Text className="text-sm font-inter-semibold text-foreground" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text className="text-xs font-inter text-foreground-muted" numberOfLines={1}>
                        {qtyLabel} · Found
                    </Text>
                </View>
                <Text className="text-sm font-inter-bold text-foreground">${lineTotal.toFixed(2)}</Text>
            </View>
        );
    }

    if (item.status === 'pending_approval') {
        return (
            <View className="flex-row items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5">
                <ActivityIndicator size="small" color={warningHex} />
                <View className="flex-1">
                    <Text className="text-sm font-inter-semibold text-foreground" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text className="text-xs font-inter text-warning" numberOfLines={2}>
                        Suggested {item.substitutedWith?.name} (${Number(item.substitutedWith?.price || 0).toFixed(2)}) — waiting on customer
                    </Text>
                </View>
            </View>
        );
    }

    if (item.status === 'substituted') {
        return (
            <View className="flex-row items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5">
                <Icon name="swap-horizontal-circle" size={18} color={primaryHex} />
                <View className="flex-1">
                    <Text className="text-sm font-inter-semibold text-foreground" numberOfLines={1}>
                        {item.substitutedWith?.name || item.name}
                    </Text>
                    <Text className="text-xs font-inter text-foreground-muted" numberOfLines={1}>
                        Approved substitute for {item.name}
                    </Text>
                </View>
                <Text className="text-sm font-inter-bold text-foreground">${lineTotal.toFixed(2)}</Text>
            </View>
        );
    }

    if (item.status === 'skipped') {
        return (
            <View className="flex-row items-center gap-2.5 rounded-xl border border-border bg-background-muted px-3 py-2.5 opacity-60">
                <Icon name="close-circle-outline" size={18} color={mutedHex} />
                <View className="flex-1">
                    <Text
                        className="text-sm font-inter-medium text-foreground-muted"
                        style={{ textDecorationLine: 'line-through' }}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <Text className="text-xs font-inter text-foreground-muted">Skipped — will be refunded</Text>
                </View>
            </View>
        );
    }

    // ── Default: pending — the only state with action buttons ─────────
    return (
        <View className="gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
            <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                    <Text className="text-sm font-inter-semibold text-foreground" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text className="text-xs font-inter text-foreground-muted mt-0.5" numberOfLines={2}>
                        {qtyLabel}
                        {item.note ? ` · ${item.note}` : ''}
                    </Text>
                </View>
                <Text className="text-sm font-inter-semibold text-foreground-muted">
                    ~${(item.price * (item.qty || 1)).toFixed(2)}
                </Text>
            </View>
            <View className="flex-row gap-2">
                <TouchableOpacity
                    onPress={() => !disabled && onFound?.(item)}
                    disabled={disabled}
                    activeOpacity={0.75}
                    className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-success/40 bg-success/10 py-2"
                >
                    <Icon name="check" size={15} color={successHex} />
                    <Text className="text-xs font-inter-semibold text-success">Found it</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => !disabled && onCantFind?.(item)}
                    disabled={disabled}
                    activeOpacity={0.75}
                    className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 py-2"
                >
                    <Icon name="alert-circle-outline" size={15} color={warningHex} />
                    <Text className="text-xs font-inter-semibold text-warning">Can't find it</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
