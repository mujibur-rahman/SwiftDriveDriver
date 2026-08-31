// src/components/parcel/ParcelMapPanel.jsx
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { DEMO } from '@/screens/main/parcel/parcelDemo';
// Reused as-is — this stylesheet has nothing food-specific in it, it's
// generic map/sheet chrome (marker sizes, ETA chip, bottom sheet shell).
import { foodStyles as styles } from '@/screens/main/food/foodStyles';
import IconButton from '@/components/ui/IconButton';

export default function ParcelMapPanel({
    mapRef,
    routeCoords,
    routeTarget,
    driverCoords,
    stepMeta,
    isNavigating,
    etaDuration,
    routeLoading,
    insets,
    onBack,
    onOpenMaps,
}) {
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();

    const primaryHex = colors.primary;
    const warningHex = colors.warning;
    const successHex = colors.success;
    const cardBg = isDark ? 'rgba(13,30,50,0.92)' : 'rgba(255,255,255,0.95)';
    const textColor = colors.foreground;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

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

            <IconButton
                icon="arrow-left"
                onPress={handleBack}
                iconSize={22}
                variant="muted"
                className='absolute left-4 z-10'
                style={{ top: insets.top + 12 }}
            />

            {isNavigating && (
                <View
                    style={[
                        styles.etaChip,
                        {
                            top: insets.top + 12,
                            backgroundColor: cardBg,
                        },
                    ]}
                >
                    <Icon name="clock-outline" size={14} color={primaryHex} />
                    <View style={{ marginLeft: 6 }}>
                        <Text style={[styles.etaTime, { color: textColor }]}>
                            {etaDuration}
                        </Text>
                        <Text style={styles.etaLabel}>{routeLoading ? '…' : 'ETA'}</Text>
                    </View>
                </View>
            )}

            {isNavigating && routeTarget && (
                <IconButton
                    icon="navigation-variant"
                    onPress={onOpenMaps}
                    iconSize={24}
                    color="#fff"
                    activeOpacity={0.85}
                    style={[
                        styles.navFab,
                        {
                            bottom: 300 + insets.bottom,
                            backgroundColor: stepMeta.color,
                            width: 52,
                            height: 52,
                            borderRadius: 26,
                        },
                    ]}
                />
            )}
        </>
    );
}
