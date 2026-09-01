// src/screens/main/gig/gigDemo.js
/**
 * Demo gig job — Lawn Mowing.
 * Structure mirrors foodDemo / parcelDemo so the active-job screen
 * can stay thin and the sheet body can stay data-driven.
 */
export const DEMO = {
  orderNumber: 'GJ-5401',
  category: 'Lawn Mowing',
  categoryIcon: 'grass',
  title: 'Front & back lawn mowing',
  description:
    'Mow front and back lawn, edge along the driveway and path, bag clippings. Tools provided on-site.',
  // Customer / job site
  customerName: 'Sarah K.',
  customerAddress: '42 Bourke St, Surry Hills NSW 2010',
  customerCoords: { latitude: -33.8865, longitude: 151.212 },
  customerPhone: '+61412345678',
  // Timing & pay
  scheduledAt: 'Today · 3:00 PM',
  estimatedDuration: '1.5–2 hrs',
  distanceToJob: '2.4 km',
  durationToJob: '9 min',
  baseFare: 45.0,
  tip: 5.0,
  bonus: 0,
  // Checklist shown on Start Job / In Progress
  checklist: [
    { id: 'c1', label: 'Mow front lawn' },
    { id: 'c2', label: 'Mow back lawn' },
    { id: 'c3', label: 'Edge driveway & path' },
    { id: 'c4', label: 'Bag / dispose clippings' },
  ],
  requirements: ['Bring closed shoes', 'Tools available on-site'],
  // Fallback route polyline (used when directions API is offline)
  routeToJob: [
    { latitude: -33.876, longitude: 151.203 },
    { latitude: -33.878, longitude: 151.206 },
    { latitude: -33.882, longitude: 151.209 },
    { latitude: -33.8865, longitude: 151.212 },
  ],
};

export const DEMO_DRIVER = { latitude: -33.876, longitude: 151.203 };

/** Extra demo jobs you can swap into IncomingGigJobModal for variety */
export const DEMO_JOBS = [
  DEMO,
  {
    orderNumber: 'GJ-5402',
    category: 'House Cleaning',
    categoryIcon: 'broom',
    title: '2-bed apartment deep clean',
    customerName: 'James T.',
    customerAddress: '18 Crown St, Surry Hills NSW 2010',
    customerCoords: { latitude: -33.884, longitude: 151.211 },
    customerPhone: '+61498765432',
    scheduledAt: 'Today · 4:30 PM',
    estimatedDuration: '2–3 hrs',
    distanceToJob: '1.6 km',
    durationToJob: '7 min',
    baseFare: 65.0,
    tip: 8.0,
    bonus: 0,
  },
  {
    orderNumber: 'GJ-5403',
    category: 'Moving Help',
    categoryIcon: 'dolly',
    title: 'Help move sofa & boxes (1 hr)',
    customerName: 'Priya M.',
    customerAddress: '9 Regent St, Redfern NSW 2016',
    customerCoords: { latitude: -33.893, longitude: 151.204 },
    customerPhone: '+61411223344',
    scheduledAt: 'Today · 5:00 PM',
    estimatedDuration: '1 hr',
    distanceToJob: '3.1 km',
    durationToJob: '12 min',
    baseFare: 35.0,
    tip: 0,
    bonus: 5.0,
  },
];
