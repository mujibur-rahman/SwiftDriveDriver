// src/features/marketplace/marketplaceApi.js
import { apiSlice } from '@/features/api/apiSlice';
import { setMarketplaceOrderStatus } from '@/features/marketplace/marketplaceSlice';

export const marketplaceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        acceptMarketplaceOrder: builder.mutation({
            query: ({ orderId }) => ({
                url: `/orders/${orderId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: ['Marketplace'],
        }),

        rejectMarketplaceOrder: builder.mutation({
            query: ({ orderId, reason }) => ({
                url: `/orders/${orderId}/reject`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Marketplace'],
        }),

        /**
         * Marketplace-specific — the seller visually/scan-confirms the
         * buyer's verification code (shown as a barcode) matches. This is
         * an anti-fraud check, separate from item-condition verification.
         */
        confirmPickupCode: builder.mutation({
            query: ({ orderId, code }) => ({
                url: `/marketplace/${orderId}/confirm-code`,
                method: 'POST',
                body: { code },
            }),
        }),

        /**
         * Marketplace-specific — no barcode exists for a used item, so
         * pickup is verified with a photo instead (see ItemPhotoCompare in
         * MarketplaceSheetBody). Logged server-side as a lightweight
         * "verified" ping, separate from the final /complete call.
         */
        verifyMarketplaceItem: builder.mutation({
            query: ({ orderId, itemPhotoUri }) => ({
                url: `/marketplace/${orderId}/verify-item`,
                method: 'POST',
                body: { itemPhotoUri },
            }),
        }),

        /**
         * Marketplace-specific — only called when paymentMode !== 'prepaid'.
         * Records that the driver collected cash/card from the buyer on the
         * seller's behalf. This amount is NOT the driver's earning — see the
         * cashCollected note in DeliverySummaryScreen.
         */
        collectMarketplacePayment: builder.mutation({
            query: ({ orderId, amount, method }) => ({
                url: `/marketplace/${orderId}/collect-payment`,
                method: 'POST',
                body: { amount, method },
            }),
        }),

        completeMarketplacePickup: builder.mutation({
            query: ({ orderId, handoffPhotoUri, itemPhotoUri, paymentCollected }) => ({
                url: `/orders/${orderId}/complete`,
                method: 'POST',
                body: {
                    deliveryMethod: 'marketplace_pickup',
                    photoUri: handoffPhotoUri || itemPhotoUri || null,
                    itemPhotoUri: itemPhotoUri || null,
                    paymentCollected: !!paymentCollected,
                },
            }),
            invalidatesTags: ['Earnings', 'Marketplace'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Earnings were already bumped optimistically in
                    // goComplete() (MarketplacePickupScreen.js) — same
                    // convention as parcelApi.js. Don't call
                    // updateTodayStats here, that would double-count.
                    dispatch(setMarketplaceOrderStatus('completed'));
                } catch {
                    /* optimistic UI already advanced */
                }
            },
        }),
    }),
});

export const {
    useAcceptMarketplaceOrderMutation,
    useRejectMarketplaceOrderMutation,
    useConfirmPickupCodeMutation,
    useVerifyMarketplaceItemMutation,
    useCollectMarketplacePaymentMutation,
    useCompleteMarketplacePickupMutation,
} = marketplaceApi;
