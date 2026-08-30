// src/features/parcel/parcelSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Parcel-delivery UI / flow state (boilerplate — mirror food).
 * Status: idle | searching | incoming | active | completed
 */
const initialState = {
};

const parcelSlice = createSlice({
    name: 'parcel',
    initialState,
    reducers: {
    },
});

export const { } = parcelSlice.actions;
export default parcelSlice.reducer;
