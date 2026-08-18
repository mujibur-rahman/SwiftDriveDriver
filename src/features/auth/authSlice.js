import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "@/features/api/apiSlice";

const initialState = {
  accessToken: null,
  driver: null,
};

// ========== Logout Thunk ==========
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // 1. Clear storage
    await AsyncStorage.multiRemove(["token", "driver"]);

    // 2. Clear RTK Query cache
    dispatch(apiSlice.util.resetApiState());
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    driverLoggedIn: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.driver = action.payload.driver;
    },
    driverLoggedOut: (state) => {
      state.accessToken = null;
      state.driver = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutDriver.fulfilled, (state) => {
      state.accessToken = null;
      state.driver = null;
    });
  },
});

export const { driverLoggedIn, driverLoggedOut } = authSlice.actions;
export default authSlice.reducer;
