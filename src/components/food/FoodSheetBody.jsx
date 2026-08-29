// src/screens/main/food/components/FoodSheetBody.jsx
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DEMO } from '@/screens/main/food/foodDemo';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import PlaceRow from '@/components/food/PlaceRow';

export default function FoodSheetBody({
    step,
    setStep,
    primaryHex,
    warningHex,
    successHex,
    colors,
    etaDistance,
    etaDuration,
    total,
    routeLoading,
    checkedItems,
    toggleItem,
    doorPhoto,
    takeDoorPhoto,
    callPhone,
}) {
    switch (step) {
        case 'to_restaurant':
            return (
                <>
                    <PlaceRow
                        icon="storefront-outline"
                        iconColor={primaryHex}
                        title={DEMO.restaurant}
                        subtitle={DEMO.restaurantAddress}
                        badge={`#${DEMO.orderNumber}`}
                    />
                    <StatRow
                        className="border border-border bg-card"
                        items={[
                            { label: 'Distance', value: etaDistance },
                            { label: 'Est. Time', value: etaDuration },
                            { label: 'Earnings', value: `$${total.toFixed(2)}` },
                        ]}
                    />
                    {routeLoading && (
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            Updating route…
                        </Text>
                    )}
                </>
            );

        case 'at_restaurant':
            return (
                <>
                    <PlaceRow
                        icon="storefront-outline"
                        iconColor={warningHex}
                        title={DEMO.restaurant}
                        subtitle={DEMO.restaurantAddress}
                        badge={`#${DEMO.orderNumber}`}
                    />
                    <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider mb-2">
                        Order ready?
                    </Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Button
                                variant="outline"
                                leftIcon="clock-outline"
                                onPress={() => setStep('waiting_order')}
                            >
                                Not ready
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button
                                variant="warning"
                                leftIcon="check"
                                onPress={() => setStep('confirm_items')}
                            >
                                Yes, ready
                            </Button>
                        </View>
                    </View>
                </>
            );

        case 'waiting_order':
            return (
                <>
                    <PlaceRow
                        icon="storefront-outline"
                        iconColor={warningHex}
                        title={DEMO.restaurant}
                        subtitle="Waiting for kitchen to finish"
                    />
                    <View className="rounded-2xl border border-border bg-background-muted px-4 py-4 items-center gap-2">
                        <Icon name="timer-sand" size={28} color={warningHex} />
                        <Text className="text-sm font-inter-medium text-foreground text-center">
                            Order is being prepared
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            Stay nearby. Call the restaurant if it takes too long.
                        </Text>
                    </View>
                    <Button
                        variant="outline"
                        leftIcon="phone"
                        onPress={() => callPhone(DEMO.restaurantPhone, DEMO.restaurant)}
                    >
                        Call Restaurant
                    </Button>
                </>
            );

        case 'confirm_items':
            return (
                <>
                    <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider">
                        Order Items · {DEMO.items.length}
                    </Text>
                    <View className="rounded-2xl border border-border bg-background-muted px-3 py-2 gap-1">
                        {DEMO.items.map((item) => {
                            const checked = !!checkedItems[item.id];
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => toggleItem(item.id)}
                                    activeOpacity={0.7}
                                    className="flex-row items-center gap-3 py-2.5 px-1"
                                >
                                    <View
                                        style={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: 8,
                                            borderWidth: 2,
                                            borderColor: checked
                                                ? successHex
                                                : colors?.border ?? '#1E3A5F',
                                            backgroundColor: checked
                                                ? `${successHex}30`
                                                : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {checked && (
                                            <Icon name="check" size={16} color={successHex} />
                                        )}
                                    </View>
                                    <Text
                                        className={`flex-1 text-sm font-inter ${checked
                                            ? 'text-foreground-muted line-through'
                                            : 'text-foreground'
                                            }`}
                                    >
                                        {item.qty}× {item.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            );

        case 'to_customer':
            return (
                <>
                    <PlaceRow
                        icon="account-outline"
                        iconColor={successHex}
                        title={DEMO.customerName}
                        subtitle={DEMO.customerAddress}
                        badge={`#${DEMO.orderNumber}`}
                    />
                    <StatRow
                        className="border border-border bg-card"
                        items={[
                            { label: 'Distance', value: etaDistance },
                            { label: 'Est. Time', value: etaDuration },
                            { label: 'Earnings', value: `$${total.toFixed(2)}` },
                        ]}
                    />
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon="phone"
                                onPress={() =>
                                    callPhone(DEMO.customerPhone, DEMO.customerName)
                                }
                            >
                                Call
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon="message-text-outline"
                                onPress={() =>
                                    Alert.alert('Message', 'In-app chat (stub)')
                                }
                            >
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

        case 'at_customer':
            return (
                <>
                    <PlaceRow
                        icon="map-marker-outline"
                        iconColor={successHex}
                        title={DEMO.customerName}
                        subtitle={DEMO.customerAddress}
                    />
                    <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider mb-2">
                        Delivery method
                    </Text>
                    <View className="gap-2.5">
                        <Button
                            variant="success"
                            leftIcon="handshake-outline"
                            onPress={() => setStep('hand_to_customer')}
                        >
                            Hand to Customer
                        </Button>
                        <Button
                            variant="outline"
                            leftIcon="door"
                            onPress={() => setStep('leave_at_door')}
                        >
                            Leave at Door
                        </Button>
                    </View>
                </>
            );

        case 'hand_to_customer':
            return (
                <>
                    <PlaceRow
                        icon="handshake-outline"
                        iconColor={successHex}
                        title={DEMO.customerName}
                        subtitle="Confirm you handed over the order"
                    />
                    <View className="rounded-2xl border border-border bg-background-muted px-4 py-4 items-center gap-2">
                        <Icon
                            name="account-check-outline"
                            size={32}
                            color={successHex}
                        />
                        <Text className="text-sm font-inter-medium text-foreground text-center">
                            Meet the customer and hand over the bag
                        </Text>
                    </View>
                </>
            );

        case 'leave_at_door':
            return (
                <>
                    <PlaceRow
                        icon="door"
                        iconColor={successHex}
                        title="Leave at door"
                        subtitle={DEMO.customerAddress}
                    />
                    {doorPhoto ? (
                        <View className="rounded-2xl overflow-hidden border border-border">
                            <Image
                                source={{ uri: doorPhoto }}
                                style={{ width: '100%', height: 160 }}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                onPress={takeDoorPhoto}
                                className="absolute bottom-2 right-2 rounded-full bg-card px-3 py-1.5 flex-row items-center gap-1"
                            >
                                <Icon name="camera-retake" size={14} color={primaryHex} />
                                <Text className="text-xs font-inter-semibold text-primary">
                                    Retake
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={takeDoorPhoto}
                            activeOpacity={0.8}
                            className="rounded-2xl border border-dashed border-border bg-background-muted py-10 items-center gap-2"
                        >
                            <Icon name="camera-outline" size={32} color={primaryHex} />
                            <Text className="text-sm font-inter-semibold text-foreground">
                                Take drop-off photo
                            </Text>
                            <Text className="text-xs font-inter text-foreground-muted">
                                Required for leave-at-door
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            );

        default:
            return null;
    }
}