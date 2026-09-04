// src/screens/main/carRental/carRentalDemo.js

// ── Delivery job — drive the car from the depot to the renter ──────────
export const DEMO_DELIVERY = {
    orderNumber: 'CR-7710',
    phase: 'delivery',

    vehicle: 'Toyota Corolla 2023 · White',
    plate: 'ABC-1234',

    depot: 'Zyro Depot — Alexandria',
    depotAddress: '55 Euston Rd, Alexandria NSW 2015',
    depotCoords: { latitude: -33.9068, longitude: 151.1959 },

    renterName: 'Priya S.',
    renterAddress: '22 Bourke St, Waterloo NSW 2017',
    renterCoords: { latitude: -33.8996, longitude: 151.2073 },
    renterPhone: '+61423456789',

    rentalPeriod: '3 days (Sep 5 – Sep 8)',

    distanceToDepot: '2.4 km',
    durationToDepot: '8 min',
    distanceToRenter: '1.6 km',
    durationToRenter: '6 min',

    baseFare: 12.0,
    tip: 0,

    routeToDepot: [
        { latitude: -33.895, longitude: 151.19 },
        { latitude: -33.902, longitude: 151.194 },
        { latitude: -33.9068, longitude: 151.1959 },
    ],
    routeToRenter: [
        { latitude: -33.9068, longitude: 151.1959 },
        { latitude: -33.903, longitude: 151.202 },
        { latitude: -33.8996, longitude: 151.2073 },
    ],
};

// ── Collection job — drive the car back from the renter to the depot ──
// preTripPhotos are pre-populated as if fetched from the server — this is
// what the delivery driver captured days earlier, used for the return
// walkaround comparison. In a real backend this comes from GET /car-rental/:id.
export const DEMO_COLLECTION = {
    ...DEMO_DELIVERY,
    orderNumber: 'CR-7710-R',
    phase: 'collection',
    rentalPeriod: 'Return due today, 6:00 PM',
    baseFare: 12.0,
    tip: 2.0,
    preTripPhotos: {
        front: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
        back: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400',
        left: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400',
        right: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400',
        odometer: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
        fuel: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
    },
};

export const DEMO_DRIVER = { latitude: -33.895, longitude: 151.19 };

export function getCarRentalTotal(job = DEMO_DELIVERY) {
    return (job.baseFare || 0) + (job.tip || 0);
}
