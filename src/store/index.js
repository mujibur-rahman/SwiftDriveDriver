// driver-app/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import driverReducer from './slices/driverSlice';
import earningsReducer from './slices/earningsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driver: driverReducer,
    earnings: earningsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
