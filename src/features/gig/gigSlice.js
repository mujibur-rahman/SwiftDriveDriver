// src/features/gig/gigSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Gig-jobs only UI / flow state.
 * Shared driver state (isOnline, location, todayStats) stays in driverSlice.
 * Structure mirrors foodSlice / parcelSlice for consistency.
 *
 * Status: idle | searching | incoming | active | completed
 */
const initialState = {
  enabled: false,
  orderStatus: 'idle', // idle | searching | incoming | active | completed
  activeOrder: null,
  incomingOrder: null,
  error: null,
};

const gigSlice = createSlice({
  name: 'gig',
  initialState,
  reducers: {
    setGigEnabled: (state, action) => {
      state.enabled = Boolean(action.payload);
      if (action.payload) {
        if (state.orderStatus === 'idle') state.orderStatus = 'searching';
      } else if (state.orderStatus === 'searching') {
        state.orderStatus = 'idle';
      }
    },
    setGigOrderStatus: (state, action) => {
      state.orderStatus = action.payload;
    },
    setIncomingGigOrder: (state, action) => {
      state.incomingOrder = action.payload;
      state.orderStatus = 'incoming';
    },
    clearIncomingGigOrder: (state) => {
      state.incomingOrder = null;
      if (state.orderStatus === 'incoming') state.orderStatus = 'idle';
    },
    setActiveGigOrder: (state, action) => {
      state.activeOrder = action.payload;
      state.orderStatus = action.payload ? 'active' : state.orderStatus;
    },
    clearActiveGigOrder: (state) => {
      state.activeOrder = null;
      state.incomingOrder = null;
      state.orderStatus = state.enabled ? 'searching' : 'idle';
    },
    setGigError: (state, action) => {
      state.error = action.payload;
    },
    resetGigState: () => initialState,
  },
});

export const {
  setGigEnabled,
  setGigOrderStatus,
  setIncomingGigOrder,
  clearIncomingGigOrder,
  setActiveGigOrder,
  clearActiveGigOrder,
  setGigError,
  resetGigState,
} = gigSlice.actions;

export default gigSlice.reducer;

export const selectGigEnabled = (s) => s.gig.enabled;
export const selectGigOrderStatus = (s) => s.gig.orderStatus;
export const selectIncomingGigOrder = (s) => s.gig.incomingOrder;
export const selectActiveGigOrder = (s) => s.gig.activeOrder;
