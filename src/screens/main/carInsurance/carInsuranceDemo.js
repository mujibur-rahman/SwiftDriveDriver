// src/screens/main/carInsurance/carInsuranceDemo.js

// ── Pre-policy job — routine inspection before a new policy is issued ──
export const DEMO_PRE_POLICY = {
    orderNumber: 'CI-3301',
    phase: 'pre_policy',

    vehicle: 'Honda Civic 2021 · Silver',
    plate: 'XYZ-9081',
    policyNumber: 'POL-558214',

    ownerName: 'David Chen',
    ownerAddress: '18 Cleveland St, Chippendale NSW 2008',
    ownerCoords: { latitude: -33.8858, longitude: 151.199 },
    ownerPhone: '+61434567890',

    distanceToOwner: '3.1 km',
    durationToOwner: '11 min',

    baseFare: 14.0,
    tip: 0,

    routeToOwner: [
        { latitude: -33.878, longitude: 151.207 },
        { latitude: -33.882, longitude: 151.203 },
        { latitude: -33.8858, longitude: 151.199 },
    ],
};

// ── Claim job — post-incident inspection for a damage claim ────────────
export const DEMO_CLAIM = {
    orderNumber: 'CI-4472-C',
    phase: 'claim',

    vehicle: 'Mazda 3 2020 · Blue',
    plate: 'LMN-4456',
    claimNumber: 'CLM-90213',
    incidentSummary: 'Rear-end collision at a traffic light, minor bumper damage reported.',

    claimantName: 'Sarah Ahmed',
    claimantAddress: '7 King St, Newtown NSW 2042',
    claimantCoords: { latitude: -33.8978, longitude: 151.1791 },
    claimantPhone: '+61445678901',

    distanceToClaimant: '4.5 km',
    durationToClaimant: '15 min',

    baseFare: 20.0, // claim inspections pay more — time-sensitive, more documentation
    tip: 0,

    routeToClaimant: [
        { latitude: -33.878, longitude: 151.207 },
        { latitude: -33.888, longitude: 151.19 },
        { latitude: -33.8978, longitude: 151.1791 },
    ],
};

export const DEMO_DRIVER = { latitude: -33.878, longitude: 151.207 };

export function getCarInsuranceTotal(job = DEMO_PRE_POLICY) {
    return (job.baseFare || 0) + (job.tip || 0);
}
