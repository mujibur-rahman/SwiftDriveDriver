// src/components/parcel/ParcelSheetBody.jsx
import { View, Text, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DEMO } from '@/screens/main/parcel/parcelDemo';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
// Reused directly — PlaceRow takes icon/title/subtitle/badge props only,
// nothing food-specific about it.
import PlaceRow from '@/components/food/PlaceRow';
import ParcelScanner from '@/components/parcel/ParcelScanner';
import SignaturePad from '@/components/parcel/SignaturePad';

export default function ParcelSheetBody({
    step,
    setStep,
    primaryHex,
    warningHex,
    successHex,
    colors,
    isDark,
    etaDistance,
    etaDuration,
    total,
    routeLoading,
    scannedIds,
    onScanParcel,
    signatureRef,
    onSignatureChange,
    neighborPhoto,
    takeNeighborPhoto,
    neighborNote,
    setNeighborNote,
    callPhone,
}) {
    switch (step) {
        case 'to_pickup':
            return (
                <>
                    <PlaceRow
                        icon="package-variant-closed"
                        iconColor={primaryHex}
                        title={DEMO.sender}
                        subtitle={DEMO.senderAddress}
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

        case 'at_pickup':
            return (
                <>
                    <PlaceRow
                        icon="package-variant-closed"
                        iconColor={warningHex}
                        title={DEMO.sender}
                        subtitle={DEMO.senderAddress}
                        badge={`#${DEMO.orderNumber}`}
                    />
                    <View className="rounded-2xl border border-border bg-background-muted px-4 py-4 items-center gap-2">
                        <Icon name="barcode-scan" size={28} color={warningHex} />
                        <Text className="text-sm font-inter-medium text-foreground text-center">
                            {DEMO.parcels.length} parcel
                            {DEMO.parcels.length !== 1 ? 's' : ''} to scan
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            Scan each barcode before leaving the pickup point
                        </Text>
                    </View>
                </>
            );

        case 'scanning':
            return (
                <>
                    <PlaceRow
                        icon="barcode-scan"
                        iconColor={warningHex}
                        title={`Scan ${DEMO.parcels.length} parcel${DEMO.parcels.length !== 1 ? 's' : ''}`}
                        subtitle={`${scannedIds.length} of ${DEMO.parcels.length} scanned`}
                    />
                    <ParcelScanner
                        parcels={DEMO.parcels}
                        scannedIds={scannedIds}
                        onScan={onScanParcel}
                    />
                </>
            );

        case 'to_dropoff':
            return (
                <>
                    <PlaceRow
                        icon="account-outline"
                        iconColor={successHex}
                        title={DEMO.recipientName}
                        subtitle={DEMO.recipientAddress}
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
                                    callPhone(DEMO.recipientPhone, DEMO.recipientName)
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

        case 'at_dropoff':
            return (
                <>
                    <PlaceRow
                        icon="map-marker-outline"
                        iconColor={successHex}
                        title={DEMO.recipientName}
                        subtitle={DEMO.recipientAddress}
                    />
                    <Text className="text-[11px] font-inter-semibold text-foreground-muted uppercase tracking-wider mb-2">
                        Delivery method
                    </Text>
                    <View className="gap-2.5">
                        <Button
                            variant="success"
                            leftIcon="draw-pen"
                            onPress={() => setStep('signature_capture')}
                        >
                            Get Signature
                        </Button>
                        <Button
                            variant="outline"
                            leftIcon="home-group"
                            onPress={() => setStep('leave_with_neighbor')}
                        >
                            Leave with Neighbor
                        </Button>
                    </View>
                </>
            );

        case 'signature_capture':
            return (
                <>
                    <PlaceRow
                        icon="draw-pen"
                        iconColor={successHex}
                        title={DEMO.recipientName}
                        subtitle="Ask the recipient to sign below"
                    />
                    <Text className="text-xs font-inter text-foreground-muted mb-1">
                        Recipient signature
                    </Text>
                    <SignaturePad
                        ref={signatureRef}
                        height={150}
                        strokeColor={isDark ? '#F0F9FF' : '#0F172A'}
                        backgroundColor={isDark ? '#0D1E32' : '#F8FAFC'}
                        onChange={onSignatureChange}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            signatureRef.current?.clear();
                            onSignatureChange(false);
                        }}
                        className="self-end"
                    >
                        <Text className="text-xs font-inter-semibold text-primary">
                            Clear
                        </Text>
                    </TouchableOpacity>
                </>
            );

        case 'leave_with_neighbor':
            return (
                <>
                    <PlaceRow
                        icon="home-group"
                        iconColor={successHex}
                        title="Leave with neighbor"
                        subtitle={DEMO.recipientAddress}
                    />
                    {neighborPhoto ? (
                        <View className="rounded-2xl overflow-hidden border border-border">
                            <Image
                                source={{ uri: neighborPhoto }}
                                style={{ width: '100%', height: 160 }}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                onPress={takeNeighborPhoto}
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
                            onPress={takeNeighborPhoto}
                            activeOpacity={0.8}
                            className="rounded-2xl border border-dashed border-border bg-background-muted py-10 items-center gap-2"
                        >
                            <Icon name="camera-outline" size={32} color={primaryHex} />
                            <Text className="text-sm font-inter-semibold text-foreground">
                                Take a photo of the parcel
                            </Text>
                            <Text className="text-xs font-inter text-foreground-muted">
                                Required proof of drop-off
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TextInput
                        placeholder="Neighbor's name or unit number (optional)"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={neighborNote}
                        onChangeText={setNeighborNote}
                        className="rounded-xl border border-border bg-background-muted px-3.5 py-2.5 text-sm font-inter text-foreground"
                    />
                </>
            );

        default:
            return null;
    }
}
