// driver-app/src/store/slices/earningsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchEarnings = createAsyncThunk('earnings/fetch', async ({ period = 'week' }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/drivers/earnings?period=${period}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchRideHistory = createAsyncThunk('earnings/history', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/drivers/rides/history');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const earningsSlice = createSlice({
  name: 'earnings',
  initialState: {
    summary: null,
    history: [],
    loading: false,
    period: 'week',
    chartData: [],
  },
  reducers: {
    setPeriod: (state, action) => { state.period = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEarnings.pending, (state) => { state.loading = true; })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.chartData = action.payload.chartData || [];
      })
      .addCase(fetchEarnings.rejected, (state) => { state.loading = false; })
      .addCase(fetchRideHistory.fulfilled, (state, action) => {
        state.history = action.payload.rides || [];
      });
  },
});

export const { setPeriod } = earningsSlice.actions;
export default earningsSlice.reducer;
