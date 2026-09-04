// src/features/carRental/carRentalSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Car Rental has two separate driver jobs per rental — "delivery" (drive
 * the car from the depot to the renter) and "collection" (drive it back
 * from the renter to the depot, days later, possibly a different driver).
 * One slice covers both; `phase` says which leg the active job is.
 *
 * orderStatus: idle | searching | incoming | active | completed
 *
 * Photos are keyed by side so a fixed, well-known set (front/back/left/
 * right/odometer/fuel) is easy to render as a grid AND easy to compare
 * side-by-side later — collection reads `preTripPhotos` from the job
 * itself (fetched from the server, captured during delivery) to diff
 * against the new `returnPhotos` it captures.
 */
const PHOTO_SIDES = ['front', 'back', 'left', 'right', 'odometer', 'fuel'];

const emptyPhotoSet = () => PHOTO_SIDES.reduce((acc, side) => ({ ...acc, [side]: null }), {});

const initialState = {
    enabled: false,
    orderStatus: 'idle',
    activeOrder: null,
    incomingOrder: null,
    phase: 'delivery', // 'delivery' | 'collection'

    // Delivery-leg capture
    preTripPhotos: emptyPhotoSet(),
    renterIdPhotoUri: null,
    renterConfirmed: false,

    // Collection-leg capture — preTripPhotos here is READ from the job
    // payload (what the delivery driver captured), not re-captured.
    returnPhotos: emptyPhotoSet(),
    damageFound: false,
    damageNotes: '',
    damagePhotos: [],

    error: null,
};

const carRentalSlice = createSlice({
    name: 'carRental',
    initialState,
    reducers: {
        setCarRentalEnabled: (state, action) => {
            state.enabled = Boolean(action.payload);
            if (action.payload) {
                if (state.orderStatus === 'idle') state.orderStatus = 'searching';
            } else if (state.orderStatus === 'searching') {
                state.orderStatus = 'idle';
            }
        },
        setCarRentalOrderStatus: (state, action) => {
            state.orderStatus = action.payload;
        },
        setIncomingCarRentalOrder: (state, action) => {
            state.incomingOrder = action.payload;
            state.orderStatus = 'incoming';
        },
        clearIncomingCarRentalOrder: (state) => {
            state.incomingOrder = null;
            if (state.orderStatus === 'incoming') state.orderStatus = 'idle';
        },
        // phase comes from the job itself (job.phase) — a delivery job and
        // a collection job are never the same activeOrder.
        setActiveCarRentalOrder: (state, action) => {
            const order = action.payload;
            state.activeOrder = order;
            state.orderStatus = order ? 'active' : state.orderStatus;
            state.phase = order?.phase || 'delivery';
            state.preTripPhotos = order?.preTripPhotos
                ? { ...emptyPhotoSet(), ...order.preTripPhotos }
                : emptyPhotoSet();
            state.returnPhotos = emptyPhotoSet();
            state.renterIdPhotoUri = null;
            state.renterConfirmed = false;
            state.damageFound = false;
            state.damageNotes = '';
            state.damagePhotos = [];
        },
        clearActiveCarRentalOrder: (state) => {
            state.activeOrder = null;
            state.incomingOrder = null;
            state.preTripPhotos = emptyPhotoSet();
            state.returnPhotos = emptyPhotoSet();
            state.renterIdPhotoUri = null;
            state.renterConfirmed = false;
            state.damageFound = false;
            state.damageNotes = '';
            state.damagePhotos = [];
            state.orderStatus = state.enabled ? 'searching' : 'idle';
        },
        // One action for both photo sets — `set` says which ('preTripPhotos'
        // | 'returnPhotos') so the same reducer serves both phases instead
        // of two near-duplicate actions.
        setVehiclePhoto: (state, action) => {
            const { set, side, uri } = action.payload;
            if (!state[set]) return;
            state[set][side] = uri;
        },
        setRenterIdPhoto: (state, action) => {
            state.renterIdPhotoUri = action.payload;
        },
        setRenterConfirmed: (state, action) => {
            state.renterConfirmed = Boolean(action.payload);
        },
        setDamageReport: (state, action) => {
            const { found, notes, photos } = action.payload;
            if (found !== undefined) state.damageFound = found;
            if (notes !== undefined) state.damageNotes = notes;
            if (photos !== undefined) state.damagePhotos = photos;
        },
        setCarRentalError: (state, action) => {
            state.error = action.payload;
        },
        resetCarRentalState: () => initialState,
    },
});

export const {
    setCarRentalEnabled,
    setCarRentalOrderStatus,
    setIncomingCarRentalOrder,
    clearIncomingCarRentalOrder,
    setActiveCarRentalOrder,
    clearActiveCarRentalOrder,
    setVehiclePhoto,
    setRenterIdPhoto,
    setRenterConfirmed,
    setDamageReport,
    setCarRentalError,
    resetCarRentalState,
} = carRentalSlice.actions;

export default carRentalSlice.reducer;

export const selectCarRentalEnabled = (s) => s.carRental.enabled;
export const selectCarRentalOrderStatus = (s) => s.carRental.orderStatus;
export const selectIncomingCarRentalOrder = (s) => s.carRental.incomingOrder;
export const selectActiveCarRentalOrder = (s) => s.carRental.activeOrder;
export const selectCarRentalPhase = (s) => s.carRental.phase;
export const selectPreTripPhotos = (s) => s.carRental.preTripPhotos;
export const selectReturnPhotos = (s) => s.carRental.returnPhotos;

// Guard for the "Continue" CTA on the inspection step — all required sides
// (everything except odometer/fuel readings, which are text-adjacent but
// modeled as photos of the dash) must be captured.
export const selectPreTripComplete = (s) =>
    Object.values(s.carRental.preTripPhotos).every(Boolean);
export const selectReturnComplete = (s) =>
    Object.values(s.carRental.returnPhotos).every(Boolean);

export { PHOTO_SIDES };
