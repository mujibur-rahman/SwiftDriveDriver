import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '@/theme';
import { encodeCode128B } from '@/utils/barcode';


export default function PickupVerificationBarcode({
    code,
    height = 82,
    moduleWidth = 2,
    showText = true,
}) {
    const { colors } = useTheme();

    const barcodeData = useMemo(() => {
        try {
            return encodeCode128B(code);
        } catch (error) {
            console.warn('Barcode generation failed:', error.message);
            return '';
        }
    }, [code]);

    if (!code || !barcodeData) {
        return null;
    }

    const quietZoneModules = 10;
    const barcodeModules = barcodeData.length;
    const totalModules = barcodeModules + quietZoneModules * 2;
    const svgWidth = totalModules * moduleWidth;

    const bars = [];

    let currentBarStart = null;

    for (let index = 0; index < barcodeData.length; index += 1) {
        const bit = barcodeData[index];

        if (bit === '1' && currentBarStart === null) {
            currentBarStart = index;
        }

        const isEndOfBar =
            currentBarStart !== null &&
            (bit === '0' || index === barcodeData.length - 1);

        if (isEndOfBar) {
            const endIndex =
                bit === '1' && index === barcodeData.length - 1
                    ? index + 1
                    : index;

            bars.push({
                start: currentBarStart,
                width: endIndex - currentBarStart,
            });

            currentBarStart = null;
        }
    }

    return (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <Svg
                width="100%"
                height={height}
                viewBox={`0 0 ${svgWidth} ${height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {bars.map((bar, index) => (
                    <Rect
                        key={`${bar.start}-${index}`}
                        x={(bar.start + quietZoneModules) * moduleWidth}
                        y={0}
                        width={bar.width * moduleWidth}
                        height={height}
                        fill={colors.text}
                    />
                ))}
            </Svg>

            {showText && (
                <Text
                    selectable
                    style={{
                        marginTop: 10,
                        fontSize: 16,
                        fontWeight: '700',
                        letterSpacing: 1.5,
                        color: colors.text,
                    }}
                >
                    {code}
                </Text>
            )}
        </View>
    );
}

