import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiSlice } from "@/features/api/apiSlice";
import { driverLoggedIn, driverLoggedOut } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginDriver: builder.mutation({
      query: ({ phone, password }) => ({
        url: "/login",
        method: "POST",
        body: { phone, password }, // server maps phone → email
      }),

      // optimistic updates
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.accessToken || data.token;

          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("driver", JSON.stringify(data.driver));

          dispatch(
            driverLoggedIn({
              accessToken: token,
              driver: data.driver,
            }),
          );
        } catch (error) {}
      },
    }),

    registerDriver: builder.mutation({
      query: (body) => ({
        url: "/register", // json-server-auth endpoint ← must match server
        method: "POST",
        body: {
          name: body.name,
          phone: body.phone,
          email: body.email,
          password: body.password,
        },
      }),

      // optimistic updates
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.accessToken || data.token;

          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("driver", JSON.stringify(data.driver));

          dispatch(
            driverLoggedOut({
              accessToken: token,
              driver: data.driver,
            }),
          );
        } catch (error) {}
      },
    }),
  }),
});

export const { useLoginDriverMutation, useRegisterDriverMutation } = authApi;
