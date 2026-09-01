// src/components/marketplace/MarketplaceSheetBody.jsx
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DEMO } from '@/screens/main/marketplace/marketplaceDemo';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
// Reused directly — generic sender/recipient-style row, no delivery-type
// specific content in it.
import PlaceRow from '@/components/food/PlaceRow';

/**
 * Compact photo slot — same visual language as gig's PhotoSlot (dashed
 * border until filled, solid + colored border once a photo exists) but
 * kept local here since only two screens need it right now. Promote to
 * components/ui/PhotoSlot.jsx if a third flow needs the same shape.
 */
function PhotoSlot({ label, uri, onPress, accentHex, isDark, locked }) {
    return (
        <TouchableOpacity
            onPress={locked ? undefined : onPress}
            activeOpacity={locked ? 1 : 0.8}
            style={{
                height: 140,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: uri ? accentHex : (isDark ? '#1E3A5F' : '#E2E8F0'),
                borderStyle: uri ? 'solid' : 'dashed',
                backgroundColor: isDark ? '#0A1628' : '#E8EEF5',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                opacity: locked && !uri ? 0.6 : 1,
            }}
        >
            {uri ? (
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
                <>
                    <Icon name="camera-outline" size={26} color={isDark ? '#7DD3FC' : '#64748B'} />
                    <Text style={{ color: isDark ? '#7DD3FC' : '#64748B', fontSize: 11, marginTop: 4 }}>
                        {label}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

export default function MarketplaceSheetBody({
    step,
    primaryHex,
    warningHex,
    successHex,
    isDark,
    etaDistance,
    etaDuration,
    total,
    routeLoading,
    itemPhoto,
    takeItemPhoto,
    handoffPhoto,
    takeHandoffPhoto,
    paymentCollected,
    onTogglePaymentCollected,
    callPhone,
}) {
    switch (step) {
        case 'to_pickup':
            return (
                <>
                    <PlaceRow
                        icon="tag-outline"
                        iconColor={warningHex}
                        title={DEMO.seller}
                        subtitle={DEMO.sellerAddress}
                        badge={`#${DEMO.orderNumber}`}
                    />
                    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-background-muted px-3 py-2.5">
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 10,
                                overflow: 'hidden',
                                backgroundColor: isDark ? '#0A1628' : '#E8EEF5',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {DEMO.itemPhotoUri ? (
                                <Image source={{ uri: DEMO.itemPhotoUri }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Icon name="image-outline" size={20} color={isDark ? '#7DD3FC' : '#64748B'} />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-inter-semibold text-foreground" numberOfLines={1}>
                                {DEMO.itemTitle}
                            </Text>
                            <Text className="text-xs font-inter text-foreground-muted" numberOfLines={1}>
                                {DEMO.listingSource} · ${DEMO.itemPrice.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <StatRow
                        className="border border-border bg-card"
                        items={[
                            { label: 'Distance', value: etaDistance },
                            { label: 'Est. Time', value: etaDuration },
                            { label: 'You earn', value: `$${total.toFixed(2)}` },
                        ]}
                    />
                    {routeLoading && (
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            Updating route…
                        </Text>
                    )}
                </>
            );

        case 'at_pickup':
            return (
                <>
                    <PlaceRow
                        icon="tag-outline"
                        iconColor={warningHex}
                        title={DEMO.seller}
                        subtitle={DEMO.sellerAddress}
                    />
                    <View className="rounded-2xl border border-border bg-background-muted px-4 py-4 items-center gap-2">
                        <Icon name="camera-marker-outline" size={28} color={warningHex} />
                        <Text className="text-sm font-inter-medium text-foreground text-center">
                            Verify the item before you leave
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            Compare it against the listing photo and take your own
                        </Text>
                    </View>
                </>
            );

        case 'verify_item':
            return (
                <>
                    <PlaceRow
                        icon="tag-outline"
                        iconColor={warningHex}
                        title={DEMO.itemTitle}
                        subtitle={`Listed by ${DEMO.seller} on ${DEMO.listingSource}`}
                    />
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-[10px] font-inter-semibold text-foreground-muted uppercase tracking-wider mb-1">
                                Listing photo
                            </Text>
                            <View
                                style={{
                                    height: 100,
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    backgroundColor: isDark ? '#0A1628' : '#E8EEF5',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {DEMO.itemPhotoUri ? (
                                    <Image source={{ uri: DEMO.itemPhotoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                ) : (
                                    <Icon name="image-outline" size={22} color={isDark ? '#7DD3FC' : '#64748B'} />
                                )}
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-inter-semibold text-foreground-muted uppercase tracking-wider mb-1">
                                তোমার তোলা ছবি
                            </Text>
                            <PhotoSlot
                                label="Take photo"
                                uri={itemPhoto}
                                onPress={takeItemPhoto}
                                accentHex={successHex}
                                isDark={isDark}
                            />
                        </View>
                    </View>
                    <View className="flex-row items-start gap-2">
                        <Icon name="information-outline" size={14} color={isDark ? '#7DD3FC' : '#64748B'} />
                        <Text className="flex-1 text-xs font-inter text-foreground-muted">
                            Item-টা listing-এর সাথে মিলছে কিনা নিশ্চিত করে তারপর ছবি তোলো — ভবিষ্যতে dispute হলে এই ছবিই প্রমাণ।
                        </Text>
                    </View>
                </>
            );

        case 'to_dropoff':
            return (
                <>
                    <PlaceRow
                        icon="account-outline"
                        iconColor={successHex}
                        title={DEMO.buyerName}
                        subtitle={DEMO.buyerAddress}
                        badge={`#${DEMO.orderNumber}`}
                    />
                    <StatRow
                        className="border border-border bg-card"
                        items={[
                            { label: 'Distance', value: etaDistance },
                            { label: 'Est. Time', value: etaDuration },
                            { label: 'You earn', value: `$${total.toFixed(2)}` },
                        ]}
                    />
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon="phone"
                                onPress={() => callPhone(DEMO.buyerPhone, DEMO.buyerName)}
                            >
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
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            Updating route…
                        </Text>
                    )}
                </>
            );

        case 'at_dropoff':
            return (
                <>
                    <PlaceRow
                        icon="account-outline"
                        iconColor={successHex}
                        title={DEMO.buyerName}
                        subtitle={DEMO.buyerAddress}
                    />
                    {DEMO.paymentMode === 'prepaid' ? (
                        <View className="rounded-2xl border border-border bg-background-muted px-4 py-3 flex-row items-center gap-2.5">
                            <Icon name="check-decagram-outline" size={20} color={successHex} />
                            <Text className="flex-1 text-sm font-inter text-foreground">
                                Already paid online — just hand off the item
                            </Text>
                        </View>
                    ) : (
                        <View className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 flex-row items-center gap-2.5">
                            <Icon name="cash-multiple" size={20} color={warningHex} />
                            <Text className="flex-1 text-sm font-inter text-foreground">
                                Collect ${DEMO.itemPrice.toFixed(2)} from the buyer before handing over
                            </Text>
                        </View>
                    )}
                </>
            );

        case 'collect_payment':
            return (
                <>
                    <PlaceRow
                        icon="account-outline"
                        iconColor={successHex}
                        title={DEMO.buyerName}
                        subtitle={DEMO.buyerAddress}
                    />
                    <View className="rounded-2xl bg-background-muted px-4 py-5 items-center">
                        <Text className="text-xs font-inter text-foreground-muted mb-1">
                            Collect from buyer
                        </Text>
                        <Text className="text-4xl font-inter-bold text-foreground">
                            ${DEMO.itemPrice.toFixed(2)}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted mt-1">
                            {DEMO.paymentMode === 'cod_card' ? 'card' : 'cash'}
                        </Text>
                    </View>
                    <Button
                        variant={paymentCollected ? 'success' : 'primary'}
                        leftIcon={paymentCollected ? 'check-circle' : 'cash'}
                        onPress={onTogglePaymentCollected}
                    >
                        {paymentCollected ? 'Payment collected' : 'Mark payment collected'}
                    </Button>
                    <Text className="text-[10px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                        Hand-off photo
                    </Text>
                    <PhotoSlot
                        label="Photo of item with buyer"
                        uri={handoffPhoto}
                        onPress={takeHandoffPhoto}
                        accentHex={successHex}
                        isDark={isDark}
                    />
                </>
            );

        case 'confirm_delivery':
            return (
                <>
                    <PlaceRow
                        icon="account-outline"
                        iconColor={successHex}
                        title={DEMO.buyerName}
                        subtitle={DEMO.buyerAddress}
                    />
                    <Text className="text-[10px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                        Hand-off photo
                    </Text>
                    <PhotoSlot
                        label="Photo of item with buyer"
                        uri={handoffPhoto}
                        onPress={takeHandoffPhoto}
                        accentHex={successHex}
                        isDark={isDark}
                    />
                </>
            );

        default:
            return null;
    }
}
