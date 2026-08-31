// src/features/shop/shopSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * shop UI / flow state (boilerplate — mirror food).
 * Status: idle | searching | incoming | active | completed
 */
const initialState = {
};

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
    },
});

export const { } = shopSlice.actions;
export default shopSlice.reducer;
