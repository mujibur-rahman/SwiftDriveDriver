// src/features/marketplace/marketplaceSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Marketplace-pickup only UI / flow state.
 * Status: idle | searching | incoming | active | completed
 * Structure mirrors parcelSlice.js / gigSlice.js exactly for consistency.
 */
const initialState = {
    enabled: false,
    orderStatus: 'idle',
    activeOrder: null,
    incomingOrder: null,
    error: null,
};

const marketplaceSlice = createSlice({
    name: 'marketplace',
    initialState,
    reducers: {
        setMarketplaceEnabled: (state, action) => {
            state.enabled = Boolean(action.payload);
            if (action.payload) {
                if (state.orderStatus === 'idle') state.orderStatus = 'searching';
            } else if (state.orderStatus === 'searching') {
                state.orderStatus = 'idle';
            }
        },
        setMarketplaceOrderStatus: (state, action) => {
            state.orderStatus = action.payload;
        },
        setIncomingMarketplaceOrder: (state, action) => {
            state.incomingOrder = action.payload;
            state.orderStatus = 'incoming';
        },
        clearIncomingMarketplaceOrder: (state) => {
            state.incomingOrder = null;
            if (state.orderStatus === 'incoming') state.orderStatus = 'idle';
        },
        setActiveMarketplaceOrder: (state, action) => {
            state.activeOrder = action.payload;
            state.orderStatus = action.payload ? 'active' : state.orderStatus;
        },
        clearActiveMarketplaceOrder: (state) => {
            state.activeOrder = null;
            state.incomingOrder = null;
            state.orderStatus = state.enabled ? 'searching' : 'idle';
        },
        setMarketplaceError: (state, action) => {
            state.error = action.payload;
        },
        resetMarketplaceState: () => initialState,
    },
});

export const {
    setMarketplaceEnabled,
    setMarketplaceOrderStatus,
    setIncomingMarketplaceOrder,
    clearIncomingMarketplaceOrder,
    setActiveMarketplaceOrder,
    clearActiveMarketplaceOrder,
    setMarketplaceError,
    resetMarketplaceState,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;

export const selectMarketplaceEnabled = (s) => s.marketplace.enabled;
export const selectMarketplaceOrderStatus = (s) => s.marketplace.orderStatus;
export const selectIncomingMarketplaceOrder = (s) => s.marketplace.incomingOrder;
export const selectActiveMarketplaceOrder = (s) => s.marketplace.activeOrder;
