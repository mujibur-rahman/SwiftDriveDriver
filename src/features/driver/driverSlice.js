import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOnline: false,
  currentLocation: null,
  incomingRide: null, // ride request pending decision
  activeRide: null, // accepted/ongoing ride
  rideStatus: "idle", // idle | incoming | accepted | arrived | ongoing | completed
  passenger: null,
  loading: false,
  error: null,
  todayStats: { trips: 0, earnings: 0, hours: 0 },
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {},
});

export const {} = driverSlice.actions;
export default driverSlice.reducer;
