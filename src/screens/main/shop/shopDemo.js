// src/screens/main/shop/shopDemo.js
export const DEMO = {
    orderNumber: 'SH-4821',

    // Store (shopping leg)
    store: 'Shwapno Supermarket',
    storeAddress: '283 Crown St, Surry Hills NSW 2010',
    storeCoords: { latitude: -33.8842, longitude: 151.2101 },
    storePhone: '+61291234567',

    // Customer (delivery leg)
    customerName: 'Alex M.',
    customerAddress: '14 Regent St, Redfern NSW 2016',
    customerCoords: { latitude: -33.8932, longitude: 151.2031 },
    customerPhone: '+61412345678',
    deliveryInstructions: 'Leave with concierge if no answer.',

    distanceToStore: '1.8 km',
    durationToStore: '6 min',
    distanceToCustomer: '2.1 km',
    durationToCustomer: '8 min',

    // Driver's own earning — base fare + tip only. The items themselves are
    // covered by the customer's pre-authorized budget hold, not the
    // driver's money (see getShopTotal below).
    baseFare: 9.0,
    tip: 1.5,

    // Max the customer authorized. Compared live against runningTotal
    // (shopSlice) while shopping, and against actualTotal at checkout.
    budgetLimit: 40.0,

    // Dynamic — any number of items, rendered via ShopItemRow.map(). Each
    // item's own `status` drives its row UI (see shopSlice item.status).
    items: [
        { id: 'i1', name: 'Fresh milk', qty: 2, unit: '1L', price: 3.2, note: 'Any brand is fine', status: 'pending' },
        { id: 'i2', name: 'Basmati rice', qty: 1, unit: '5kg', price: 12.5, note: 'Chinigura preferred', status: 'pending' },
        { id: 'i3', name: 'Red apples', qty: 1, unit: '1kg', price: 4.8, note: 'Firm, not overripe', status: 'pending' },
        { id: 'i4', name: 'Eggs', qty: 1, unit: 'dozen', price: 5.5, note: 'Free range if available', status: 'pending' },
    ],

    routeToStore: [
        { latitude: -33.876, longitude: 151.203 },
        { latitude: -33.88, longitude: 151.207 },
        { latitude: -33.8842, longitude: 151.2101 },
    ],
    routeToCustomer: [
        { latitude: -33.8842, longitude: 151.2101 },
        { latitude: -33.888, longitude: 151.207 },
        { latitude: -33.8932, longitude: 151.2031 },
    ],
};

export const DEMO_DRIVER = { latitude: -33.876, longitude: 151.203 };

export function getShopTotal(job = DEMO) {
    return (job.baseFare || 0) + (job.tip || 0);
}
