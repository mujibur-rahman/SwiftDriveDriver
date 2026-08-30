// src/features/parcel/parcelApi.js
import { apiSlice } from '@/features/api/apiSlice';

export const parcelApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // enpoinds here
    }),
});

export const {
} = parcelApi;
