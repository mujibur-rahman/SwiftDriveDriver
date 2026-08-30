// src/features/food/foodApi.js
import { apiSlice } from '@/features/api/apiSlice';
import { setFoodOrderStatus, clearActiveFoodOrder } from '@/features/food/foodSlice';

export const foodApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        acceptFoodOrder: builder.mutation({
            query: ({ orderId }) => ({
                url: `/orders/${orderId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: ['Food'],
        }),

        rejectFoodOrder: builder.mutation({
            query: ({ orderId, reason }) => ({
                url: `/orders/${orderId}/reject`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Food'],
        }),

        completeFoodDelivery: builder.mutation({
            query: ({ orderId, deliveryMethod, photoUri }) => ({
                url: `/orders/${orderId}/complete`,
                method: 'POST',
                body: { deliveryMethod, photoUri },
            }),
            invalidatesTags: ['Earnings', 'Food'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Earnings were already bumped optimistically in goComplete();
                    // no need to call updateTodayStats here — that would double-count.
                    dispatch(setFoodOrderStatus('completed'));
                } catch {
                    /* UI already completed optimistically */
                }
            },
        }),
    }),
});

export const {
    useAcceptFoodOrderMutation,
    useRejectFoodOrderMutation,
    useCompleteFoodDeliveryMutation,
} = foodApi;