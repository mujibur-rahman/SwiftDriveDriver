// src/features/parcel/parcelApi.js
import { apiSlice } from '@/features/api/apiSlice';
import { setParcelOrderStatus } from '@/features/parcel/parcelSlice';

export const parcelApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        acceptParcelOrder: builder.mutation({
            query: ({ orderId }) => ({
                url: `/orders/${orderId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: ['Parcel'],
        }),

        rejectParcelOrder: builder.mutation({
            query: ({ orderId, reason }) => ({
                url: `/orders/${orderId}/reject`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Parcel'],
        }),

        /**
         * Parcel-specific — no equivalent in foodApi. Driver scans one
         * barcode/QR at pickup; called once per parcel in a multi-parcel
         * order. Fire-and-forget from the UI (see ParcelDeliveryScreen) so
         * scanning stays instant even on a slow connection.
         */
        scanParcel: builder.mutation({
            query: ({ orderId, parcelId }) => ({
                url: `/parcels/${parcelId}/scan`,
                method: 'POST',
                body: { orderId },
            }),
        }),

        completeParcelDelivery: builder.mutation({
            query: ({ orderId, deliveryMethod, photoUri, signatureData }) => ({
                url: `/orders/${orderId}/complete`,
                method: 'POST',
                body: { deliveryMethod, photoUri, signatureData },
            }),
            invalidatesTags: ['Earnings', 'Parcel'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Earnings were already bumped optimistically in goComplete();
                    // no need to call updateTodayStats here — that would double-count.
                    dispatch(setParcelOrderStatus('completed'));
                } catch {
                    /* UI already completed optimistically */
                }
            },
        }),
    }),
});

export const {
    useAcceptParcelOrderMutation,
    useRejectParcelOrderMutation,
    useScanParcelMutation,
    useCompleteParcelDeliveryMutation,
} = parcelApi;
