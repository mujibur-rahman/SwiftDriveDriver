// src/features/carInsurance/carInsuranceSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Car Insurance covers two structurally different inspection types, not
 * one flow with two names — `phase` picks which:
 *  - 'pre_policy': routine, before a policy is issued. Fixed-shape capture
 *    (same 6-side grid as carRental's pre-trip inspection — reuses
 *    VehiclePhotoGrid) plus a VIN capture and owner sign-off.
 *  - 'claim': after an incident. Open-ended — however many damage points
 *    exist, so damagePhotos is an array the driver appends to, not a
 *    fixed set of named sides. Adds an incident narrative + severity tag
 *    an adjuster uses to triage, which pre-policy has no equivalent of.
 *
 * orderStatus: idle | searching | incoming | active | completed
 */
const PHOTO_SIDES = ['front', 'back', 'left', 'right', 'odometer', 'fuel'];
const emptyPhotoSet = () => PHOTO_SIDES.reduce((acc, side) => ({ ...acc, [side]: null }), {});

const initialState = {
    enabled: false,
    orderStatus: 'idle',
    activeOrder: null,
    incomingOrder: null,
    phase: 'pre_policy', // 'pre_policy' | 'claim'

    // ── pre_policy leg ──────────────────────────────────────────────
    ownerVerified: false,
    vinPhotoUri: null,
    vinNumber: '',
    conditionPhotos: emptyPhotoSet(),
    existingDamageFound: false,
    existingDamageNotes: '',
    ownerConsent: false,

    // ── claim leg ────────────────────────────────────────────────────
    claimantVerified: false,
    damagePhotos: [], // [{ id, uri, note }] — dynamic, not fixed sides
    incidentNotes: '',
    policeReportNumber: '',
    severity: null, // 'minor' | 'moderate' | 'severe'
    claimantConsent: false,

    error: null,
};

const carInsuranceSlice = createSlice({
    name: 'carInsurance',
    initialState,
    reducers: {
        setCarInsuranceEnabled: (state, action) => {
            state.enabled = Boolean(action.payload);
            if (action.payload) {
                if (state.orderStatus === 'idle') state.orderStatus = 'searching';
            } else if (state.orderStatus === 'searching') {
                state.orderStatus = 'idle';
            }
        },
        setCarInsuranceOrderStatus: (state, action) => {
            state.orderStatus = action.payload;
        },
        setIncomingCarInsuranceOrder: (state, action) => {
            state.incomingOrder = action.payload;
            state.orderStatus = 'incoming';
        },
        clearIncomingCarInsuranceOrder: (state) => {
            state.incomingOrder = null;
            if (state.orderStatus === 'incoming') state.orderStatus = 'idle';
        },
        // phase comes from the job itself — a pre_policy job and a claim
        // job are never the same activeOrder.
        setActiveCarInsuranceOrder: (state, action) => {
            const order = action.payload;
            state.activeOrder = order;
            state.orderStatus = order ? 'active' : state.orderStatus;
            state.phase = order?.phase || 'pre_policy';
            state.ownerVerified = false;
            state.vinPhotoUri = null;
            state.vinNumber = '';
            state.conditionPhotos = emptyPhotoSet();
            state.existingDamageFound = false;
            state.existingDamageNotes = '';
            state.ownerConsent = false;
            state.claimantVerified = false;
            state.damagePhotos = [];
            state.incidentNotes = order?.incidentSummary || '';
            state.policeReportNumber = '';
            state.severity = null;
            state.claimantConsent = false;
        },
        clearActiveCarInsuranceOrder: (state) => {
            state.activeOrder = null;
            state.incomingOrder = null;
            state.orderStatus = state.enabled ? 'searching' : 'idle';
        },
        setOwnerVerified: (state, action) => {
            state.ownerVerified = Boolean(action.payload);
        },
        setVinCapture: (state, action) => {
            const { photoUri, number } = action.payload;
            if (photoUri !== undefined) state.vinPhotoUri = photoUri;
            if (number !== undefined) state.vinNumber = number;
        },
        setConditionPhoto: (state, action) => {
            const { side, uri } = action.payload;
            state.conditionPhotos[side] = uri;
        },
        setExistingDamage: (state, action) => {
            const { found, notes } = action.payload;
            if (found !== undefined) state.existingDamageFound = found;
            if (notes !== undefined) state.existingDamageNotes = notes;
        },
        setOwnerConsent: (state, action) => {
            state.ownerConsent = Boolean(action.payload);
        },
        setClaimantVerified: (state, action) => {
            state.claimantVerified = Boolean(action.payload);
        },
        // Dynamic list — one reducer to append, one to edit the note, one
        // to remove. No fixed "slot count" the way conditionPhotos has.
        addDamagePhoto: (state, action) => {
            state.damagePhotos.push(action.payload); // { id, uri, note }
        },
        updateDamagePhotoNote: (state, action) => {
            const { id, note } = action.payload;
            const photo = state.damagePhotos.find((p) => p.id === id);
            if (photo) photo.note = note;
        },
        removeDamagePhoto: (state, action) => {
            state.damagePhotos = state.damagePhotos.filter((p) => p.id !== action.payload);
        },
        setIncidentNotes: (state, action) => {
            state.incidentNotes = action.payload;
        },
        setPoliceReportNumber: (state, action) => {
            state.policeReportNumber = action.payload;
        },
        setSeverity: (state, action) => {
            state.severity = action.payload;
        },
        setClaimantConsent: (state, action) => {
            state.claimantConsent = Boolean(action.payload);
        },
        setCarInsuranceError: (state, action) => {
            state.error = action.payload;
        },
        resetCarInsuranceState: () => initialState,
    },
});

export const {
    setCarInsuranceEnabled,
    setCarInsuranceOrderStatus,
    setIncomingCarInsuranceOrder,
    clearIncomingCarInsuranceOrder,
    setActiveCarInsuranceOrder,
    clearActiveCarInsuranceOrder,
    setOwnerVerified,
    setVinCapture,
    setConditionPhoto,
    setExistingDamage,
    setOwnerConsent,
    setClaimantVerified,
    addDamagePhoto,
    updateDamagePhotoNote,
    removeDamagePhoto,
    setIncidentNotes,
    setPoliceReportNumber,
    setSeverity,
    setClaimantConsent,
    setCarInsuranceError,
    resetCarInsuranceState,
} = carInsuranceSlice.actions;

export default carInsuranceSlice.reducer;

export const selectCarInsuranceEnabled = (s) => s.carInsurance.enabled;
export const selectCarInsuranceOrderStatus = (s) => s.carInsurance.orderStatus;
export const selectIncomingCarInsuranceOrder = (s) => s.carInsurance.incomingOrder;
export const selectActiveCarInsuranceOrder = (s) => s.carInsurance.activeOrder;
export const selectCarInsurancePhase = (s) => s.carInsurance.phase;
export const selectConditionPhotos = (s) => s.carInsurance.conditionPhotos;
export const selectDamagePhotos = (s) => s.carInsurance.damagePhotos;

// Guards for each phase's CTAs
export const selectConditionComplete = (s) => Object.values(s.carInsurance.conditionPhotos).every(Boolean);
export const selectClaimPhotosReady = (s) => s.carInsurance.damagePhotos.length > 0;

export { PHOTO_SIDES };
