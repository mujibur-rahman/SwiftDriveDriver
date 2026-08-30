// src/screens/main/parcel/parcelDemo.js
export const DEMO = {
    orderNumber: 'PD-3182',
    // Sender (pickup)
    sender: 'QuickShip Warehouse',
    senderAddress: '12 Industrial Ave, Alexandria NSW 2015',
    senderCoords: { latitude: -33.907, longitude: 151.189 },
    senderPhone: '+61298765432',
    // Recipient (drop-off)
    recipientName: 'Rashed Karim',
    recipientAddress: '8 Regent St, Redfern NSW 2016',
    recipientCoords: { latitude: -33.8932, longitude: 151.2031 },
    recipientPhone: '+61412987654',
    distanceToPickup: '4.2 km',
    durationToPickup: '11 min',
    distanceToDropoff: '2.6 km',
    durationToDropoff: '9 min',
    baseFare: 9.0,
    perParcelBonus: 1.5,
    // Parcels for this order — barcode is what the scanner matches against
    parcels: [
        { id: 'PKG-4471', label: 'Small box', barcode: '8901234567890' },
        { id: 'PKG-4472', label: 'Envelope', barcode: '8901234567891' },
    ],
    routeToPickup: [
        { latitude: -33.9, longitude: 151.195 },
        { latitude: -33.9, longitude: 151.191 },
        { latitude: -33.904, longitude: 151.191 },
        { latitude: -33.904, longitude: 151.189 },
        { latitude: -33.907, longitude: 151.189 },
    ],
    routeToDropoff: [
        { latitude: -33.907, longitude: 151.189 },
        { latitude: -33.9, longitude: 151.195 },
        { latitude: -33.897, longitude: 151.2 },
        { latitude: -33.8932, longitude: 151.2031 },
    ],
};

export const DEMO_DRIVER = { latitude: -33.9, longitude: 151.195 };
