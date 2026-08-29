// src/screens/main/food/foodDemo.js
export const DEMO = {
    orderNumber: 'FD-7291',
    restaurant: "Hungry Jack's",
    restaurantAddress: '283 Crown St, Surry Hills NSW 2010',
    restaurantCoords: { latitude: -33.8842, longitude: 151.2101 },
    restaurantPhone: '+61291234567',
    customerName: 'Alex M.',
    customerAddress: '14 Regent St, Redfern NSW 2016',
    customerCoords: { latitude: -33.8932, longitude: 151.2031 },
    customerPhone: '+61412345678',
    distanceToRestaurant: '1.8 km',
    durationToRestaurant: '6 min',
    distanceToCustomer: '2.1 km',
    durationToCustomer: '8 min',
    baseFare: 7.5,
    tip: 1.0,
    items: [
        { name: 'Whopper Meal (Large)', qty: 1, id: 'i1' },
        { name: 'Chocolate Sundae', qty: 2, id: 'i2' },
    ],
    routeToRestaurant: [
        { latitude: -33.876, longitude: 151.203 },
        { latitude: -33.876, longitude: 151.2065 },
        { latitude: -33.879, longitude: 151.2065 },
        { latitude: -33.879, longitude: 151.2101 },
        { latitude: -33.8842, longitude: 151.2101 },
    ],
    routeToCustomer: [
        { latitude: -33.8842, longitude: 151.2101 },
        { latitude: -33.8842, longitude: 151.206 },
        { latitude: -33.887, longitude: 151.206 },
        { latitude: -33.8932, longitude: 151.2031 },
    ],
};

export const DEMO_DRIVER = { latitude: -33.876, longitude: 151.203 };