import { apiSlice } from "@/features/api/apiSlice";

export const driverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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

export const { useUpdateDriverPreferenceMutation } = driverApi;
