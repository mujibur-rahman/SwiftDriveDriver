// src/features/shop/shopApi.js
import { apiSlice } from '@/features/api/apiSlice';
import { setShopOrderStatus } from '@/features/shop/shopSlice';

export const shopApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        acceptShopOrder: builder.mutation({
            query: ({ orderId }) => ({
                url: `/orders/${orderId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: ['Shop'],
        }),

        rejectShopOrder: builder.mutation({
            query: ({ orderId, reason }) => ({
                url: `/orders/${orderId}/reject`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Shop'],
        }),

        /**
         * Shop-specific — fired the moment the driver marks one item
         * found/unavailable/skipped. Same "log it now, don't wait for
         * /complete" convention as marketplace's verify-item. Optimistic:
         * the screen dispatches updateItemStatus (shopSlice) BEFORE calling
         * this, so the checklist UI never blocks on the network.
         */
        updateShopItemStatus: builder.mutation({
            query: ({ orderId, itemId, status, actualPrice }) => ({
                url: `/shop/${orderId}/items/${itemId}/status`,
                method: 'PATCH',
                body: { status, actualPrice },
            }),
        }),

        /**
         * Shop-specific — driver proposes a substitute for an unavailable
         * item. Marks it pending_approval server-side; a real backend would
         * push this to the customer over the socket for a yes/no. Kept
         * separate from updateShopItemStatus because it carries extra
         * payload (photo + substitute name/price) other transitions don't.
         */
        requestItemSubstitution: builder.mutation({
            query: ({ orderId, itemId, substituteName, substitutePrice, substitutePhotoUri }) => ({
                url: `/shop/${orderId}/items/${itemId}/substitute`,
                method: 'POST',
                body: { substituteName, substitutePrice, substitutePhotoUri },
            }),
        }),

        /**
         * Shop-specific — receipt photo + actual till total, logged the
         * moment the driver leaves the store. Separate from /complete so
         * it's on record even if the drop-off leg fails for some reason.
         */
        submitShopReceipt: builder.mutation({
            query: ({ orderId, receiptPhotoUri, actualTotal }) => ({
                url: `/shop/${orderId}/receipt`,
                method: 'POST',
                body: { receiptPhotoUri, actualTotal },
            }),
        }),

        completeShopOrder: builder.mutation({
            query: ({ orderId, handoffPhotoUri, deliveryMethod, receiptPhotoUri, actualTotal }) => ({
                url: `/orders/${orderId}/complete`,
                method: 'POST',
                body: {
                    deliveryMethod: deliveryMethod || 'shop_for_me',
                    photoUri: handoffPhotoUri || receiptPhotoUri || null,
                    itemPhotoUri: receiptPhotoUri || null,
                    notes: actualTotal != null ? `actualTotal:${actualTotal}` : null,
                },
            }),
            invalidatesTags: ['Earnings', 'Shop'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Earnings were already bumped optimistically in
                    // goComplete() (ShopDeliveryScreen.js) — same
                    // convention as parcelApi.js / marketplaceApi.js.
                    // Don't call updateTodayStats here, that would
                    // double-count.
                    dispatch(setShopOrderStatus('completed'));
                } catch {
                    /* optimistic UI already advanced */
                }
            },
        }),
    }),
});

export const {
    useAcceptShopOrderMutation,
    useRejectShopOrderMutation,
    useUpdateShopItemStatusMutation,
    useRequestItemSubstitutionMutation,
    useSubmitShopReceiptMutation,
    useCompleteShopOrderMutation,
} = shopApi;
