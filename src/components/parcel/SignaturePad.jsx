// src/components/parcel/SignaturePad.jsx
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

function pointsToPath(points) {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    return (
        `M${first.x.toFixed(1)},${first.y.toFixed(1)} ` +
        rest.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    );
}

/**
 * Finger-drawn signature capture. No native dependency — draws directly
 * with react-native-svg, which is already in package.json.
 *
 * Ref API:
 * - clear()     — wipes the pad
 * - isEmpty()   — true if nothing has been drawn
 * - getPaths()  — array of SVG path strings (send as "proof" to backend
 *                 alongside the delivery-complete mutation; a real app
 *                 could rasterize this to a PNG with react-native-view-shot
 *                 if the backend specifically needs an image file)
 *
 * Props:
 * - onChange?: (isSigned: boolean) => void — fires after each stroke ends
 */
const SignaturePad = forwardRef(function SignaturePad(
    { height = 160, strokeColor = '#111', backgroundColor = 'transparent', onChange },
    ref,
) {
    const [paths, setPaths] = useState([]);
    const [, forceRender] = useState(0);
    const activePoints = useRef([]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                activePoints.current = [
                    { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY },
                ];
                forceRender((t) => t + 1);
            },
            onPanResponderMove: (e) => {
                activePoints.current = [
                    ...activePoints.current,
                    { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY },
                ];
                forceRender((t) => t + 1);
            },
            onPanResponderRelease: () => {
                if (activePoints.current.length > 1) {
                    setPaths((prev) => {
                        const next = [...prev, pointsToPath(activePoints.current)];
                        onChange?.(true);
                        return next;
                    });
                }
                activePoints.current = [];
            },
        }),
    ).current;

    useImperativeHandle(ref, () => ({
        clear: () => {
            setPaths([]);
            activePoints.current = [];
            onChange?.(false);
        },
        isEmpty: () => paths.length === 0,
        getPaths: () => paths,
    }));

    return (
        <View
            style={[styles.pad, { height, backgroundColor }]}
            {...panResponder.panHandlers}
        >
            <Svg width="100%" height="100%">
                {paths.map((d, i) => (
                    <Path
                        key={i}
                        d={d}
                        stroke={strokeColor}
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}
                {activePoints.current.length > 1 && (
                    <Path
                        d={pointsToPath(activePoints.current)}
                        stroke={strokeColor}
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
            </Svg>
        </View>
    );
});

const styles = StyleSheet.create({
    pad: {
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
});

export default SignaturePad;
