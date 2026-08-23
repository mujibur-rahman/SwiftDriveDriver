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
      providesTags: ['Earnings'],
      transformResponse: (res) => res.rides ?? [],
    }),
  }),
});

export const {
  useGetEarningsQuery,
  useGetRideHistoryQuery,
} = earningsApi;
