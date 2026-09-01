// src/features/gig/gigApi.js
import { apiSlice } from '@/features/api/apiSlice';
import { setGigOrderStatus } from '@/features/gig/gigSlice';

export const gigApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    acceptGigOrder: builder.mutation({
      query: ({ orderId }) => ({
        url: `/orders/${orderId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Gig'],
    }),

    rejectGigOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Gig'],
    }),

    /**
     * Complete a gig job.
     * Body can include beforePhotoUri, afterPhotoUri, notes, checklist.
     * Server reuses the shared /orders/:id/complete endpoint.
     */
    completeGigJob: builder.mutation({
      query: ({
        orderId,
        beforePhotoUri,
        afterPhotoUri,
        notes,
        checklist,
      }) => ({
        url: `/orders/${orderId}/complete`,
        method: 'POST',
        body: {
          deliveryMethod: 'gig_job',
          photoUri: afterPhotoUri || beforePhotoUri || null,
          beforePhotoUri: beforePhotoUri || null,
          afterPhotoUri: afterPhotoUri || null,
          notes: notes || null,
          checklist: checklist || null,
        },
      }),
      invalidatesTags: ['Earnings', 'Gig'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Earnings already bumped optimistically in goComplete();
          // avoid double-count via updateTodayStats.
          dispatch(setGigOrderStatus('completed'));
        } catch {
          /* UI already completed optimistically */
        }
      },
    }),
  }),
});

export const {
  useAcceptGigOrderMutation,
  useRejectGigOrderMutation,
  useCompleteGigJobMutation,
} = gigApi;
