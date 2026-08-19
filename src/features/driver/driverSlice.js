import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOnline: false,
  currentLocation: null,
  incomingRide: null, // ride request pending decision
  activeRide: null, // accepted/ongoing ride
  rideStatus: "idle", // idle | incoming | accepted | arrived | ongoing | completed
  passenger: null,
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {},
});

export const {} = driverSlice.actions;
export default driverSlice.reducer;

