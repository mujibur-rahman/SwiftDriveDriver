// src/screens/main/marketplace/marketplaceDemo.js
export const DEMO = {
    orderNumber: 'MP-2210',
    // Item being picked up (from listing)
    itemTitle: 'Wooden accent chair',
    itemPrice: 65.0,
    listingSource: 'Facebook Marketplace',
    itemPhotoUri: null, // listing photo — null shows a placeholder swatch in UI
    // Buyer-provided verification code. Shown to the driver as a barcode at
    // pickup so the SELLER can confirm this driver is genuinely acting for
    // the buyer who booked the item — not an impersonator/scalper trying to
    // grab the listing before the real buyer's courier arrives.
    pickupCode: 'BYR-71D9K2',
    // 'prepaid' | 'cod_cash' | 'cod_card' — drives whether the
    // "Collect Payment" step appears at drop-off at all.
    paymentMode: 'cod_cash',
    // Seller (pickup)
    seller: 'Maria',
    sellerAddress: '9 King St, Newtown NSW 2042',
    sellerCoords: { latitude: -33.8978, longitude: 151.1795 },
    sellerPhone: '+61298123456',
    // Buyer (drop-off)
    buyerName: 'David',
    buyerAddress: '14 Regent St, Redfern NSW 2016',
    buyerCoords: { latitude: -33.8932, longitude: 151.2031 },
    buyerPhone: '+61412987654',
    distanceToPickup: '3.1 km',
    durationToPickup: '10 min',
    distanceToDropoff: '4.1 km',
    durationToDropoff: '13 min',
    baseFare: 8.0,
    tip: 0,
    routeToPickup: [
        { latitude: -33.876, longitude: 151.203 },
        { latitude: -33.884, longitude: 151.196 },
        { latitude: -33.891, longitude: 151.187 },
        { latitude: -33.8978, longitude: 151.1795 },
    ],
    routeToDropoff: [
        { latitude: -33.8978, longitude: 151.1795 },
        { latitude: -33.897, longitude: 151.2 },
        { latitude: -33.8932, longitude: 151.2031 },
    ],
};

export const DEMO_DRIVER = { latitude: -33.876, longitude: 151.203 };

export function getPickupTotal(job = DEMO) {
    // Driver's own earning — the item price is NOT part of this, see the
    // cashCollected note wired through to DeliverySummaryScreen.
    return (job.baseFare || 0) + (job.tip || 0);
}
