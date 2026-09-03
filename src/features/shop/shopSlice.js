// src/features/shop/shopSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * "Shop for me" flow state. Structure mirrors parcelSlice.js / gigSlice.js /
 * marketplaceSlice.js for consistency (enabled / orderStatus / activeOrder /
 * incomingOrder / error), PLUS shop-only fields — unlike food there's no
 * fixed pre-priced order, the driver actively shops a list, so live item
 * state has to live somewhere a screen remount can't lose it.
 *
 * orderStatus: idle | searching | incoming | active | completed
 * item.status: pending | found | unavailable | pending_approval | substituted | skipped
 */
const initialState = {
    enabled: false,
    orderStatus: 'idle',
    activeOrder: null,
    incomingOrder: null,
    items: [],
    runningTotal: 0,
    budgetLimit: 0,
    shoppingStartedAt: null,
    receiptPhotoUri: null,
    actualTotal: null,
    error: null,
};

// Only found/substituted items count toward what the customer is actually
// charged — unavailable/skipped items are refunded, pending_approval items
// aren't confirmed yet so they don't count until resolved either way.
const recalcTotal = (items = []) =>
    items.reduce((sum, item) => {
        if (item.status === 'found' || item.status === 'substituted') {
            const unitPrice = Number(item.actualPrice ?? item.price) || 0;
            return sum + unitPrice * (item.qty || 1);
        }
        return sum;
    }, 0);

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        setShopEnabled: (state, action) => {
            state.enabled = Boolean(action.payload);
            if (action.payload) {
                if (state.orderStatus === 'idle') state.orderStatus = 'searching';
            } else if (state.orderStatus === 'searching') {
                state.orderStatus = 'idle';
            }
        },
        setShopOrderStatus: (state, action) => {
            state.orderStatus = action.payload;
        },
        setIncomingShopOrder: (state, action) => {
            state.incomingOrder = action.payload;
            state.orderStatus = 'incoming';
        },
        clearIncomingShopOrder: (state) => {
            state.incomingOrder = null;
            if (state.orderStatus === 'incoming') state.orderStatus = 'idle';
        },
        setActiveShopOrder: (state, action) => {
            const order = action.payload;
            state.activeOrder = order;
            state.orderStatus = order ? 'active' : state.orderStatus;
            state.items = Array.isArray(order?.items)
                ? order.items.map((it) => ({ ...it, status: it.status || 'pending' }))
                : [];
            state.budgetLimit = order?.budgetLimit || 0;
            state.runningTotal = recalcTotal(state.items);
            state.shoppingStartedAt = null;
            state.receiptPhotoUri = null;
            state.actualTotal = null;
        },
        clearActiveShopOrder: (state) => {
            state.activeOrder = null;
            state.incomingOrder = null;
            state.items = [];
            state.runningTotal = 0;
            state.budgetLimit = 0;
            state.shoppingStartedAt = null;
            state.receiptPhotoUri = null;
            state.actualTotal = null;
            state.orderStatus = state.enabled ? 'searching' : 'idle';
        },
        startShoppingTimer: (state) => {
            state.shoppingStartedAt = new Date().toISOString();
        },
        // Single entry point for every item transition (found / unavailable /
        // pending_approval / substituted / skipped). Recalculating the total
        // in the same reducer means a dispatch can never race a stale total —
        // no separate "recalculate" action to remember to call afterwards.
        updateItemStatus: (state, action) => {
            const { itemId, status, actualPrice, substitutedWith } = action.payload;
            const item = state.items.find((it) => it.id === itemId);
            if (!item) return;
            item.status = status;
            if (actualPrice !== undefined) item.actualPrice = actualPrice;
            if (substitutedWith !== undefined) item.substitutedWith = substitutedWith;
            state.runningTotal = recalcTotal(state.items);
        },
        setShopReceipt: (state, action) => {
            const { receiptPhotoUri, actualTotal } = action.payload;
            if (receiptPhotoUri !== undefined) state.receiptPhotoUri = receiptPhotoUri;
            if (actualTotal !== undefined) state.actualTotal = actualTotal;
        },
        setShopError: (state, action) => {
            state.error = action.payload;
        },
        resetShopState: () => initialState,
    },
});

export const {
    setShopEnabled,
    setShopOrderStatus,
    setIncomingShopOrder,
    clearIncomingShopOrder,
    setActiveShopOrder,
    clearActiveShopOrder,
    startShoppingTimer,
    updateItemStatus,
    setShopReceipt,
    setShopError,
    resetShopState,
} = shopSlice.actions;

export default shopSlice.reducer;

export const selectShopEnabled = (s) => s.shop.enabled;
export const selectShopOrderStatus = (s) => s.shop.orderStatus;
export const selectIncomingShopOrder = (s) => s.shop.incomingOrder;
export const selectActiveShopOrder = (s) => s.shop.activeOrder;
export const selectShopItems = (s) => s.shop.items;
export const selectShopRunningTotal = (s) => s.shop.runningTotal;
export const selectShopBudgetLimit = (s) => s.shop.budgetLimit;

// Derived guard for the "Continue to checkout" CTA — every item must be
// resolved (nothing left "pending") before the driver can proceed. Kept as
// a selector (not a boolean re-computed inline in the screen) so any future
// consumer — e.g. a badge on the tab bar — reads the exact same rule.
export const selectAllShopItemsResolved = (s) =>
    s.shop.items.length > 0 && s.shop.items.every((it) => it.status !== 'pending');

// True while any item is waiting on the customer's substitute approval —
// drives the "review" step gate before checkout.
export const selectHasPendingApprovalItems = (s) =>
    s.shop.items.some((it) => it.status === 'pending_approval');
