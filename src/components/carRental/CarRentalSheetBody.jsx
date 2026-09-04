// src/components/carRental/CarRentalSheetBody.jsx
import { View, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import PlaceRow from '@/components/food/PlaceRow';
import Button from '@/components/ui/Button';
import StatRow from '@/components/ui/StatRow';
import Heading from '@/components/ui/Heading';
import StatusBanner from '@/components/ui/StatusBanner';
import PhotoSlot from '@/components/ui/PhotoSlot';
import AppTextInput from '@/components/ui/AppTextInput';
import VehiclePhotoGrid from '@/components/carRental/VehiclePhotoGrid';

// Config-driven, not hard-coded per screen — add/remove a side here and
// both the delivery pre-trip grid and the collection return grid follow.
const SIDES = [
    { key: 'front', label: 'Front' },
    { key: 'back', label: 'Back' },
    { key: 'left', label: 'Left side' },
    { key: 'right', label: 'Right side' },
    { key: 'odometer', label: 'Odometer' },
    { key: 'fuel', label: 'Fuel gauge' },
];

export default function CarRentalSheetBody({
    step,
    job,
    primaryHex,
    warningHex,
    successHex,
    isDark,
    etaDistance,
    etaDuration,
    total,
    routeLoading,
    // inspection (both legs)
    photos,
    comparePhotos,
    onCapturePhoto,
    // renter verification (delivery)
    renterIdPhoto,
    onCaptureRenterId,
    renterConfirmed,
    onToggleRenterConfirmed,
    // damage report (collection)
    damageFound,
    onToggleDamageFound,
    damageNotes,
    onChangeDamageNotes,
    // handover photo (both legs, final step)
    handoffPhoto,
    onCaptureHandoff,
    callPhone,
}) {
    switch (step) {
        case 'to_depot':
        case 'to_renter': {
            const toRenter = step === 'to_renter';
            const target = toRenter ? job.renterName : job.depot;
            const address = toRenter ? job.renterAddress : job.depotAddress;
            return (
                <>
                    <PlaceRow
                        icon={toRenter ? 'account-outline' : 'warehouse'}
                        iconColor={primaryHex}
                        title={target}
                        subtitle={address}
                        badge={`#${job.orderNumber}`}
                    />
                    <StatRow
                        className="border border-border bg-card"
                        items={[
                            { label: 'Distance', value: etaDistance },
                            { label: 'Est. time', value: etaDuration },
                            { label: 'Vehicle', value: job.vehicle },
                        ]}
                    />
                    {routeLoading && <Heading size="xs" align="center" subtitle="Updating route..." />}
                </>
            );
        }

        case 'at_depot':
            return (
                <>
                    <PlaceRow icon="warehouse" iconColor={primaryHex} title={job.depot} subtitle={job.depotAddress} />
                    <View className="rounded-2xl border border-border bg-background-muted px-4 py-4 items-center gap-2">
                        <Icon name="car-key" size={28} color={primaryHex} />
                        <Text className="text-sm font-inter-medium text-foreground text-center">
                            {job.phase === 'collection' ? 'Return the car and hand back the keys' : 'Collect keys and documents'}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            {job.vehicle} · {job.plate}
                        </Text>
                    </View>
                </>
            );

        case 'pre_trip_inspection':
            return (
                <>
                    <StatusBanner
                        variant="info"
                        icon="information-outline"
                        message="Photograph all 4 sides plus odometer and fuel gauge — this is your proof if there's a damage dispute later."
                    />
                    <VehiclePhotoGrid sides={SIDES} photos={photos} onCapture={onCapturePhoto} />
                </>
            );

        case 'return_inspection':
            return (
                <>
                    <StatusBanner
                        variant="info"
                        icon="compare-horizontal"
                        message="Compare against the pre-trip photos on the left as you capture each new one."
                    />
                    <VehiclePhotoGrid sides={SIDES} photos={photos} comparePhotos={comparePhotos} onCapture={onCapturePhoto} />
                </>
            );

        case 'verify_id':
            return (
                <>
                    <PlaceRow icon="account-outline" iconColor={successHex} title={job.renterName} subtitle="Verify driving licence" />
                    <Heading size="xs" subtitle="Renter's licence photo" subtitleClassName="font-inter-semibold uppercase tracking-wider" />
                    <PhotoSlot label="Take photo of licence" uri={renterIdPhoto} onPress={onCaptureRenterId} height={130} />
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button variant="outline" size="sm" leftIcon="phone" onPress={() => callPhone(job.renterPhone, job.renterName)}>
                                Call
                            </Button>
                        </View>
                    </View>
                </>
            );

        case 'joint_walkaround':
            return (
                <>
                    <StatusBanner
                        variant="warning"
                        title="Confirm together"
                        message="Walk around the car with the renter one more time and both agree the condition matches the photos before handing over keys."
                    />
                    <View
                        className="flex-row items-center gap-3 rounded-xl border px-4 py-3.5"
                        style={{
                            borderColor: renterConfirmed ? successHex : (isDark ? '#1E3A5F' : '#E2E8F0'),
                            backgroundColor: renterConfirmed ? `${successHex}14` : 'transparent',
                        }}
                    >
                        <Icon name={renterConfirmed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} size={22} color={renterConfirmed ? successHex : warningHex} />
                        <Text className="flex-1 text-sm font-inter-medium text-foreground">Renter confirms the vehicle condition</Text>
                        <Button fullWidth={false} variant={renterConfirmed ? 'success' : 'outline'} size="sm" onPress={onToggleRenterConfirmed}>
                            {renterConfirmed ? 'Confirmed' : 'Confirm'}
                        </Button>
                    </View>
                </>
            );

        case 'damage_report':
            return (
                <>
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button variant={!damageFound ? 'success' : 'outline'} size="sm" leftIcon="check" onPress={() => onToggleDamageFound(false)}>
                                No new damage
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button variant={damageFound ? 'warning' : 'outline'} size="sm" leftIcon="alert-outline" onPress={() => onToggleDamageFound(true)}>
                                Damage found
                            </Button>
                        </View>
                    </View>
                    {damageFound && (
                        <AppTextInput
                            label="Describe the damage"
                            placeholder="e.g. scratch on rear bumper, left side"
                            value={damageNotes}
                            onChangeText={onChangeDamageNotes}
                            multiline
                            leftIcon="note-text-outline"
                        />
                    )}
                </>
            );

        case 'collect_keys':
        case 'handover': {
            const isCollect = step === 'collect_keys';
            return (
                <>
                    <PlaceRow
                        icon="key-outline"
                        iconColor={successHex}
                        title={isCollect ? 'Collect keys & documents' : 'Hand over keys & documents'}
                        subtitle={job.vehicle}
                    />
                    <Heading size="xs" subtitle="Hand-off photo" subtitleClassName="font-inter-semibold uppercase tracking-wider" />
                    <PhotoSlot
                        label={isCollect ? 'Photo of keys returned' : 'Photo of keys handed over'}
                        uri={handoffPhoto}
                        onPress={onCaptureHandoff}
                        height={120}
                    />
                </>
            );
        }

        default:
            return null;
    }
}
