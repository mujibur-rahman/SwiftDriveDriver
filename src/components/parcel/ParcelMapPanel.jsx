// src/components/parcel/ParcelMapPanel.jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DEMO } from '@/screens/main/parcel/parcelDemo';
// Reused as-is — this stylesheet has nothing food-specific in it, it's
// generic map/sheet chrome (marker sizes, ETA chip, bottom sheet shell).
import { foodStyles as styles } from '@/screens/main/food/foodStyles';

export default function ParcelMapPanel({
    mapRef,
    routeCoords,
    routeTarget,
    driverCoords,
    stepMeta,
    primaryHex,
    warningHex,
    successHex,
    isDark,
    isNavigating,
    etaDuration,
    routeLoading,
    insets,
    onBack,
    onOpenMaps,
}) {
    return (
        <>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_DEFAULT}
                showsUserLocation
                showsMyLocationButton={false}
                initialRegion={{
                    ...(routeTarget ?? DEMO.senderCoords),
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
            >
                {routeCoords?.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor={stepMeta.color}
                        strokeWidth={4}
                    />
                )}

                <Marker coordinate={DEMO.senderCoords} title={DEMO.sender}>
                    <View
                        style={[
                            styles.markerCircle,
                            {
                                backgroundColor: `${warningHex}28`,
                                borderColor: warningHex,
                            },
                        ]}
                    >
                        <Icon name="package-variant-closed" size={20} color={warningHex} />
                    </View>
                </Marker>

                <Marker coordinate={DEMO.recipientCoords} title={DEMO.recipientName}>
                    <View
                        style={[
                            styles.markerCircle,
                            {
                                backgroundColor: `${successHex}28`,
                                borderColor: successHex,
                            },
                        ]}
                    >
                        <Icon name="account-outline" size={20} color={successHex} />
                    </View>
                </Marker>

                <Marker coordinate={driverCoords} anchor={{ x: 0.5, y: 0.5 }}>
                    <View
                        style={[
                            styles.driverDot,
                            { backgroundColor: primaryHex, borderColor: '#fff' },
                        ]}
                    />
                </Marker>
            </MapView>

            <View
                style={[
                    styles.backBtn,
                    {
                        top: insets.top + 12,
                        backgroundColor: isDark
                            ? 'rgba(30,30,40,0.92)'
                            : 'rgba(255,255,255,0.95)',
                    },
                ]}
            >
                <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="arrow-left" size={22} color={isDark ? '#fff' : '#111'} />
                </TouchableOpacity>
            </View>

            {isNavigating && (
                <View
                    style={[
                        styles.etaChip,
                        {
                            top: insets.top + 12,
                            backgroundColor: isDark
                                ? 'rgba(30,30,40,0.92)'
                                : 'rgba(255,255,255,0.95)',
                        },
                    ]}
                >
                    <Icon name="clock-outline" size={14} color={primaryHex} />
                    <View style={{ marginLeft: 6 }}>
                        <Text
                            style={[styles.etaTime, { color: isDark ? '#fff' : '#111' }]}
                        >
                            {etaDuration}
                        </Text>
                        <Text style={styles.etaLabel}>{routeLoading ? '…' : 'ETA'}</Text>
                    </View>
                </View>
            )}

            {isNavigating && routeTarget && (
                <TouchableOpacity
                    style={[
                        styles.navFab,
                        {
                            bottom: 300 + insets.bottom,
                            backgroundColor: stepMeta.color,
                        },
                    ]}
                    onPress={onOpenMaps}
                    activeOpacity={0.85}
                >
                    <Icon name="navigation-variant" size={24} color="#fff" />
                </TouchableOpacity>
            )}
        </>
    );
}
