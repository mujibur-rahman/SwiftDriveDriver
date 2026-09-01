// src/components/marketplace/MarketplaceMapPanel.jsx
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { DEMO } from '@/screens/main/marketplace/marketplaceDemo';
// Reused as-is — same generic marker/chip/FAB shapes as gig & parcel.
import { gigStyles as styles } from '@/screens/main/gig/gigStyles';
import IconButton from '@/components/ui/IconButton';

export default function MarketplaceMapPanel({
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
    job,
    isPickupLeg,
}) {
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();
    const j = job || DEMO;

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const successHex = colors?.success ?? (isDark ? '#34D399' : '#16A34A');
    const cardBg = isDark ? 'rgba(13,30,50,0.92)' : 'rgba(255,255,255,0.95)';
    const textColor = colors?.foreground ?? (isDark ? '#F0F9FF' : '#0F172A');

    const handleBack = () => {
        if (onBack) onBack();
        else navigation.goBack();
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
                    ...(routeTarget ?? j.sellerCoords),
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
            >
                {routeCoords?.length > 0 ? (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor={stepMeta?.color || primaryHex}
                        strokeWidth={4}
                    />
                ) : null}

                <Marker coordinate={j.sellerCoords} title={j.seller}>
                    <View
                        style={[
                            styles.markerCircle,
                            { backgroundColor: `${warningHex}28`, borderColor: warningHex },
                        ]}
                    >
                        <Icon name="tag-outline" size={20} color={warningHex} />
                    </View>
                </Marker>

                <Marker coordinate={j.buyerCoords} title={j.buyerName}>
                    <View
                        style={[
                            styles.markerCircle,
                            { backgroundColor: `${successHex}28`, borderColor: successHex },
                        ]}
                    >
                        <Icon name="account-outline" size={20} color={successHex} />
                    </View>
                </Marker>

                <Marker coordinate={driverCoords} anchor={{ x: 0.5, y: 0.5 }}>
                    <View
                        style={[styles.driverDot, { backgroundColor: primaryHex, borderColor: '#fff' }]}
                    />
                </Marker>
            </MapView>

            <View style={[styles.backBtn, { top: insets.top + 12, backgroundColor: cardBg }]}>
                <IconButton
                    icon="arrow-left"
                    size={42}
                    iconSize={20}
                    variant="ghost"
                    onPress={handleBack}
                />
            </View>

            {isNavigating && (
                <View style={[styles.etaChip, { top: insets.top + 12, backgroundColor: cardBg }]}>
                    <View>
                        <Text style={[styles.etaTime, { color: textColor }]}>
                            {routeLoading ? '…' : etaDuration}
                        </Text>
                        <Text style={styles.etaLabel}>ETA</Text>
                    </View>
                </View>
            )}

            {isNavigating && routeTarget && (
                <View style={[styles.navFab, { bottom: 320, backgroundColor: stepMeta?.color || primaryHex }]}>
                    <IconButton
                        icon="navigation-variant"
                        size={52}
                        iconSize={24}
                        variant="ghost"
                        color="#fff"
                        onPress={onOpenMaps}
                    />
                </View>
            )}
        </>
    );
}
