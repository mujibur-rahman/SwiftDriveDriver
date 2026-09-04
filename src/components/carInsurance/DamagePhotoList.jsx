// src/components/carInsurance/DamagePhotoList.jsx
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import PhotoSlot from '@/components/ui/PhotoSlot';
import AppTextInput from '@/components/ui/AppTextInput';
import Button from '@/components/ui/Button';

/**
 * Open-ended damage photo list for claim inspections — the opposite shape
 * of VehiclePhotoGrid (carRental/carInsurance pre_policy), which is a
 * fixed set of named sides. A collision might scratch one panel or wreck
 * five, so this is a plain array the driver appends to, each entry with
 * its own photo + short note (e.g. "front bumper, cracked").
 *
 * Props:
 * - photos: [{ id, uri, note }]
 * - onAddPhoto(): void         // parent handles the camera call + dispatch(addDamagePhoto)
 * - onChangeNote(id, note): void
 * - onRemove(id): void
 */
export default function DamagePhotoList({ photos, onAddPhoto, onChangeNote, onRemove }) {
    const { isDark } = useTheme();
    const errorHex = isDark ? '#F87171' : '#DC2626';

    return (
        <View className="gap-3">
            {photos.length === 0 && (
                <View className="items-center gap-2 rounded-2xl border border-dashed border-border bg-background-muted px-4 py-6">
                    <Icon name="camera-plus-outline" size={26} color={isDark ? '#7DD3FC' : '#64748B'} />
                    <Text className="text-xs font-inter text-foreground-muted text-center">
                        Add a photo for each damaged area — as many as needed.
                    </Text>
                </View>
            )}

            {photos.map((photo, index) => (
                <View key={photo.id} className="gap-2 rounded-xl border border-border bg-card px-3 py-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-inter-semibold text-foreground-muted uppercase tracking-wider">
                            Damage point {index + 1}
                        </Text>
                        <TouchableOpacity onPress={() => onRemove(photo.id)} hitSlop={8}>
                            <Icon name="trash-can-outline" size={16} color={errorHex} />
                        </TouchableOpacity>
                    </View>
                    <PhotoSlot uri={photo.uri} mode="display" label="Damage photo" height={110} />
                    <AppTextInput
                        placeholder="e.g. Front bumper, cracked"
                        value={photo.note}
                        onChangeText={(text) => onChangeNote(photo.id, text)}
                        leftIcon="note-text-outline"
                    />
                </View>
            ))}

            <Button variant="outline" leftIcon="camera-plus-outline" onPress={onAddPhoto}>
                Add damage photo
            </Button>
        </View>
    );
}
