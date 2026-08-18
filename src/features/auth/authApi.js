import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiSlice } from "@/features/api/apiSlice";
import { driverLoggedIn } from "@/features/auth/authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginDriver: builder.mutation({
      query: ({ phone, password }) => ({
        url: "/login", // আপনার backend route
        method: "POST",
        body: { phone, password },
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.accessToken || data.token;
          const driver = data.driver || data.user;

          if (token) {
            await AsyncStorage.setItem("token", token);
          }
          if (driver) {
            await AsyncStorage.setItem("driver", JSON.stringify(driver));
          }

          dispatch(
            driverLoggedIn({
              accessToken: token,
              driver,
            }),
          );
        } catch (_) {
          // error UI-তে mutation-এর error থেকে handle হবে
        }
      },
    }),

    registerDriver: builder.mutation({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body: {
          name: body.name,
          phone: body.phone,
          email: body.email,
          password: body.password,
        },
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.accessToken || data.token;
          const driver = data.driver || data.user;

          // Register-এর পর auto-login চাইলে:
          if (token) {
            await AsyncStorage.setItem("token", token);
            if (driver) {
              await AsyncStorage.setItem("driver", JSON.stringify(driver));
            }
            dispatch(
              driverLoggedIn({
                accessToken: token,
                driver,
              }),
            );
          }
          // Auto-login না চাইলে শুধু success return — screen থেকে Login-এ navigate
        } catch (_) {}
      },
    }),
  }),
});

export const { useLoginDriverMutation, useRegisterDriverMutation } = authApi;
