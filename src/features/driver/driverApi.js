import { apiSlice } from "@/features/api/apiSlice";
import {
  setActiveRide,
  setPassenger,
  setRideStatus,
  clearIncomingRide,
  setOnlineStatus,
  updateTodayStats,
} from "@/features/driver/driverSlice";

export const driverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Queries ──────────────────────────────────────────
    getTodayEarnings: builder.query({
      query: (period = "today") => `/drivers/earnings?period=${period}`,
      providesTags: ["Driver"],
    }),

    /** Active / recovered ride — single source of truth in cache */
    getActiveRide: builder.query({
      query: () => "/drivers/active-ride",
      providesTags: ["Ride"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.ride) {
            dispatch(setActiveRide(data.ride));
            dispatch(setPassenger(data.passenger));
            dispatch(setRideStatus(data.ride.status));
            dispatch(setOnlineStatus(true));
          }
        } catch {
          // no active ride
        }
      },
    }),

    // ── Mutations ────────────────────────────────────────
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
        body,
      }),
      invalidatesTags: ["Driver"],
    }),

    acceptRide: builder.mutation({
      query: (rideId) => ({
        url: `/rides/${rideId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Ride"],
      async onQueryStarted(_rideId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Keep UI slice in sync (sockets + screens still read these)
          dispatch(setActiveRide(data.ride));
          dispatch(setPassenger(data.passenger));
          dispatch(setRideStatus("accepted"));
          dispatch(clearIncomingRide());
          // Patch cache so getActiveRide readers stay fresh
          dispatch(
            driverApi.util.updateQueryData(
              "getActiveRide",
              undefined,
              (draft) => {
                if (!draft) return data;
                draft.ride = data.ride;
                draft.passenger = data.passenger;
              },
            ),
          );
        } catch {
          // component handles via .unwrap()
        }
      },
    }),

    rejectRide: builder.mutation({
      query: (rideId) => ({
        url: `/rides/${rideId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Ride"],
      async onQueryStarted(_rideId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearIncomingRide());
          dispatch(setRideStatus("idle"));
        } catch {
          // ignore — timeout / already expired
        }
      },
    }),

    startRide: builder.mutation({
      query: (rideId) => ({
        url: `/rides/${rideId}/start`,
        method: "POST",
      }),
      invalidatesTags: ["Ride"],
      async onQueryStarted(_rideId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setActiveRide(data.ride));
          dispatch(setRideStatus("ongoing"));
          dispatch(
            driverApi.util.updateQueryData(
              "getActiveRide",
              undefined,
              (draft) => {
                if (!draft) return;
                draft.ride = data.ride;
              },
            ),
          );
        } catch { }
      },
    }),

    completeRide: builder.mutation({
      query: (rideId) => ({
        url: `/rides/${rideId}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Ride", "Driver"],
      async onQueryStarted(_rideId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setRideStatus("completed"));
          dispatch(
            updateTodayStats({
              tripsDelta: 1,
              earningsDelta: data.ride?.fare || 0,
            }),
          );
          // Optional: clear active-ride cache
          dispatch(
            driverApi.util.updateQueryData(
              "getActiveRide",
              undefined,
              (draft) => {
                if (!draft) return;
                draft.ride = null;
                draft.passenger = null;
              },
            ),
          );
        } catch { }
      },
    }),
  }),
});

export const {
  useGetTodayEarningsQuery,
  useGetActiveRideQuery,
  useLazyGetActiveRideQuery,
  useUpdateDriverStatusMutation,
  useUpdateDriverPreferenceMutation,
  useAcceptRideMutation,
  useRejectRideMutation,
  useStartRideMutation,
  useCompleteRideMutation,
} = driverApi;