# Food Delivery Request Modal + Restaurant Pickup Flow

## Overview

Build a complete static Food Delivery flow with two screens:

1. **Incoming Food Delivery Modal** — triggered from HomeScreen's "Food Delivery Request" button. Built with `AppModal`, shows restaurant info, delivery stats, a map placeholder, countdown timer (20s), and Accept/Decline buttons.
2. **Food Delivery Active Screen** (Navigation to Restaurant → Confirm Pickup) — the screen you land on after accepting. Uses a map, shows restaurant + customer info, and provides "I've Arrived" → "Confirm Pickup" step flow.

---

## Flow Diagram

```
HomeScreen (Online)
  └─ Press "Food Delivery Request" button
       └─ IncomingFoodDeliveryModal (AppModal, bottom-sheet, 20s countdown)
            ├─ Decline → close modal
            └─ Accept → navigate to FoodDeliveryActiveScreen
                  └─ Step 1: Navigate to Restaurant (Pickup)
                       └─ "I've Arrived at Restaurant" →
                            Step 2: Confirm Pickup
                                 └─ "Confirm Pickup" → (future: delivery screen)
```

---

## Proposed Changes

### 1. New Modal Component

#### [NEW] `IncomingFoodDeliveryModal.jsx`
`src/components/IncomingFoodDeliveryModal.jsx`

A self-contained component (not a screen) rendered inline in `HomeScreen`. Uses:
- `AppModal` (`visible`, `onClose`, `hideActions`) — bottom-sheet wrapper
- `Animated` countdown bar (20s, auto-decline on timeout)
- `Badge` — delivery type tag e.g. "FOOD DELIVERY"
- `StatRow` — distance / time / earnings row
- `IconButton` — map placeholder icon
- `Button` — custom Accept (primary) + Decline (error/outline) footer

**Static data used:**
```js
const ORDER = {
  restaurant: 'Hungry Jack\'s - Surry Hills',
  restaurantAddress: '283 Crown St, Surry Hills NSW 2010',
  customerArea: 'Redfern, NSW',
  distance: '3.4 km',
  duration: '12 min',
  earnings: '$8.50',
  items: 2,
}
```

---

### 2. New Active Delivery Screen

#### [MODIFY] [`FoodDeliveryScreen.js`](file:///d:/TasSecurePtyLtd/React_Native/SwiftDriveDriver/src/screens/main/food/FoodDeliveryScreen.js)

Replace the stub with a full active delivery screen. Two internal steps:

| Step | Title | Button |
|---|---|---|
| `navigating` | Navigate to Restaurant | "I've Arrived at Restaurant" |
| `pickup` | Confirm Pickup | "Confirm Pickup" |

Uses:
- `MapView` with a static marker (restaurant lat/lng hardcoded for static demo)
- `ScreenHeader` with a back button
- `Animated.View` sliding bottom panel
- `Badge` — step status badge
- `StatRow` — Distance / Duration / Earnings
- `Button` — primary CTA per step
- `IconButton` — navigation FAB

---

### 3. HomeScreen — wire up the modal

#### [MODIFY] [`HomeScreen.js`](file:///d:/TasSecurePtyLtd/React_Native/SwiftDriveDriver/src/screens/main/home/HomeScreen.js)

- Add `useState` for `foodModalVisible`
- The "Food Delivery Request" button sets `foodModalVisible = true`
- Render `<IncomingFoodDeliveryModal>` with `onAccept` navigating to `FoodDelivery` and `onDecline` closing
- Remove the duplicate `{isOnline && ...}` button clutter (tidy up the "Ride Request" block too)

---

### 4. Navigation

#### [MODIFY] [`MainNavigator.js`](file:///d:/TasSecurePtyLtd/React_Native/SwiftDriveDriver/src/navigation/MainNavigator.js)

`FoodDelivery` screen is already registered — **no changes needed** here.

---

## Verification Plan

### Manual
- Go Online on HomeScreen → "Food Delivery Request" button appears → press it → `AppModal` slides up with order info and 20s countdown
- Press Decline → modal closes
- Press Accept → navigates to `FoodDeliveryScreen`
- On `FoodDeliveryScreen`, press "I've Arrived at Restaurant" → step changes to "Confirm Pickup"
- Press "Confirm Pickup" → (logs / placeholder for now)
