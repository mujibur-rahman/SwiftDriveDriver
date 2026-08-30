// src/features/earnings/earningsApi.js
import { apiSlice } from '@/features/api/apiSlice';

export const earningsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /drivers/earnings?period=week
    getEarnings: builder.query({
      query: ({ period = 'week' } = {}) => `/drivers/earnings?period=${period}`,
      providesTags: ['Earnings'],
    }),

    // GET /drivers/rides/history
    getRideHistory: builder.query({
      query: () => '/drivers/rides/history',
      providesTags: ['Earnings', 'Ride'],
      transformResponse: (res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.rides)) return res.rides;
        if (Array.isArray(res?.data?.rides)) return res.data.rides;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.history)) return res.history;
        return [];
      },
    }),
  }),
});

export const {
  useGetEarningsQuery,
  useGetRideHistoryQuery,
} = earningsApi;

