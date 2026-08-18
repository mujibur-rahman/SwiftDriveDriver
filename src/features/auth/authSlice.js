import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "@/features/api/apiSlice";

const initialState = {
  accessToken: null,
  driver: null,
  // hydrate করার সময় loading
  isHydrated: false,
};

/** App start-এ AsyncStorage থেকে token/driver restore */
export const hydrateAuth = createAsyncThunk("auth/hydrate", async () => {
  const [[, token], [, driverStr]] = await AsyncStorage.multiGet([
    "token",
    "driver",
  ]);
  let driver = null;
  if (driverStr) {
    try {
      driver = JSON.parse(driverStr);
    } catch (_) {}
  }
  return { accessToken: token || null, driver };
});

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
    updateDriverProfile: (state, action) => {
      if (state.driver) {
        state.driver = { ...state.driver, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.driver = action.payload.driver;
        state.isHydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isHydrated = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.driver = null;
      });
  },
});

export const { driverLoggedIn, driverLoggedOut, updateDriverProfile } =
  authSlice.actions;

export default authSlice.reducer;

// selectors
export const selectIsAuthenticated = (s) => !!s.auth.accessToken;
export const selectDriver = (s) => s.auth.driver;
export const selectAuthHydrated = (s) => s.auth.isHydrated;
