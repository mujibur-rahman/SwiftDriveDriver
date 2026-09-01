// src/screens/main/gig/gigDemo.js
/**
 * Demo gig — Lawn Mowing.
 * Mandatory fields used across the flow:
 *  - short description
 *  - requirements
 *  - checklist
 */

export const DEMO = {
  orderNumber: 'GJ-5401',
  category: 'Lawn Mowing',
  categoryIcon: 'grass',
  title: 'Front & back lawn mowing',
  /** Short job description (mandatory on offer) */
  description:
    'Front and back lawn cut, edge driveway, bag clippings. About 1.5–2 hours.',
  /** Requirements shown before accept */
  requirements: [
    'Bring your own tools',
    'Closed shoes required',
    'Tools available on-site as backup',
  ],
  customerName: 'Sarah K.',
  customerAddress: '42 Bourke St, Surry Hills NSW 2010',
  customerCoords: { latitude: -33.8865, longitude: 151.212 },
  customerPhone: '+61412345678',
  scheduledAt: 'Today · 3:00 PM',
  estimatedDuration: '1.5–2 hrs',
  distanceToJob: '2.4 km',
  durationToJob: '9 min',
  baseFare: 45,
  tip: 5,
  bonus: 0,
  currency: 'USD',
  currencySymbol: '$',
  checklist: [
    { id: 'c1', label: 'Mow lawn' },
    { id: 'c2', label: 'Clear weeds' },
    { id: 'c3', label: 'Edge driveway & path' },
    { id: 'c4', label: 'Bag / dispose clippings' },
  ],
  /** Cancel allowed only within this many minutes after accept */
  cancelWindowMinutes: 15,
  routeToJob: [
    { latitude: -33.876, longitude: 151.203 },
    { latitude: -33.878, longitude: 151.206 },
    { latitude: -33.882, longitude: 151.209 },
    { latitude: -33.8865, longitude: 151.212 },
  ],
};

export const DEMO_DRIVER = { latitude: -33.876, longitude: 151.203 };

export function getJobTotal(job = DEMO) {
  return (job.baseFare || 0) + (job.tip || 0) + (job.bonus || 0);
}

export function formatMoney(amount, job = DEMO) {
  const sym = job.currencySymbol || '$';
  return `${sym}${Number(amount || 0).toFixed(2)}`;
}
