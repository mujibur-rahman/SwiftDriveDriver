// src/components/parcel/ParcelScanner.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';

// Loose match — trims whitespace and ignores case, so a barcode generator
// adding/changing a checksum digit or the on-screen keyboard's autocap
// doesn't silently break the comparison.
const normalize = (s) => String(s ?? '').trim().toUpperCase();

/**
 * Scans each parcel's barcode/QR at pickup and checks it off against the
 * order's parcel list. Requires `expo-camera` — run:
 *   npx expo install expo-camera
 * ...and make sure app.json has the expo-camera plugin + Android CAMERA
 * permission registered, then rebuild the native app (prebuild / dev
 * client) — a JS-only reload will NOT pick up new native permissions.
 *
 * Props:
 * - parcels: [{ id, label, barcode }]
 * - scannedIds: string[]        — ids already confirmed scanned
 * - onScan: (parcelId) => void  — called once per newly-matched scan
 */
export default function ParcelScanner({ parcels, scannedIds, onScan }) {
    const { colors, isDark } = useTheme();
    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');
    const successHex = isDark ? '#34D399' : '#16A34A';
    const errorHex = isDark ? '#F87171' : '#DC2626';
    const [permission, requestPermission] = useCameraPermissions();
    const [locked, setLocked] = useState(false); // debounce duplicate reads of the same code
    const [manualMode, setManualMode] = useState(false);
    const [manualCode, setManualCode] = useState('');
    // Surfaces exactly what was read, right on screen — no need to dig
    // through adb logcat / expo start logs to debug a mismatch.
    const [lastResult, setLastResult] = useState(null); // { raw, ok, label? }

    const tryMatch = (raw) => {
        const code = normalize(raw);
        const match = parcels.find(
            (p) => normalize(p.barcode) === code || normalize(p.id) === code,
        );

        if (!match) {
            setLastResult({ raw, ok: false });
            return false;
        }
        if (scannedIds.includes(match.id)) {
            setLastResult({ raw, ok: false, alreadyScanned: true, label: match.label });
            return false;
        }

        setLastResult({ raw, ok: true, label: match.label });
        onScan(match.id);
        return true;
    };

    const handleBarcodeScanned = ({ data }) => {
        if (locked) return;
        setLocked(true);
        tryMatch(data);
        // Small cooldown so the same barcode isn't re-triggered on the next frame
        setTimeout(() => setLocked(false), 1200);
    };

    const handleManualSubmit = () => {
        const code = manualCode.trim();
        if (!code) return;
        const matched = tryMatch(code);
        if (matched) {
            setManualCode('');
        } else {
            Alert.alert(
                'Not recognized',
                `"${code}" doesn't match any parcel in this order. Double-check the number and try again.`,
            );
        }
    };

    // Permission state still resolving
    if (!permission) return null;

    if (!permission.granted) {
        return (
            <View className="rounded-2xl border border-dashed border-border bg-background-muted items-center justify-center py-8 gap-3">
                <Icon name="camera-off-outline" size={28} color={primaryHex} />
                <Text className="text-sm font-inter-medium text-foreground text-center px-4">
                    Camera access is needed to scan parcel barcodes
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="rounded-xl bg-primary px-4 py-2"
                >
                    <Text className="text-sm font-inter-semibold text-white">
                        Grant camera access
                    </Text>
                </TouchableOpacity>
                <Text className="text-[11px] font-inter text-foreground-muted text-center px-4">
                    If nothing happens when you tap this, the permission was
                    likely denied before — enable Camera manually from your
                    phone's Settings → Apps → SwiftDrive Driver.
                </Text>
            </View>
        );
    }

    return (
        <View style={{ gap: 12 }}>
            {!manualMode ? (
                <View style={{ height: 220, borderRadius: 16, overflow: 'hidden' }}>
                    <CameraView
                        style={{ flex: 1 }}
                        facing="back"
                        autofocus="on"
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr', 'code128', 'ean13', 'ean8', 'code39'],
                        }}
                        onBarcodeScanned={handleBarcodeScanned}
                    />
                </View>
            ) : (
                <View className="rounded-2xl border border-border bg-background-muted px-3 py-3 gap-2">
                    <Text className="text-xs font-inter text-foreground-muted">
                        Enter the barcode number printed on the parcel
                    </Text>
                    <View className="flex-row gap-2">
                        <TextInput
                            value={manualCode}
                            onChangeText={setManualCode}
                            placeholder="e.g. 8901234567890"
                            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                            keyboardType="number-pad"
                            className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-inter text-foreground"
                        />
                        <TouchableOpacity
                            onPress={handleManualSubmit}
                            className="rounded-xl bg-primary px-4 items-center justify-center"
                        >
                            <Text className="text-sm font-inter-semibold text-white">
                                Add
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ── On-screen debug readout — what did we actually read? ── */}
            {lastResult && (
                <View
                    className="rounded-xl px-3 py-2 flex-row items-center gap-2"
                    style={{
                        backgroundColor: lastResult.ok
                            ? `${successHex}18`
                            : `${errorHex}18`,
                    }}
                >
                    <Icon
                        name={lastResult.ok ? 'check-circle-outline' : 'alert-circle-outline'}
                        size={16}
                        color={lastResult.ok ? successHex : errorHex}
                    />
                    <Text
                        className="flex-1 text-xs font-inter"
                        style={{ color: lastResult.ok ? successHex : errorHex }}
                        numberOfLines={2}
                    >
                        {lastResult.ok
                            ? `Matched: ${lastResult.label}`
                            : lastResult.alreadyScanned
                                ? `Already scanned: ${lastResult.label}`
                                : `No match for "${lastResult.raw}" — check the demo parcel codes below`}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                onPress={() => setManualMode((v) => !v)}
                className="self-center flex-row items-center gap-1.5 py-1"
            >
                <Icon
                    name={manualMode ? 'camera-outline' : 'keyboard-outline'}
                    size={14}
                    color={primaryHex}
                />
                <Text className="text-xs font-inter-semibold text-primary">
                    {manualMode ? 'Switch back to camera' : "Can't scan? Enter barcode manually"}
                </Text>
            </TouchableOpacity>

            <View className="rounded-2xl border border-border bg-background-muted px-3 py-2 gap-1">
                {parcels.map((p) => {
                    const done = scannedIds.includes(p.id);
                    return (
                        <View
                            key={p.id}
                            className="flex-row items-center gap-3 py-2 px-1"
                        >
                            <Icon
                                name={done ? 'check-circle' : 'circle-outline'}
                                size={20}
                                color={done ? successHex : (colors?.border ?? '#94A3B8')}
                            />
                            <Text
                                className={`flex-1 text-sm font-inter ${done
                                    ? 'text-foreground-muted line-through'
                                    : 'text-foreground'
                                    }`}
                            >
                                {p.label} · {p.id}
                                <Text className="text-foreground-muted">
                                    {' '}({p.barcode})
                                </Text>
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}