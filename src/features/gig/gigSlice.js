// src/features/gig/gigSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * gig UI / flow state (boilerplate — mirror food).
 * Status: idle | searching | incoming | active | completed
 */
const initialState = {
};

const gigSlice = createSlice({
    name: 'gig',
    initialState,
    reducers: {
    },
});

export const { } = gigSlice.actions;
export default gigSlice.reducer;
