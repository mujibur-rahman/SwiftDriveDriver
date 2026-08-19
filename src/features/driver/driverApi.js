import { apiSlice } from "@/features/api/apiSlice";

export const driverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodayEarnings: builder.query({
      query: (period = "today") => `/drivers/earnings?period=${period}`,
      providesTags: ["Driver"],
    }),
    updateDriverStatus: builder.mutation({
      query: (body) => ({
        url: "/drivers/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Driver"],
    }),
    updateDriverPreference: builder.mutation({
      query: (body) => ({
        url: "/drivers/me",
        method: "PATCH",
        body, // { themePreference: "light" | "dark" | "system" }
      }),
      invalidatesTags: ["Driver"],
    }),
  }),
});

export const {
  useGetTodayEarningsQuery,
  useUpdateDriverStatusMutation,
  useUpdateDriverPreferenceMutation,
} = driverApi;

