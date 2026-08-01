// driver-app/src/store/slices/driverSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// export const acceptRide = createAsyncThunk('driver/acceptRide', async (rideId, { rejectWithValue }) => {
//   try {
//     const res = await api.post(`/rides/${rideId}/accept`);
//     return res.data;
//   } catch (err) {
//     return rejectWithValue(err.response?.data?.message || 'Failed to accept');
//   }
// });

// export const rejectRide = createAsyncThunk('driver/rejectRide', async (rideId, { rejectWithValue }) => {
//   try {
//     await api.post(`/rides/${rideId}/reject`);
//     return rideId;
//   } catch (err) {
//     console.warn('[rejectRide] error:', err.response?.data || err.message);
//     return rejectWithValue(err.response?.data?.message);
//   }
// });

export const rejectRide = createAsyncThunk('driver/rejectRide', 
  async (rideId, { rejectWithValue }) => {
    if (!rideId) return rejectWithValue('No ride ID');  // ← guard
    try {
      await api.post(`/rides/${rideId}/reject`);
      return rideId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed');
    }
  }
);

export const acceptRide = createAsyncThunk('driver/acceptRide',
  async (rideId, { rejectWithValue }) => {
    if (!rideId) return rejectWithValue('No ride ID');  // ← guard
    try {
      const res = await api.post(`/rides/${rideId}/accept`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed');
    }
  }
);

export const startRide = createAsyncThunk('driver/startRide', async (rideId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/rides/${rideId}/start`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const completeRide = createAsyncThunk('driver/completeRide', async (rideId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/rides/${rideId}/complete`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const recoverActiveRide = createAsyncThunk(
  'driver/recoverActiveRide',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/drivers/active-ride');
      return res.data;
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);

const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    isOnline: false,
    currentLocation: null,
    incomingRide: null,       // ride request pending decision
    activeRide: null,         // accepted/ongoing ride
    rideStatus: 'idle',       // idle | incoming | accepted | arrived | ongoing | completed
    passenger: null,
    loading: false,
    error: null,
    todayStats: { trips: 0, earnings: 0, hours: 0 },
  },
  reducers: {
    setOnlineStatus: (state, action) => { state.isOnline = action.payload; },
    setCurrentLocation: (state, action) => { state.currentLocation = action.payload; },
    setIncomingRide: (state, action) => {
      state.incomingRide = action.payload;
      state.rideStatus = 'incoming';
    },
    clearIncomingRide: (state) => {
      state.incomingRide = null;
      if (state.rideStatus === 'incoming') state.rideStatus = 'idle';
    },
    setPassenger: (state, action) => { state.passenger = action.payload; },
    setRideStatus: (state, action) => { state.rideStatus = action.payload; },
    updateTodayStats: (state, action) => {
      state.todayStats = { ...state.todayStats, ...action.payload };
    },
    resetActiveRide: (state) => {
      state.activeRide = null;
      state.passenger = null;
      state.rideStatus = 'idle';
      state.incomingRide = null;
    },
    setActiveRide: (state, action) => {
      state.activeRide = action.payload;
    },
    clearActiveRide: (state) => {
      state.activeRide  = null;
      state.passenger   = null;
      state.rideStatus  = 'idle';
      state.incomingRide = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(acceptRide.fulfilled, (state, action) => {
        state.activeRide = action.payload.ride;
        state.passenger = action.payload.passenger;
        state.rideStatus = 'accepted';
        state.incomingRide = null;
      })
      .addCase(acceptRide.rejected, (state, action) => {
        state.error = action.payload;
        state.rideStatus = 'idle';
        state.incomingRide = null;
      })
      .addCase(rejectRide.fulfilled, (state) => {
        state.incomingRide = null;
        state.rideStatus = 'idle';
      })
      .addCase(startRide.fulfilled, (state, action) => {
        state.activeRide = action.payload.ride;
        state.rideStatus = 'ongoing';
      })
      .addCase(completeRide.fulfilled, (state, action) => {
        state.rideStatus = 'completed';
        state.todayStats.trips += 1;
        state.todayStats.earnings += action.payload.ride?.fare || 0;
      })
      .addCase(recoverActiveRide.fulfilled, (state, action) => {
      if (action.payload?.ride) {
        state.activeRide  = action.payload.ride;
        state.passenger   = action.payload.passenger;
        state.rideStatus  = action.payload.ride.status; // 'accepted'|'arrived'|'ongoing'
        state.isOnline    = true;
      }
    });
  },
});

export const {
  setOnlineStatus, setCurrentLocation, setIncomingRide,
  clearIncomingRide, setPassenger, setRideStatus,
  updateTodayStats, resetActiveRide, setActiveRide,
  clearActiveRide, 
} = driverSlice.actions;
export default driverSlice.reducer;
