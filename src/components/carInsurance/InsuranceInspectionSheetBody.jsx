// src/components/carInsurance/InsuranceInspectionSheetBody.jsx
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
import DamagePhotoList from '@/components/carInsurance/DamagePhotoList';
import SeveritySelector from '@/components/carInsurance/SeveritySelector';

// Reused from carRental — same 6-side shape works for a pre-policy
// condition check, no reason to redefine it.
const SIDES = [
    { key: 'front', label: 'Front' },
    { key: 'back', label: 'Back' },
    { key: 'left', label: 'Left side' },
    { key: 'right', label: 'Right side' },
    { key: 'odometer', label: 'Odometer' },
    { key: 'fuel', label: 'Fuel gauge' },
];

export default function InsuranceInspectionSheetBody({
    step,
    job,
    primaryHex,
    warningHex,
    successHex,
    isDark,
    etaDistance,
    etaDuration,
    routeLoading,
    // pre_policy
    ownerVerified,
    onToggleOwnerVerified,
    vinPhotoUri,
    vinNumber,
    onCaptureVin,
    onChangeVinNumber,
    conditionPhotos,
    onCaptureConditionPhoto,
    existingDamageFound,
    onToggleExistingDamage,
    existingDamageNotes,
    onChangeExistingDamageNotes,
    ownerConsent,
    onToggleOwnerConsent,
    // claim
    claimantVerified,
    onToggleClaimantVerified,
    damagePhotos,
    onAddDamagePhoto,
    onChangeDamagePhotoNote,
    onRemoveDamagePhoto,
    incidentNotes,
    onChangeIncidentNotes,
    policeReportNumber,
    onChangePoliceReportNumber,
    severity,
    onChangeSeverity,
    claimantConsent,
    onToggleClaimantConsent,
    callPhone,
}) {
    switch (step) {
        case 'to_location': {
            const isClaim = job.phase === 'claim';
            const person = isClaim ? job.claimantName : job.ownerName;
            const address = isClaim ? job.claimantAddress : job.ownerAddress;
            return (
                <>
                    <PlaceRow icon="account-outline" iconColor={primaryHex} title={person} subtitle={address} badge={`#${job.orderNumber}`} />
                    <StatRow
                        className="border border-border bg-card"
                        items={[
                            { label: 'Distance', value: etaDistance },
                            { label: 'Est. time', value: etaDuration },
                            { label: isClaim ? 'Claim #' : 'Policy #', value: isClaim ? job.claimNumber : job.policyNumber },
                        ]}
                    />
                    {routeLoading && <Heading size="xs" align="center" subtitle="Updating route..." />}
                </>
            );
        }

        case 'at_location': {
            const isClaim = job.phase === 'claim';
            return (
                <>
                    <PlaceRow icon="account-outline" iconColor={primaryHex} title={isClaim ? job.claimantName : job.ownerName} subtitle={isClaim ? job.claimantAddress : job.ownerAddress} />
                    <View className="rounded-2xl border border-border bg-background-muted px-4 py-4 items-center gap-2">
                        <Icon name={isClaim ? 'car-emergency' : 'clipboard-check-outline'} size={28} color={primaryHex} />
                        <Text className="text-sm font-inter-medium text-foreground text-center">
                            {isClaim ? 'Document the damage for this claim' : 'Inspect and document the vehicle'}
                        </Text>
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            {job.vehicle} · {job.plate}
                        </Text>
                    </View>
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon="phone"
                                onPress={() => callPhone(isClaim ? job.claimantPhone : job.ownerPhone, isClaim ? job.claimantName : job.ownerName)}
                            >
                                Call
                            </Button>
                        </View>
                    </View>
                </>
            );
        }

        // ── pre_policy ─────────────────────────────────────────────
        case 'verify_owner':
            return (
                <>
                    <StatusBanner variant="info" icon="shield-check-outline" message={`Confirm this is ${job.ownerName} and the policy number matches ${job.policyNumber}.`} />
                    <View
                        className="flex-row items-center gap-3 rounded-xl border px-4 py-3.5"
                        style={{
                            borderColor: ownerVerified ? successHex : isDark ? '#1E3A5F' : '#E2E8F0',
                            backgroundColor: ownerVerified ? `${successHex}14` : 'transparent',
                        }}
                    >
                        <Icon name={ownerVerified ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} size={22} color={ownerVerified ? successHex : warningHex} />
                        <Text className="flex-1 text-sm font-inter-medium text-foreground">Owner identity & policy number verified</Text>
                        <Button fullWidth={false} variant={ownerVerified ? 'success' : 'outline'} size="sm" onPress={onToggleOwnerVerified}>
                            {ownerVerified ? 'Verified' : 'Verify'}
                        </Button>
                    </View>
                </>
            );

        case 'vin_capture':
            return (
                <>
                    <Heading size="xs" subtitle="VIN / chassis plate" subtitleClassName="font-inter-semibold uppercase tracking-wider" />
                    <PhotoSlot label="Photo of the VIN plate" uri={vinPhotoUri} onPress={onCaptureVin} height={130} />
                    <AppTextInput label="VIN number" placeholder="e.g. 1HGCM82633A004352" value={vinNumber} onChangeText={onChangeVinNumber} leftIcon="barcode-scan" autoCapitalize="characters" />
                </>
            );

        case 'condition_inspection':
            return (
                <>
                    <StatusBanner variant="info" icon="information-outline" message="Photograph all 4 sides plus odometer and fuel gauge for the policy record." />
                    <VehiclePhotoGrid sides={SIDES} photos={conditionPhotos} onCapture={onCaptureConditionPhoto} />
                </>
            );

        case 'existing_damage':
            return (
                <>
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button variant={!existingDamageFound ? 'success' : 'outline'} size="sm" leftIcon="check" onPress={() => onToggleExistingDamage(false)}>
                                No existing damage
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button variant={existingDamageFound ? 'warning' : 'outline'} size="sm" leftIcon="alert-outline" onPress={() => onToggleExistingDamage(true)}>
                                Damage found
                            </Button>
                        </View>
                    </View>
                    {existingDamageFound && (
                        <AppTextInput
                            label="Describe the existing damage"
                            placeholder="e.g. small dent on rear-left door"
                            value={existingDamageNotes}
                            onChangeText={onChangeExistingDamageNotes}
                            multiline
                            leftIcon="note-text-outline"
                        />
                    )}
                </>
            );

        case 'owner_consent':
            return (
                <>
                    <StatusBanner variant="warning" title="Owner sign-off" message="The owner confirms the vehicle condition shown in these photos is accurate before the report is submitted." />
                    <View
                        className="flex-row items-center gap-3 rounded-xl border px-4 py-3.5"
                        style={{
                            borderColor: ownerConsent ? successHex : isDark ? '#1E3A5F' : '#E2E8F0',
                            backgroundColor: ownerConsent ? `${successHex}14` : 'transparent',
                        }}
                    >
                        <Icon name={ownerConsent ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} size={22} color={ownerConsent ? successHex : warningHex} />
                        <Text className="flex-1 text-sm font-inter-medium text-foreground">Owner confirms and consents</Text>
                        <Button fullWidth={false} variant={ownerConsent ? 'success' : 'outline'} size="sm" onPress={onToggleOwnerConsent}>
                            {ownerConsent ? 'Confirmed' : 'Confirm'}
                        </Button>
                    </View>
                </>
            );

        // ── claim ──────────────────────────────────────────────────
        case 'verify_claimant':
            return (
                <>
                    <StatusBanner variant="info" icon="shield-check-outline" message={`Confirm this is ${job.claimantName} and the claim number matches ${job.claimNumber}.`} />
                    <View
                        className="flex-row items-center gap-3 rounded-xl border px-4 py-3.5"
                        style={{
                            borderColor: claimantVerified ? successHex : isDark ? '#1E3A5F' : '#E2E8F0',
                            backgroundColor: claimantVerified ? `${successHex}14` : 'transparent',
                        }}
                    >
                        <Icon name={claimantVerified ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} size={22} color={claimantVerified ? successHex : warningHex} />
                        <Text className="flex-1 text-sm font-inter-medium text-foreground">Claimant identity & claim number verified</Text>
                        <Button variant={claimantVerified ? 'success' : 'outline'} size="sm" onPress={onToggleClaimantVerified}>
                            {claimantVerified ? 'Verified' : 'Verify'}
                        </Button>
                    </View>
                </>
            );

        case 'damage_photos':
            return (
                <>
                    <StatusBanner variant="info" icon="camera-outline" message="Add a close-up photo for every damaged area — front bumper, headlight, door panel, whatever applies." />
                    <DamagePhotoList photos={damagePhotos} onAddPhoto={onAddDamagePhoto} onChangeNote={onChangeDamagePhotoNote} onRemove={onRemoveDamagePhoto} />
                </>
            );

        case 'incident_details':
            return (
                <>
                    <AppTextInput label="What happened" placeholder="Brief description of the incident" value={incidentNotes} onChangeText={onChangeIncidentNotes} multiline leftIcon="note-text-outline" />
                    <AppTextInput label="Police report number (optional)" placeholder="e.g. NSW-2026-88213" value={policeReportNumber} onChangeText={onChangePoliceReportNumber} leftIcon="file-document-outline" />
                </>
            );

        case 'severity':
            return (
                <>
                    <Heading size="xs" subtitle="How severe is the damage?" subtitleClassName="font-inter-semibold uppercase tracking-wider" />
                    <SeveritySelector value={severity} onChange={onChangeSeverity} />
                </>
            );

        case 'claimant_consent':
            return (
                <>
                    <StatusBanner variant="warning" title="Claimant sign-off" message="The claimant confirms the damage shown matches what's being claimed before the report is submitted." />
                    <View
                        className="flex-row items-center gap-3 rounded-xl border px-4 py-3.5"
                        style={{
                            borderColor: claimantConsent ? successHex : isDark ? '#1E3A5F' : '#E2E8F0',
                            backgroundColor: claimantConsent ? `${successHex}14` : 'transparent',
                        }}
                    >
                        <Icon name={claimantConsent ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} size={22} color={claimantConsent ? successHex : warningHex} />
                        <Text className="flex-1 text-sm font-inter-medium text-foreground">Claimant confirms and consents</Text>
                        <Button variant={claimantConsent ? 'success' : 'outline'} size="sm" onPress={onToggleClaimantConsent}>
                            {claimantConsent ? 'Confirmed' : 'Confirm'}
                        </Button>
                    </View>
                </>
            );

        case 'submit_report': {
            const isClaim = job.phase === 'claim';
            return (
                <>
                    <View className="rounded-2xl bg-background-muted px-4 py-5 items-center gap-1.5">
                        <Icon name="file-check-outline" size={26} color={successHex} />
                        <Text className="text-sm font-inter-semibold text-foreground text-center">Report ready to submit</Text>
                        <Text className="text-xs font-inter text-foreground-muted text-center">
                            {isClaim ? `${damagePhotos.length} damage photo${damagePhotos.length === 1 ? '' : 's'} · Severity: ${severity || '—'}` : 'VIN, condition photos, and owner sign-off captured'}
                        </Text>
                    </View>
                </>
            );
        }

        default:
            return null;
    }
}
