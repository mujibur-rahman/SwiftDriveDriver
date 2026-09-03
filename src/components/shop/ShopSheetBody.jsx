// src/components/shop/ShopSheetBody.jsx
import { View, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import PlaceRow from '@/components/food/PlaceRow';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import Heading from '@/components/ui/Heading';
import StatusBanner from '@/components/ui/StatusBanner';
import PhotoSlot from '@/components/ui/PhotoSlot';
import AppTextInput from '@/components/ui/AppTextInput';
import ShopItemRow from '@/components/shop/ShopItemRow';

export default function ShopSheetBody({
    step,
    job,
    warningHex,
    successHex,
    primaryHex,
    isDark,
    etaDistance,
    etaDuration,
    total,
    routeLoading,
    // shopping
    items,
    runningTotal,
    budgetLimit,
    onFoundItem,
    onCantFindItem,
    // review (unresolved substitute approvals)
    pendingApprovalItems,
    // checkout
    receiptPhoto,
    takeReceiptPhoto,
    actualTotalInput,
    onChangeActualTotal,
    // delivery
    deliveryMethod,
    onSelectDeliveryMethod,
    deliveryPhoto,
    takeDeliveryPhoto,
    callPhone,
}) {
    const overBudget =
        actualTotalInput && budgetLimit ? parseFloat(actualTotalInput) > budgetLimit * 1.1 : false;

    switch (step) {
        case 'to_store':
            return (
                <>
                    <PlaceRow
                        icon="storefront-outline"
                        iconColor={primaryHex}
                        title={job.store}
                        subtitle={job.storeAddress}
                        badge={`#${job.orderNumber}`}
                    />
                    <StatRow
                        className="border border-border bg-card"
                        items={[
                            { label: 'Distance', value: etaDistance },
                            { label: 'Est. time', value: etaDuration },
                            { label: 'Budget', value: `$${budgetLimit.toFixed(2)}` },
                        ]}
                    />
                    {routeLoading && <Heading size="xs" align="center" subtitle="Updating route..." />}
                </>
            );

        case 'at_store':
            return (
                <>
                    <PlaceRow icon="storefront-outline" iconColor={primaryHex} title={job.store} subtitle={job.storeAddress} />
                    <View className="rounded-2xl border border-border bg-background-muted px-4 py-4 items-center gap-2">
                        <Icon name="cart-outline" size={28} color={primaryHex} />
                        <Text className="text-sm font-inter-medium text-foreground text-center">
                            {items.length} items to shop for
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            Budget: ${budgetLimit.toFixed(2)} — start shopping when you're ready
                        </Text>
                    </View>
                </>
            );

        case 'shopping':
            return (
                <>
                    <View className="flex-row items-center justify-between rounded-xl bg-background-muted px-3.5 py-2.5">
                        <Text className="text-xs font-inter text-foreground-muted">Running total</Text>
                        <Text
                            className="text-sm font-inter-bold"
                            style={{ color: runningTotal > budgetLimit ? warningHex : undefined }}
                        >
                            ${runningTotal.toFixed(2)} / ${budgetLimit.toFixed(2)}
                        </Text>
                    </View>
                    <View className="gap-2">
                        {items.map((item) => (
                            <ShopItemRow key={item.id} item={item} onFound={onFoundItem} onCantFind={onCantFindItem} />
                        ))}
                    </View>
                </>
            );

        case 'review':
            return (
                <>
                    <StatusBanner
                        variant="warning"
                        title="Waiting on the customer"
                        message={`${pendingApprovalItems.length} substitute${pendingApprovalItems.length > 1 ? 's' : ''} still need approval before checkout.`}
                    />
                    <View className="gap-2">
                        {pendingApprovalItems.map((item) => (
                            <ShopItemRow key={item.id} item={item} onFound={onFoundItem} onCantFind={onCantFindItem} />
                        ))}
                    </View>
                    <Text className="text-xs font-inter text-foreground-muted text-center">
                        You can skip an item instead of waiting if you're ready to move on.
                    </Text>
                </>
            );

        case 'checkout':
            return (
                <>
                    <View className="rounded-2xl bg-background-muted px-4 py-5 items-center">
                        <Text className="text-xs font-inter text-foreground-muted mb-1">Estimated total</Text>
                        <Text className="text-3xl font-inter-bold text-foreground">${runningTotal.toFixed(2)}</Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-1">Budget ${budgetLimit.toFixed(2)}</Text>
                    </View>

                    <Heading size="xs" subtitle="Receipt photo" subtitleClassName="font-inter-semibold uppercase tracking-wider" />
                    <PhotoSlot label="Take photo of receipt" uri={receiptPhoto} onPress={takeReceiptPhoto} accentHex={successHex} isDark={isDark} />

                    <AppTextInput
                        label="Actual total (from receipt)"
                        placeholder={runningTotal.toFixed(2)}
                        value={actualTotalInput}
                        onChangeText={onChangeActualTotal}
                        keyboardType="decimal-pad"
                        leftIcon="receipt"
                    />

                    {overBudget && (
                        <StatusBanner
                            variant="error"
                            title="Over budget"
                            message="The actual total is more than 10% over the customer's budget. Continuing will flag this order for review."
                        />
                    )}
                </>
            );

        case 'to_customer':
            return (
                <>
                    <PlaceRow icon="account-outline" iconColor={successHex} title={job.customerName} subtitle={job.customerAddress} badge={`#${job.orderNumber}`} />
                    <StatRow
                        className="border border-border bg-card"
                        items={[
                            { label: 'Distance', value: etaDistance },
                            { label: 'Est. time', value: etaDuration },
                            { label: 'You earn', value: `$${total.toFixed(2)}` },
                        ]}
                    />
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button variant="outline" size="sm" leftIcon="phone" onPress={() => callPhone(job.customerPhone, job.customerName)}>
                                Call
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button variant="outline" size="sm" leftIcon="message-text-outline" disabled>
                                Message
                            </Button>
                        </View>
                    </View>
                    {routeLoading && (
                        <Text className="text-xs font-inter text-foreground-muted text-center">Updating route…</Text>
                    )}
                </>
            );

        case 'at_customer':
            return (
                <>
                    <PlaceRow icon="account-outline" iconColor={successHex} title={job.customerName} subtitle={job.customerAddress} />

                    {job.deliveryInstructions && (
                        <StatusBanner variant="info" icon="information-outline" message={job.deliveryInstructions} />
                    )}

                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button
                                variant={deliveryMethod === 'hand_to_customer' ? 'success' : 'outline'}
                                size="sm"
                                leftIcon="hand-back-right-outline"
                                onPress={() => onSelectDeliveryMethod('hand_to_customer')}
                            >
                                Hand to customer
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button
                                variant={deliveryMethod === 'leave_at_door' ? 'success' : 'outline'}
                                size="sm"
                                leftIcon="door"
                                onPress={() => onSelectDeliveryMethod('leave_at_door')}
                            >
                                Leave at door
                            </Button>
                        </View>
                    </View>

                    <Heading size="xs" subtitle="Delivery photo" subtitleClassName="font-inter-semibold uppercase tracking-wider" />
                    <PhotoSlot
                        label={deliveryMethod === 'leave_at_door' ? 'Photo of bags at the door' : 'Photo of hand-off'}
                        uri={deliveryPhoto}
                        onPress={takeDeliveryPhoto}
                        accentHex={successHex}
                        isDark={isDark}
                    />
                </>
            );

        default:
            return null;
    }
}
