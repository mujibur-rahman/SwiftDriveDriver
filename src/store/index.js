import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/features/api/apiSlice";
import authReducer from "@/features/auth/authSlice";
import driverReducer from "./slices/driverSlice"; // আপাতত পুরনো
import earningsReducer from "./slices/earningsSlice";

// inject endpoints register করতে side-effect import
import "@/features/auth/authApi";
import "@/features/driver/driverApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driver: driverReducer,
    earnings: earningsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware,
    ),
});