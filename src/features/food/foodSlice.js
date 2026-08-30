// src/features/food/foodSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Food-delivery only UI / flow state.
 * Shared driver state (isOnline, location, todayStats) stays in driverSlice.
 */
const initialState = {
    enabled: false,
    orderStatus: 'idle', // idle | searching | incoming | active | completed
    activeOrder: null,
    incomingOrder: null,
    error: null,
};

const foodSlice = createSlice({
    name: 'food',
    initialState,
    reducers: {
        setFoodEnabled: (state, action) => {
            state.enabled = Boolean(action.payload);
            if (action.payload) {
                // parent should only enable when online
                if (state.orderStatus === 'idle') state.orderStatus = 'searching';
            } else if (state.orderStatus === 'searching') {
                state.orderStatus = 'idle';
            }
        },
        setFoodOrderStatus: (state, action) => {
            state.orderStatus = action.payload;
        },
        setIncomingFoodOrder: (state, action) => {
            state.incomingOrder = action.payload;
            state.orderStatus = 'incoming';
        },
        clearIncomingFoodOrder: (state) => {
            state.incomingOrder = null;
            if (state.orderStatus === 'incoming') state.orderStatus = 'idle';
        },
        setActiveFoodOrder: (state, action) => {
            state.activeOrder = action.payload;
            state.orderStatus = action.payload ? 'active' : state.orderStatus;
        },
        clearActiveFoodOrder: (state) => {
            state.activeOrder = null;
            state.incomingOrder = null;
            state.orderStatus = state.enabled ? 'searching' : 'idle';
        },
        setFoodError: (state, action) => {
            state.error = action.payload;
        },
        resetFoodState: () => initialState,
    },
});

export const {
    setFoodEnabled,
    setFoodOrderStatus,
    setIncomingFoodOrder,
    clearIncomingFoodOrder,
    setActiveFoodOrder,
    clearActiveFoodOrder,
    setFoodError,
    resetFoodState,
} = foodSlice.actions;

export default foodSlice.reducer;

export const selectFoodEnabled = (s) => s.food.enabled;
export const selectFoodOrderStatus = (s) => s.food.orderStatus;
export const selectIncomingFoodOrder = (s) => s.food.incomingOrder;
export const selectActiveFoodOrder = (s) => s.food.activeOrder;