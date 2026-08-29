// src/hooks/useDirections.js
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLazyGetDirectionsQuery } from '@/features/directions/directionsApi';

// Haversine distance in meters between two {latitude, longitude} points.
function distanceMeters(a, b) {
    const R = 6371000;
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
    const lat1 = (a.latitude * Math.PI) / 180;
    const lat2 = (b.latitude * Math.PI) / 180;
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const DEVIATION_THRESHOLD_M = 50; // re-route once driver strays this far off route
const MIN_REFETCH_INTERVAL_MS = 15000; // floor between calls, protects Directions API billing
const STEP_ARRIVAL_RADIUS_M = 30; // "close enough" to a step's end point to advance

/**
 * Live turn-by-turn routing driven by the driver's socket-reported location.
 *
 * currentLocation comes from Redux (state.driver.currentLocation), which
 * DriverSocketContext.updateLocation() keeps in sync via
 * dispatch(setCurrentLocation(coords)) on every GPS tick. This hook watches
 * that value and re-fetches Directions only when the driver has actually
 * moved far enough and enough time has passed — not on every tick.
 *
 * @param {{latitude:number, longitude:number} | null} destination
 */
export function useDirections(destination) {
    const currentLocation = useSelector((s) => s.driver.currentLocation);

    const [trigger, { data, isFetching, error }] = useLazyGetDirectionsQuery();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const lastFetchOrigin = useRef(null);
    const lastFetchTime = useRef(0);

    // Reset step tracking whenever the destination changes (new leg of the trip)
    useEffect(() => {
        setCurrentStepIndex(0);
        lastFetchOrigin.current = null;
        lastFetchTime.current = 0;
    }, [destination?.latitude, destination?.longitude]);

    // Fetch / re-fetch the route as the driver moves
    useEffect(() => {
        if (!currentLocation || !destination) return;

        const now = Date.now();
        const movedFar =
            !lastFetchOrigin.current ||
            distanceMeters(lastFetchOrigin.current, currentLocation) > DEVIATION_THRESHOLD_M;
        const enoughTimePassed = now - lastFetchTime.current > MIN_REFETCH_INTERVAL_MS;

        if (movedFar && enoughTimePassed) {
            trigger({ origin: currentLocation, destination });
            lastFetchOrigin.current = currentLocation;
            lastFetchTime.current = now;
        }
    }, [currentLocation, destination, trigger]);

    // Advance to whichever step the driver hasn't reached yet
    useEffect(() => {
        if (!data?.steps?.length || !currentLocation) return;

        const idx = data.steps.findIndex(
            (step) => distanceMeters(currentLocation, step.endLocation) > STEP_ARRIVAL_RADIUS_M,
        );
        setCurrentStepIndex(idx === -1 ? data.steps.length - 1 : idx);
    }, [currentLocation, data]);

    return {
        routeCoordinates: data?.coordinates ?? [],
        steps: data?.steps ?? [],
        currentStep: data?.steps?.[currentStepIndex] ?? null,
        distanceText: data?.distanceText,
        durationText: data?.durationText,
        isLoading: isFetching,
        error,
    };
}