// src/components/gig/GigMapPanel.jsx
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { DEMO } from '@/screens/main/gig/gigDemo';
import IconButton from '@/components/ui/IconButton';

export default function GigMapPanel({
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
  const j = job || DEMO;

  const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
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
          ...(routeTarget ?? j.customerCoords),
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

        <Marker coordinate={j.customerCoords} title={j.customerName}>
          <View
            className="marker-circle"
            style={[
              {
                backgroundColor: `${successHex}28`,
                borderColor: successHex,
              },
            ]}
          >
            <Icon
              name={j.categoryIcon || 'briefcase-outline'}
              size={20}
              color={successHex}
            />
          </View>
        </Marker>

        <Marker coordinate={driverCoords} anchor={{ x: 0.5, y: 0.5 }}>
          <View
            className="driver-dot"
            style={[
              { backgroundColor: primaryHex, borderColor: '#fff' },
            ]}
          />
        </Marker>
      </MapView>

      <View className="back-btn" style={[{ top: insets.top + 8, backgroundColor: cardBg }]}>
        <IconButton
          icon="arrow-left"
          size={42}
          iconSize={20}
          variant="ghost"
          onPress={handleBack}
        />
      </View>

      {isNavigating && (
        <View
          className="eta-chip"
          style={[{ top: insets.top + 8, backgroundColor: cardBg }]}
        >
          <View>
            <Text className="eta-time" style={[{ color: textColor }]}>
              {routeLoading ? '…' : etaDuration || j.durationToJob}
            </Text>
            <Text className="eta-label">ETA</Text>
          </View>
        </View>
      )}

      {isNavigating && (
        <View className="nav-fab" style={[{ bottom: 360, backgroundColor: primaryHex }]}>
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
