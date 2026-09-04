import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/features/api/apiSlice";
import { directionsApi } from "@/features/directions/directionsApi";
import authReducer from "@/features/auth/authSlice";
import driverReducer from "@/features/driver/driverSlice";
import earningsReducer from "@/features/earnings/earningsSlice";
import foodReducer from "@/features/food/foodSlice";
import parcelReducer from "@/features/parcel/parcelSlice";
import gigReducer from "@/features/gig/gigSlice";
import shopReducer from "@/features/shop/shopSlice";
import marketplaceReducer from "@/features/marketplace/marketplaceSlice";
import carRentalReducer from "@/features/carRental/carRentalSlice";

// inject endpoints register করতে side-effect import
import "@/features/auth/authApi";
import "@/features/driver/driverApi";
import "@/features/earnings/earningsApi";
import "@/features/food/foodApi";
import "@/features/parcel/parcelApi";
import "@/features/gig/gigApi";
import "@/features/shop/shopApi";
import "@/features/marketplace/marketplaceApi";
import "@/features/carRental/carRentalApi";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [directionsApi.reducerPath]: directionsApi.reducer,
    auth: authReducer,
    driver: driverReducer,
    earnings: earningsReducer,
    food: foodReducer,
    parcel: parcelReducer,
    gig: gigReducer,
    shop: shopReducer,
    marketplace: marketplaceReducer,
    carRental: carRentalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware,
      directionsApi.middleware,
    ),
});