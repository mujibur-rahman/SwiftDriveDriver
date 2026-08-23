// src/features/earnings/earningsSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Local UI state for the Earnings feature.
 * Server data (summary, history) is now managed by earningsApi (RTK Query).
 */
const earningsSlice = createSlice({
  name: 'earnings',
  initialState: {
    period: 'week',
  },
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
  },
});

export const { setPeriod } = earningsSlice.actions;
export default earningsSlice.reducer;
