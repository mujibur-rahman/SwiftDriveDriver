// src/features/directions/directionsApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { decodePolyline } from '@/utils/polyline';

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const directionsApi = createApi({
    reducerPath: 'directionsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://maps.googleapis.com/maps/api/directions/',
    }),
    endpoints: (builder) => ({
        getDirections: builder.query({
            query: ({ origin, destination }) => ({
                url: 'json',
                params: {
                    origin: `${origin.latitude},${origin.longitude}`,
                    destination: `${destination.latitude},${destination.longitude}`,
                    mode: 'driving',
                    key: GOOGLE_KEY,
                },
            }),
            // Raw Google response → shape our app actually consumes
            transformResponse: (response) => {
                if (response.status !== 'OK' || !response.routes?.length) {
                    throw new Error(response.error_message || 'Route not found');
                }
                const route = response.routes[0];
                const leg = route.legs[0];

                return {
                    coordinates: decodePolyline(route.overview_polyline.points),
                    distanceText: leg.distance.text,
                    durationText: leg.duration.text,
                    steps: leg.steps.map((s) => ({
                        instruction: s.html_instructions.replace(/<[^>]*>/g, ''), // strip HTML tags
                        maneuver: s.maneuver ?? 'straight',
                        distanceText: s.distance.text,
                        endLocation: {
                            latitude: s.end_location.lat,
                            longitude: s.end_location.lng,
                        },
                    })),
                };
            },
            // Avoid refetching identical origin/destination pairs too aggressively
            keepUnusedDataFor: 30,
        }),
    }),
});

export const { useGetDirectionsQuery, useLazyGetDirectionsQuery } = directionsApi;