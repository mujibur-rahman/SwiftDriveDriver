import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const BASE_URL = 'http://10.0.2.2:8000/api/v1';
const BASE_URL = "http://192.168.0.101:3000"; // আপনার URL

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    await AsyncStorage.multiRemove(["token", "driver"]);
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Driver"],
  endpoints: () => ({}),
});

// // driver-app/src/services/api.js
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'http://10.0.2.2:8000/api/v1';

// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// api.interceptors.response.use(
//   (r) => r,
//   async (err) => {
//     if (err.response?.status === 401) {
//       await AsyncStorage.multiRemove(['token', 'driver']);
//     }
//     return Promise.reject(err);
//   },
// );

// export default api;
