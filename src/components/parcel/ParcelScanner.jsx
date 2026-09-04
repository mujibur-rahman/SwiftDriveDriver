// src/components/parcel/ParcelScanner.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Vibration,
    Platform,
    Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import AppTextInput from '@/components/ui/AppTextInput';
import StatusBanner from '@/components/ui/StatusBanner';
import ListRow from '@/components/ui/ListRow';

const normalize = (s) => String(s ?? '').trim().toUpperCase();

const BARCODE_TYPES = [
    'qr',
    'code128',
    'code39',
    'code93',
    'ean13',
    'ean8',
    'upc_a',
    'upc_e',
    'itf14',
    'codabar',
    'pdf417',
    'datamatrix',
    'aztec',
];

export default function ParcelScanner({ parcels = [], scannedIds = [], onScan }) {
    const { colors, isDark } = useTheme();
    const primaryHex = colors?.primary ?? (isDark ? '#38BDF8' : '#0EA5E9');

    const [permission, requestPermission] = useCameraPermissions();
    const [locked, setLocked] = useState(false);
    const [manualMode, setManualMode] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [lastResult, setLastResult] = useState(null);
    const [torch, setTorch] = useState(false);
    const [scanningEnabled, setScanningEnabled] = useState(true);

    const lockTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        };
    }, []);

    const tryMatch = useCallback(
        (raw) => {
            const code = normalize(raw);
            if (!code) return false;

            const match = parcels.find(
                (p) => normalize(p.barcode) === code || normalize(p.id) === code,
            );

            if (!match) {
                setLastResult({ raw, ok: false });
                return false;
            }
            if (scannedIds.includes(match.id)) {
                setLastResult({
                    raw,
                    ok: false,
                    alreadyScanned: true,
                    label: match.label,
                });
                return false;
            }

            setLastResult({ raw, ok: true, label: match.label });
            if (Platform.OS !== 'web') Vibration.vibrate(80);
            onScan?.(match.id);
            return true;
        },
        [parcels, scannedIds, onScan],
    );

    const handleBarcodeScanned = useCallback(
        ({ data, type }) => {
            if (!scanningEnabled || locked || !data) return;

            setLocked(true);
            setScanningEnabled(false);

            const matched = tryMatch(data);
            console.log('[ParcelScanner] scanned', { data, type, matched });

            const delay = matched ? 1600 : 900;
            if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
            lockTimerRef.current = setTimeout(() => {
                setLocked(false);
                setScanningEnabled(true);
            }, delay);
        },
        [scanningEnabled, locked, tryMatch],
    );

    const handleManualSubmit = () => {
        const code = manualCode.trim();
        if (!code) return;
        const matched = tryMatch(code);
        if (matched) {
            setManualCode('');
        } else {
            Alert.alert(
                'Not recognized',
                `"${code}" doesn't match any parcel in this order.\n\nDemo codes:\n${parcels
                    .map((p) => `• ${p.barcode}`)
                    .join('\n')}`,
            );
        }
    };

    if (!permission) {
        return (
            <View className="items-center justify-center py-6">
                <Text className="text-sm font-inter text-foreground-muted">
                    Checking camera permission…
                </Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="items-center gap-3 rounded-2xl border border-dashed border-border bg-background-muted px-4 py-8">
                <Icon name="camera-off-outline" size={28} color={primaryHex} />
                <Text className="px-2 text-center text-sm font-inter-medium text-foreground">
                    Camera access is needed to scan parcel barcodes
                </Text>
                <Button size="sm" onPress={requestPermission}>
                    Grant camera access
                </Button>
                <Text className="px-2 text-center text-[11px] font-inter text-foreground-muted">
                    If nothing happens, enable Camera in Settings → Apps → Zyro
                    Driver. Simulators usually have no camera — use a real device or
                    manual entry.
                </Text>
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon="keyboard-outline"
                    onPress={() => setManualMode(true)}
                >
                    Enter barcode manually
                </Button>
                {manualMode && (
                    <View className="mt-1 w-full gap-2">
                        <AppTextInput
                            value={manualCode}
                            onChangeText={setManualCode}
                            placeholder="e.g. 8901234567890"
                            autoCapitalize="characters"
                            size="sm"
                        />
                        <Button size="sm" onPress={handleManualSubmit}>
                            Add
                        </Button>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View className="gap-2.5">
            {!manualMode ? (
                <View className="h-60 overflow-hidden rounded-2xl bg-black">
                    <CameraView
                        facing="back"
                        enableTorch={torch}
                        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
                        onBarcodeScanned={
                            scanningEnabled ? handleBarcodeScanned : undefined
                        }
                    />

                    <View
                        pointerEvents="none"
                        className="absolute inset-0 items-center justify-center"
                    >
                        <View
                            className="absolute left-9 top-9 h-7 w-7 border-l-[3px] border-t-[3px]"
                            style={{ borderColor: primaryHex }}
                        />
                        <View
                            className="absolute right-9 top-9 h-7 w-7 border-r-[3px] border-t-[3px]"
                            style={{ borderColor: primaryHex }}
                        />
                        <View
                            className="absolute bottom-12 left-9 h-7 w-7 border-b-[3px] border-l-[3px]"
                            style={{ borderColor: primaryHex }}
                        />
                        <View
                            className="absolute bottom-12 right-9 h-7 w-7 border-b-[3px] border-r-[3px]"
                            style={{ borderColor: primaryHex }}
                        />
                        <Text className="absolute bottom-3.5 text-xs font-inter-semibold text-white">
                            Align barcode inside the frame
                        </Text>
                    </View>

                    <View className="absolute right-3 top-3">
                        <IconButton
                            icon={torch ? 'flashlight' : 'flashlight-off'}
                            size={40}
                            iconSize={20}
                            variant={torch ? 'primary' : 'ghost'}
                            onPress={() => setTorch((t) => !t)}
                            className="rounded-full bg-card/80"
                        />
                    </View>
                </View>
            ) : (
                <View className="gap-2 rounded-2xl border border-border bg-background-muted px-3 py-3">
                    <Text className="text-xs font-inter text-foreground-muted">
                        Enter the barcode / ID printed on the parcel
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <View className="flex-1">
                            <AppTextInput
                                value={manualCode}
                                onChangeText={setManualCode}
                                placeholder="e.g. 8901234567890"
                                autoCapitalize="characters"
                                size="sm"
                            />
                        </View>
                        <Button size="sm" fullWidth={false} onPress={handleManualSubmit}>
                            Add
                        </Button>
                    </View>
                </View>
            )}

            {lastResult && (
                <StatusBanner
                    variant={lastResult.ok ? 'success' : 'error'}
                    icon={
                        lastResult.ok ? 'check-circle-outline' : 'alert-circle-outline'
                    }
                    message={
                        lastResult.ok
                            ? `Matched: ${lastResult.label}`
                            : lastResult.alreadyScanned
                                ? `Already scanned: ${lastResult.label}`
                                : `No match for "${lastResult.raw}"`
                    }
                    className="py-2"
                />
            )}

            <Button
                size="xs"
                variant="ghost"
                leftIcon={manualMode ? 'camera-outline' : 'keyboard-outline'}
                onPress={() => setManualMode((v) => !v)}
                className="self-center"
            >
                {manualMode ? 'Switch back to camera' : "Can't scan? Enter manually"}
            </Button>

            <View className="gap-1.5 rounded-2xl border border-border bg-background-muted px-2 py-2">
                {parcels.map((p) => {
                    const done = scannedIds.includes(p.id);
                    return (
                        <ListRow
                            key={p.id}
                            icon={done ? 'check-circle' : 'circle-outline'}
                            iconColor={
                                done
                                    ? colors?.success ?? (isDark ? '#34D399' : '#16A34A')
                                    : colors?.border
                            }
                            label={`${p.label} · ${p.id}`}
                            subtitle={p.barcode}
                            labelClassName={
                                done ? 'text-foreground-muted line-through' : undefined
                            }
                            showChevron={false}
                            className="border-0 bg-transparent py-1.5"
                            rightContent={
                                !done ? (
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        fullWidth={false}
                                        onPress={() => tryMatch(p.barcode)}
                                    >
                                        Tap to scan
                                    </Button>
                                ) : null
                            }
                        />
                    );
                })}
            </View>
        </View>
    );
}