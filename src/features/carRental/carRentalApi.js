// src/features/carRental/carRentalApi.js
import { apiSlice } from '@/features/api/apiSlice';
import { setCarRentalOrderStatus } from '@/features/carRental/carRentalSlice';

export const carRentalApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        acceptCarRentalOrder: builder.mutation({
            query: ({ orderId }) => ({
                url: `/orders/${orderId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: ['CarRental'],
        }),

        rejectCarRentalOrder: builder.mutation({
            query: ({ orderId, reason }) => ({
                url: `/orders/${orderId}/reject`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['CarRental'],
        }),

        /**
         * Fired once per photo the instant it's captured — same "log it now"
         * convention as shop's item-status. `set` distinguishes the
         * pre-trip vs return capture without needing two endpoints.
         */
        submitVehiclePhoto: builder.mutation({
            query: ({ orderId, phase, set, side, photoUri }) => ({
                url: `/car-rental/${orderId}/photos`,
                method: 'POST',
                body: { phase, set, side, photoUri },
            }),
        }),

        submitRenterId: builder.mutation({
            query: ({ orderId, photoUri }) => ({
                url: `/car-rental/${orderId}/renter-id`,
                method: 'POST',
                body: { photoUri },
            }),
        }),

        /**
         * Both parties (driver + renter) confirming the joint walkaround —
         * this is what stands in for a signature in this build.
         */
        confirmJointWalkaround: builder.mutation({
            query: ({ orderId }) => ({
                url: `/car-rental/${orderId}/confirm-walkaround`,
                method: 'POST',
            }),
        }),

        /** Collection-only — logs any new damage found vs the pre-trip photos. */
        submitDamageReport: builder.mutation({
            query: ({ orderId, found, notes, photos }) => ({
                url: `/car-rental/${orderId}/damage-report`,
                method: 'POST',
                body: { found, notes, photos },
            }),
        }),

        completeCarRentalOrder: builder.mutation({
            query: ({ orderId, phase, handoffPhotoUri }) => ({
                url: `/orders/${orderId}/complete`,
                method: 'POST',
                body: {
                    deliveryMethod: phase === 'collection' ? 'car_rental_collection' : 'car_rental_delivery',
                    photoUri: handoffPhotoUri || null,
                },
            }),
            invalidatesTags: ['Earnings', 'CarRental'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(setCarRentalOrderStatus('completed'));
                } catch {
                    /* optimistic UI already advanced */
                }
            },
        }),
    }),
});

export const {
    useAcceptCarRentalOrderMutation,
    useRejectCarRentalOrderMutation,
    useSubmitVehiclePhotoMutation,
    useSubmitRenterIdMutation,
    useConfirmJointWalkaroundMutation,
    useSubmitDamageReportMutation,
    useCompleteCarRentalOrderMutation,
} = carRentalApi;
