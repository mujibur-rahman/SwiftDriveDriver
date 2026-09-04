// src/components/carInsurance/InsuranceInspectionMapPanel.jsx
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { DEMO_PRE_POLICY } from '@/screens/main/carInsurance/carInsuranceDemo';
import IconButton from '@/components/ui/IconButton';

// Simpler than CarRentalMapPanel — one destination (owner or claimant),
// not a depot-then-renter pair, so only one marker besides the driver dot.
export default function InsuranceInspectionMapPanel({
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
}) {
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();
    const j = job || DEMO_PRE_POLICY;
    const isClaim = j.phase === 'claim';
    const destinationCoords = isClaim ? j.claimantCoords : j.ownerCoords;
    const destinationLabel = isClaim ? j.claimantName : j.ownerName;

    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
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
                    ...(routeTarget ?? destinationCoords),
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
            >
                {routeCoords?.length > 0 ? (
                    <Polyline coordinates={routeCoords} strokeColor={stepMeta?.color || primaryHex} strokeWidth={4} />
                ) : null}

                <Marker coordinate={destinationCoords} title={destinationLabel}>
                    <View className="marker-circle" style={[{ backgroundColor: `${primaryHex}28`, borderColor: primaryHex }]}>
                        <Icon name={isClaim ? 'car-emergency' : 'shield-check-outline'} size={20} color={primaryHex} />
                    </View>
                </Marker>

                <Marker coordinate={driverCoords} anchor={{ x: 0.5, y: 0.5 }}>
                    <View className="driver-dot" style={[{ backgroundColor: primaryHex, borderColor: '#fff' }]} />
                </Marker>
            </MapView>

            <View className="back-btn" style={[{ top: insets.top + 12, backgroundColor: cardBg }]}>
                <IconButton icon="arrow-left" size={42} iconSize={20} variant="ghost" onPress={handleBack} />
            </View>

            {isNavigating && (
                <View className="eta-chip" style={[{ top: insets.top + 12, backgroundColor: cardBg }]}>
                    <View>
                        <Text className="eta-time" style={[{ color: textColor }]}>
                            {routeLoading ? '…' : etaDuration}
                        </Text>
                        <Text className="eta-label">ETA</Text>
                    </View>
                </View>
            )}

            {isNavigating && routeTarget && (
                <View className="nav-fab" style={[{ bottom: 320, backgroundColor: stepMeta?.color || primaryHex }]}>
                    <IconButton icon="navigation-variant" size={52} iconSize={24} variant="ghost" color="#fff" onPress={onOpenMaps} />
                </View>
            )}
        </>
    );
}
