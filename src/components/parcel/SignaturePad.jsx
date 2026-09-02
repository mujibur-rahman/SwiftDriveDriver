// src/components/parcel/SignaturePad.jsx
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { pointsToPath } from '@/utils/helpers';

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
            className="pad"
            style={[{ height, backgroundColor }]}
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

export default SignaturePad;
