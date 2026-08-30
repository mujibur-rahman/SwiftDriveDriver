// src/features/parcel/parcelSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Parcel-delivery only UI / flow state.
 * Shared driver state (isOnline, location, todayStats) stays in driverSlice.
 * Structure mirrors foodSlice.js exactly for consistency.
 */
const initialState = {
    enabled: false,
    orderStatus: 'idle', // idle | searching | incoming | active | completed
    activeOrder: null,
    incomingOrder: null,
    error: null,
};

const parcelSlice = createSlice({
    name: 'parcel',
    initialState,
    reducers: {
        setParcelEnabled: (state, action) => {
            state.enabled = Boolean(action.payload);
            if (action.payload) {
                if (state.orderStatus === 'idle') state.orderStatus = 'searching';
            } else if (state.orderStatus === 'searching') {
                state.orderStatus = 'idle';
            }
        },
        setParcelOrderStatus: (state, action) => {
            state.orderStatus = action.payload;
        },
        setIncomingParcelOrder: (state, action) => {
            state.incomingOrder = action.payload;
            state.orderStatus = 'incoming';
        },
        clearIncomingParcelOrder: (state) => {
            state.incomingOrder = null;
            if (state.orderStatus === 'incoming') state.orderStatus = 'idle';
        },
        setActiveParcelOrder: (state, action) => {
            state.activeOrder = action.payload;
            state.orderStatus = action.payload ? 'active' : state.orderStatus;
        },
        clearActiveParcelOrder: (state) => {
            state.activeOrder = null;
            state.incomingOrder = null;
            state.orderStatus = state.enabled ? 'searching' : 'idle';
        },
        setParcelError: (state, action) => {
            state.error = action.payload;
        },
        resetParcelState: () => initialState,
    },
});

export const {
    setParcelEnabled,
    setParcelOrderStatus,
    setIncomingParcelOrder,
    clearIncomingParcelOrder,
    setActiveParcelOrder,
    clearActiveParcelOrder,
    setParcelError,
    resetParcelState,
} = parcelSlice.actions;

export default parcelSlice.reducer;

export const selectParcelEnabled = (s) => s.parcel.enabled;
export const selectParcelOrderStatus = (s) => s.parcel.orderStatus;
export const selectIncomingParcelOrder = (s) => s.parcel.incomingOrder;
export const selectActiveParcelOrder = (s) => s.parcel.activeOrder;
