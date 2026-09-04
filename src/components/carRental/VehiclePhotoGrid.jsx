// src/components/carRental/VehiclePhotoGrid.jsx
import { View, Text } from 'react-native';
import PhotoSlot from '@/components/ui/PhotoSlot';

/**
 * Dynamic vehicle photo grid — driven entirely by the `sides` array, so
 * the same component covers pre-trip capture (delivery) AND return
 * capture-with-comparison (collection) without a separate component for
 * each. Not hard-coded to exactly 4 angles; add/remove entries in `sides`
 * and the grid follows.
 *
 * Props:
 * - sides: [{ key, label, icon? }]   e.g. front/back/left/right/odometer/fuel
 * - photos: { [side]: uri | null }    the set currently being captured
 * - comparePhotos?: { [side]: uri }   when given, shows a locked "Before"
 *                                     tile next to the capture tile — used
 *                                     for the collection-leg return walkaround
 * - onCapture(sideKey): void
 */
export default function VehiclePhotoGrid({ sides, photos, comparePhotos, onCapture }) {
    return (
        <View className="flex-row flex-wrap gap-y-4">
            {sides.map((side) => (
                <View key={side.key} className="w-1/2 px-2" >
                    <Text className="text-xs font-inter-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                        {side.label}
                    </Text>
                    {comparePhotos ? (
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <PhotoSlot mode="display" uri={comparePhotos[side.key]} label="Before" height={100} rounded="lg" />
                            </View>
                            <View className="flex-1">
                                <PhotoSlot
                                    uri={photos[side.key]}
                                    onPress={() => onCapture(side.key)}
                                    label="After"
                                    required
                                    height={100}
                                    rounded="lg"
                                />
                            </View>
                        </View>
                    ) : (
                        <PhotoSlot uri={photos[side.key]} onPress={() => onCapture(side.key)} label={side.label} required height={110} />
                    )}
                </View>
            ))}
        </View>
    );
}
