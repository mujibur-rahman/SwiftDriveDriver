import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/features/api/apiSlice";
import { directionsApi } from "@/features/directions/directionsApi";
import authReducer from "@/features/auth/authSlice";
import driverReducer from "@/features/driver/driverSlice";
import earningsReducer from "@/features/earnings/earningsSlice";

// inject endpoints register করতে side-effect import
import "@/features/auth/authApi";
import "@/features/driver/driverApi";
import "@/features/earnings/earningsApi";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [directionsApi.reducerPath]: directionsApi.reducer,
    auth: authReducer,
    driver: driverReducer,
    earnings: earningsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware,
      directionsApi.middleware,
    ),
});