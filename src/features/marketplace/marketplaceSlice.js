// src/features/marketplace/marketplaceSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * marketplace UI / flow state (boilerplate — mirror food).
 * Status: idle | searching | incoming | active | completed
 */
const initialState = {
};

const marketplaceSlice = createSlice({
    name: 'marketplace',
    initialState,
    reducers: {
    },
});

export const { } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
