import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// TODO: env দিয়ে manage করুন
// const BASE_URL = 'http://10.0.2.2:8000/api/v1';
const BASE_URL = "http://192.168.0.101:3000";

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
    // optional: api.dispatch(driverLoggedOut());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Driver", "Auth", "Ride", "Earnings"],
  endpoints: () => ({}),
});
