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

    /** Status ping: on_the_way / arrived etc. */
    updateGigStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: 'POST',
        body: { status },
      }),
    }),

    completeGigJob: builder.mutation({
      query: ({
        orderId,
        beforePhotoUri,
        afterPhotoUri,
        arrivalPhotoUri,
        notes,
        checklist,
        extraWork,
      }) => ({
        url: `/orders/${orderId}/complete`,
        method: 'POST',
        body: {
          deliveryMethod: 'gig_job',
          photoUri: afterPhotoUri || beforePhotoUri || null,
          beforePhotoUri: beforePhotoUri || null,
          afterPhotoUri: afterPhotoUri || null,
          arrivalPhotoUri: arrivalPhotoUri || null,
          notes: notes || null,
          checklist: checklist || null,
          extraWork: extraWork || null,
        },
      }),
      invalidatesTags: ['Earnings', 'Gig'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(setGigOrderStatus('waiting_confirm'));
        } catch {
          /* optimistic UI */
        }
      },
    }),

    confirmGigCompletion: builder.mutation({
      query: ({ orderId, rating, review }) => ({
        url: `/orders/${orderId}/confirm`,
        method: 'POST',
        body: { rating, review },
      }),
      invalidatesTags: ['Earnings', 'Gig'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(setGigOrderStatus('completed'));
        } catch {
          /* ignore */
        }
      },
    }),
  }),
});

export const {
  useAcceptGigOrderMutation,
  useRejectGigOrderMutation,
  useUpdateGigStatusMutation,
  useCompleteGigJobMutation,
  useConfirmGigCompletionMutation,
} = gigApi;
