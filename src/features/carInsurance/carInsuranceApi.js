// src/features/carInsurance/carInsuranceApi.js
import { apiSlice } from '@/features/api/apiSlice';
import { setCarInsuranceOrderStatus } from '@/features/carInsurance/carInsuranceSlice';

export const carInsuranceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        acceptCarInsuranceOrder: builder.mutation({
            query: ({ orderId }) => ({
                url: `/orders/${orderId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: ['CarInsurance'],
        }),

        rejectCarInsuranceOrder: builder.mutation({
            query: ({ orderId, reason }) => ({
                url: `/orders/${orderId}/reject`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['CarInsurance'],
        }),

        /** pre_policy only — VIN plate photo + typed number, cross-checked server-side against the policy. */
        submitVin: builder.mutation({
            query: ({ orderId, photoUri, number }) => ({
                url: `/car-insurance/${orderId}/vin`,
                method: 'POST',
                body: { photoUri, number },
            }),
        }),

        /** pre_policy only — fired once per side, same "log it now" convention as carRental's photo endpoint. */
        submitConditionPhoto: builder.mutation({
            query: ({ orderId, side, photoUri }) => ({
                url: `/car-insurance/${orderId}/condition-photo`,
                method: 'POST',
                body: { side, photoUri },
            }),
        }),

        submitOwnerConsent: builder.mutation({
            query: ({ orderId }) => ({
                url: `/car-insurance/${orderId}/owner-consent`,
                method: 'POST',
            }),
        }),

        /** claim only — one call per damage photo added, since the list is open-ended. */
        submitDamagePhoto: builder.mutation({
            query: ({ orderId, photoUri, note }) => ({
                url: `/car-insurance/${orderId}/damage-photo`,
                method: 'POST',
                body: { photoUri, note },
            }),
        }),

        /** claim only — incident narrative + optional police report reference. */
        submitIncidentDetails: builder.mutation({
            query: ({ orderId, notes, policeReportNumber }) => ({
                url: `/car-insurance/${orderId}/incident`,
                method: 'POST',
                body: { notes, policeReportNumber },
            }),
        }),

        /** claim only — triage tag for whichever adjuster picks this claim up next. */
        submitSeverity: builder.mutation({
            query: ({ orderId, severity }) => ({
                url: `/car-insurance/${orderId}/severity`,
                method: 'POST',
                body: { severity },
            }),
        }),

        submitClaimantConsent: builder.mutation({
            query: ({ orderId }) => ({
                url: `/car-insurance/${orderId}/claimant-consent`,
                method: 'POST',
            }),
        }),

        completeCarInsuranceOrder: builder.mutation({
            query: ({ orderId, phase }) => ({
                url: `/orders/${orderId}/complete`,
                method: 'POST',
                body: {
                    deliveryMethod: phase === 'claim' ? 'car_insurance_claim' : 'car_insurance_pre_policy',
                },
            }),
            invalidatesTags: ['Earnings', 'CarInsurance'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(setCarInsuranceOrderStatus('completed'));
                } catch {
                    /* optimistic UI already advanced */
                }
            },
        }),
    }),
});

export const {
    useAcceptCarInsuranceOrderMutation,
    useRejectCarInsuranceOrderMutation,
    useSubmitVinMutation,
    useSubmitConditionPhotoMutation,
    useSubmitOwnerConsentMutation,
    useSubmitDamagePhotoMutation,
    useSubmitIncidentDetailsMutation,
    useSubmitSeverityMutation,
    useSubmitClaimantConsentMutation,
    useCompleteCarInsuranceOrderMutation,
} = carInsuranceApi;
