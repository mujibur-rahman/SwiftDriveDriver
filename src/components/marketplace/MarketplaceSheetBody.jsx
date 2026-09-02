// src/components/marketplace/MarketplaceSheetBody.jsx
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DEMO } from '@/screens/main/marketplace/marketplaceDemo';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import PlaceRow from '@/components/food/PlaceRow';
import PhotoSlot from '@/components/ui/PhotoSlot';
import Heading from '@/components/ui/Heading';
import PickupVerificationBarcode from '@/components/marketplace/PickupVerificationBarcode';

export default function MarketplaceSheetBody({
    step,
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
    codeConfirmed,
    onToggleCodeConfirmed,
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
                        {/* <View
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
                        </View> */}
                        <PhotoSlot
                            uri={DEMO.itemPhotoUri}
                            mode='display'
                            height={44}
                            width={44}
                            rounded="lg"
                            showBorder={false}
                            resizeMode="cover"
                            emptyIcon="image-outline"
                            isDark={isDark}
                        />
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
                        <Heading size="xs" align='center' subtitle="Updating route..." />
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

        case 'verify_code':
            return (
                <>
                    <PlaceRow
                        icon="tag-outline"
                        iconColor={warningHex}
                        title={DEMO.seller}
                        subtitle="Show this code to the seller"
                    />
                    <PickupVerificationBarcode code={DEMO.pickupCode} />
                    <Button
                        variant={codeConfirmed ? 'success' : 'primary'}
                        leftIcon={codeConfirmed ? 'check-circle' : 'shield-check-outline'}
                        onPress={onToggleCodeConfirmed}
                    >
                        {codeConfirmed ? 'Seller confirmed the code' : 'Seller confirmed — mark verified'}
                    </Button>
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
                        <View className="flex-1 gap-1">
                            <Heading size="xs" subtitle="Listing photo" subtitleClassName='font-inter-semibold uppercase tracking-wider' />

                            {/* <View
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
                            </View> */}

                            <PhotoSlot
                                mode="display"
                                uri={DEMO.itemPhotoUri}
                                height={140}
                                rounded="lg"
                                resizeMode="cover"
                                emptyIcon="image-outline"
                            />
                        </View>
                        <View className="flex-1 gap-1">
                            <Heading size="xs" subtitle="Take photo" subtitleClassName='font-inter-semibold uppercase tracking-wider' />
                            <PhotoSlot
                                label="Take photo"
                                uri={itemPhoto}
                                onPress={takeItemPhoto}
                                accentHex={successHex}
                                isDark={isDark}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                    <View className="flex-row items-start gap-2">
                        <Icon name="information-outline" size={14} color={isDark ? '#7DD3FC' : '#64748B'} className='mt-1' />
                        <Heading size="xs" subtitle="Ensure the item matches the listing before taking the photo — this photo will serve as proof in case of future disputes." />
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
                    <Heading size="xs" subtitle="Hand-off photo" subtitleClassName='font-inter-semibold uppercase tracking-wider' />
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
                    <Heading size="xs" subtitle="Hand-off photo" subtitleClassName='font-inter-semibold uppercase tracking-wider' />
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
