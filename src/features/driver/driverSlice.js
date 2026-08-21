// src/features/driver/driverSlice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * Local + socket-driven UI state only.
 * Server ride data is owned by RTK Query (getActiveRide + mutations).
 * This slice stays for:
 *  - socket pushes (incomingRide, location)
 *  - optimistic online flag
 *  - screen flow flags (rideStatus) shared with sockets
 */
const initialState = {
  isOnline: false,
  currentLocation: null,
  incomingRide: null,
  activeRide: null,
  rideStatus: "idle", // idle | incoming | accepted | arrived | ongoing | completed
  passenger: null,
  error: null,
  todayStats: { trips: 0, earnings: 0, hours: 0 },
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setIncomingRide: (state, action) => {
      state.incomingRide = action.payload;
      state.rideStatus = "incoming";
    },
    clearIncomingRide: (state) => {
      state.incomingRide = null;
      if (state.rideStatus === "incoming") state.rideStatus = "idle";
    },
    setPassenger: (state, action) => {
      state.passenger = action.payload;
    },
    setRideStatus: (state, action) => {
      state.rideStatus = action.payload;
    },
    setActiveRide: (state, action) => {
      state.activeRide = action.payload;
    },
    updateTodayStats: (state, action) => {
      const p = action.payload || {};
      if (p.trips != null) state.todayStats.trips = p.trips;
      if (p.earnings != null) state.todayStats.earnings = p.earnings;
      if (p.hours != null) state.todayStats.hours = p.hours;
      // deltas from completeRide onQueryStarted
      if (p.tripsDelta) state.todayStats.trips += p.tripsDelta;
      if (p.earningsDelta) state.todayStats.earnings += p.earningsDelta;
    },
    resetActiveRide: (state) => {
      state.activeRide = null;
      state.passenger = null;
      state.rideStatus = "idle";
      state.incomingRide = null;
    },
    clearActiveRide: (state) => {
      state.activeRide = null;
      state.passenger = null;
      state.rideStatus = "idle";
      state.incomingRide = null;
    },
    setDriverError: (state, action) => {
      state.error = action.payload;
    },
  },
  // No extraReducers / addMatcher — API side effects live in driverApi onQueryStarted
});

export const {
  setOnlineStatus,
  setCurrentLocation,
  setIncomingRide,
  clearIncomingRide,
  setPassenger,
  setRideStatus,
  setActiveRide,
  updateTodayStats,
  resetActiveRide,
  clearActiveRide,
  setDriverError,
} = driverSlice.actions;

export default driverSlice.reducer;

export const selectDriverUi = (s) => s.driver;
export const selectRideStatus = (s) => s.driver.rideStatus;
export const selectIncomingRide = (s) => s.driver.incomingRide;
export const selectActiveRideLocal = (s) => s.driver.activeRide;