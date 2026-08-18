// driver-app/src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import driverReducer from "./slices/driverSlice";
import earningsReducer from "./slices/earningsSlice";
import { apiSlice } from "@/features/api/apiSlice";

// register injected endpoints
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
    getDefaultMiddleware({ serializableCheck: false }).concat(apiSlice.middleware),
});




// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import driverReducer from './slices/driverSlice';
// import earningsReducer from './slices/earningsSlice';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     driver: driverReducer,
//     earnings: earningsReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({ serializableCheck: false }),
// });



// driver-app/src/store/index.js
// import { configureStore } from "@reduxjs/toolkit";
// import { apiSlice } from "@/features/api/apiSlice";
// // import authReducer from './slices/authSlice';
// import authReducer from "@/features/auth/authSlice";
// import driverReducer from "./slices/driverSlice";
// import earningsReducer from "./slices/earningsSlice";

// export const store = configureStore({
//   reducer: {
//     [apiSlice.reducerPath]: apiSlice.reducer,
//     auth: authReducer,
//     driver: driverReducer,
//     earnings: earningsReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({ serializableCheck: false }).concat(
//       apiSlice.middleware,
//     ),
// });
