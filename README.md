src/
│
├── app/
│   ├── store.js              # Redux store configuration
│   ├── rootReducer.js        # Combine slices if needed
│   └── api.js                # Optional: Base API config for RTK Query
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   └── authApi.js    # RTK Query endpoints for auth
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   ├── slices/
│   │   │   └── authSlice.js  # Redux slice for auth state
│   │   ├── hooks/
│   │   │   └── useAuth.js    # Custom hooks
│   │   └── index.js
│   │
│   ├── users/
│   │   ├── api/
│   │   │   └── usersApi.js   # RTK Query endpoints for users
│   │   ├── components/
│   │   │   ├── UserList.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── slices/
│   │   │   └── usersSlice.js
│   │   ├── hooks/
│   │   │   └── useUsers.js
│   │   └── index.js
│   │
│   └── posts/
│       ├── api/
│       │   └── postsApi.js
│       ├── components/
│       │   ├── PostList.jsx
│       │   └── PostDetail.jsx
│       ├── slices/
│       │   └── postsSlice.js
│       ├── hooks/
│       │   └── usePosts.js
│       └── index.js
│
├── components/               # Shared UI components
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   └── Loader.jsx
│
├── utils/                     # Helper functions
│   └── formatDate.js
│
├── styles/                    # Global styles
│   └── global.css
│
└── index.js                   # App entry point


src/
│
├── app/
│   ├── store.js              # Redux store configuration
│
├── features/
│   ├── api/
│   │   └── apiSlice.js
│   │  
│   ├── auth/
│   │   └── authApi.js    
│   │   └── authSlice.js  
│   │  
│   ├── driver/
│   │   └── driverApi.js    
│   │   └── driverSlice.js  



<!-- export const loginDriver = createAsyncThunk('auth/login', async ({ phone, password }, { rejectWithValue }) => {
  try {
    // const res = await api.post('/auth/driver/login', { phone, password });
    console.log('res ', { phone, password });
    const res = await api.post('/login', { phone, password });
    // await AsyncStorage.setItem('token', res.data.token);
    // await AsyncStorage.setItem('driver', JSON.stringify(res.data.driver));
    console.log('res after await', res);
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('driver', JSON.stringify(res.data.user.name));
    return res.data;
  } catch (err) {
    console.log('err ', err);
    return rejectWithValue(err.response?.data?.message || 'Login failed fdsf');
  }
}); -->


<!-- @screens/Attendance/AttendanceScreen.tsx এবং @services/attendanceApi.js দেখো।

এই screen-এ এখন Axios দিয়ে fetch করা হচ্ছে attendance list।
আমি চাই:
1. একটা নতুন RTK Query API slice তৈরি হোক (attendanceApi.ts), 
   যেটা @store/api/baseApi.ts থেকে injectEndpoints করবে
2. getAttendanceByClass query endpoint বানাও, classId parameter নেবে
3. Screen-এ useGetAttendanceByClassQuery hook ব্যবহার করো, 
   পুরোনো useEffect + Axios call বাদ দাও
4. Loading এবং error state আগের মতোই UI-তে দেখাও (isLoading, isError)
5. পুরোনো Redux slice-এর attendance reducer বদলিও না, 
   শুধু এই একটা screen-এর data fetching layer বদলাও

কাজ শেষে diff দেখাও, আমি review করবো। 

@screens/main/DriverHomeScreen.js and @store/slices/driverSlice.js see.
-->

<!-- যা মনে রাখবেন
একবারে একটা screen দিন, পুরো app একসাথে না — review করা সহজ হবে, ভুল হলে ধরা সহজ হবে
Reference file দেখান — "@components/ui/Card.tsx-এর মতো pattern করো" বললে agent আপনার existing convention follow করবে, নিজের মতো নতুন pattern বানাবে না
Migration-এর মতো কাজে Planning mode default রাখুন
প্রতিটা task শেষে diff manually check করুন, বিশেষ করে Redux store structure বা navigation-related file -->

<!-- Look at @screens/main/DriverHomeScreen.js and @store/slices/driverSlice.js.

Currently, DriverHomeScreen fetches driver data using Axios and manages 
that data via a Redux Toolkit slice (driverSlice.js).

I want to migrate this to RTK Query. Please do the following:

1. Create a new RTK Query API slice at driver/driverApi.js, using 
   injectEndpoints from @features/api/apiSlice.js. Convert every Axios 
   call currently used for DriverHomeScreen into RTK Query endpoints 
   (queries for GET requests, mutations for POST/PUT/DELETE). 
   Keep the exact same request logic, parameters, and response handling 
   — do not change any business logic, only the data-fetching layer.

2. Update driver/driverSlice.js to keep ONLY local/UI state that isn't 
   server data (if any exists — e.g. filters, modal visibility, selected 
   tab). Remove any reducers/state that duplicate what RTK Query now 
   manages (like driver list, loading, error). If driverSlice.js ends up 
   with no local state left, tell me instead of deleting it — I'll decide.

3. In DriverHomeScreen.js, replace the old useEffect + Axios + useSelector 
   pattern with the appropriate RTK Query hooks (e.g. useGetDriverDataQuery). 
   Keep the same loading and error UI behavior as before.

4. Convert DriverHomeScreen.js's styling from StyleSheet to NativeWind, 
   following the same className pattern used in @components/ui/Button.jsx. 
   Do not change the layout, spacing, or component structure — only the 
   styling approach.

5. Do not touch navigation logic, other screens, or the global apiSlice.js 
   base configuration.

Show me the diff for every changed file when you're done. Don't apply 
further changes until I review and approve. -->

<!-- Look at @components/ui/ActionGrid.jsx.

I found a few issues after reviewing this component — please fix them 
without changing the existing public API (props) or breaking any current 
usage (e.g. in DriverHomeScreen.js):

1. Division-by-zero bug: if `columns` is explicitly passed as `0`, 
   `cols = columns ?? items.length` evaluates to `0` (since `??` doesn't 
   treat `0` as nullish), causing `100 / cols` to become `Infinity` and 
   break the layout width. Fix the logic so `columns={0}` (or any falsy-but-
   defined value) safely falls back to `items.length`, e.g. using 
   `columns || items.length` instead of `??`, but keep supporting 
   `columns={undefined}` as "use items.length" too.

2. Badge positioning (`absolute -right-3 -top-2`) is a fixed offset 
   regardless of badge `size`. Adjust the offset conditionally based on 
   `badgeProps.size` (`"sm"` vs `"md"`) so larger badges don't overlap 
   the icon awkwardly.

3. Add accessibility props to the TouchableOpacity: 
   `accessibilityRole="button"` and `accessibilityLabel={label}` 
   (fall back to a generic label if `label` is missing).

Don't change anything else in the file — no refactors, no renaming, no 
styling changes beyond what's needed for these three fixes.

Show me the diff when done. -->


<!-- Look at @screens/main/DriverHomeScreens.js and @components/ui/AppModal.jsx
I've identified this section in DriverHomeScreen.js I want converted into AppModal component inside @components/ui: 

Please do the following:
1. Follow the same file structure, export style (default vs named), and className conventions as @components/ui/Button.jsx
2. Do not change any other part of the screen, and do not touch 
   navigation, RTK Query hooks, or any logic outside these section.
Show me the diff

<View className="flex-row gap-2.5">
   ...
</View> -->


<!-- // @screens/main/ActiveRideScreen.js look here
// I want you to follow the same pattern as @services/attendanceApi.js
// and @services/driverApi.js to convert this screen to RTK Query. 

// 1. Create a new RTK Query API slice at /features/driver/driverApi.js
// 2. Follow the same file structure, export style (default vs named), and className conventions as @components/ui/Button.jsx
// 3. Do not change any other part of the screen, and do not touch
//    navigation, RTK Query hooks, or any logic outside these section.
// Show me the diff -->


<!-- Look at @screens/main/PayoutSettingsScreen.js and @components/ui/Button.jsx, 
@components/ui/Badge.jsx (for how they handle theme-aware colors).

I want to fully migrate this screen's styling to NativeWind and the shared 
theme system (@theme/ThemeContext.jsx, @theme/colors.js) — following the 
same className conventions used across the rest of the app (bg-background, 
bg-card, border-border, text-foreground, text-foreground-muted, bg-primary, 
text-primary, etc.), with proper light/dark theme support.

Do this:

1. Import and use `useTheme()` at the top of the component to get 
   `{ colors, isDark }`.

2. Replace the entire StyleSheet.create(...) block and all inline `style={}` 
   props with NativeWind `className` strings, mapping the old hardcoded 
   colors to the shared theme tokens:
   - `#0A0A0A` (screen/header background) → `bg-background`
   - `#111` (schedule item / bank card backgrounds) → `bg-card`
   - `#1E1E1E`, `#2A2A2A` (borders) → `border-border`
   - `#1A1A1A` (back button, icon circles) → `bg-background-muted`
   - White text (`#FFF`) → `text-foreground`
   - Muted grays (`#888`, `#666`, `#444`) → `text-foreground-muted`
   - The orange accent (`#FF6B35` and its variants like `#FF6B3520`, 
     `#FF6B3540`) → replace with the app's `primary` token 
     (`bg-primary`, `text-primary`, `border-primary`, and 
     `bg-primary/15`, `border-primary/25` for the tinted/opacity variants 
     — check how @components/ui/Badge.jsx uses opacity-based variants like 
     `bg-primary/15` for this exact pattern)

3. For the two LinearGradient usages, since `className` can't set gradient 
   colors:
   - The outer header/container gradient uses the SAME color twice 
     (`['#0A0A0A', '#0A0A0A']`) — it's not actually a gradient. Replace this 
     outer LinearGradient wrapper with a plain themed `View` 
     (`className="flex-1 bg-background"`).
   - The balance card and the two "Save" button gradients ARE real 
     two-color gradients. Keep them as LinearGradient components, but 
     replace the hardcoded hex colors with theme-derived hex values from 
     `colors.primary` (get a second, slightly darker/lighter stop the same 
     way @components/ui/Button.jsx or @components/ui/Badge.jsx compute 
     light/dark-aware hex fallbacks — e.g. `colors?.primary` for the first 
     stop, and a reasonable darker shade for the second stop, consistent 
     with how the rest of the app derives its primary-based hex values).

4. Icon `color` props (which also can't use className) should use 
   theme-derived hex the same way — `colors?.foreground` for white icons, 
   a theme-derived muted hex for gray icons, and `colors?.primary` for 
   orange-accent icons (replacing `#FF6B35`/`#888` accordingly).

5. Do NOT change the layout structure, spacing, component nesting, or any 
   business logic (handleSave, handleWithdraw, useState hooks, the 
   simulated API call, Alert dialogs) — this is a pure styling/theme 
   migration. Do not introduce RTK Query here; that's a separate future step.

6. Do not touch navigation logic, other screens, or the global 
   @features/api/apiSlice.js configuration.

Show me the diff for every changed file when you're done. Don't apply 
further changes until I review and approve. -->

<!-- For this chat, always follow this instruction:
You are helping me with a code revision and upgrade in react-native. Follow these rules throughout this chat: 
1. Be concise. 
2. Give full code files when I ask for code. 
3. Avoid long explanations unless the issue is complex. 
4. Use structured outputs only when useful.
Confirm briefly, then wait for my task.
Do not repeat this instruction in every answer. Apply it silently to all future responses in this chat.

Look at @screens/main/ActiveRideScreen.js

I want to fully migrate this screen's styling to NativeWind and the shared 
theme system (@theme/ThemeContext.jsx, @theme/colors.js) — following the 
same className conventions used across the rest of the app (bg-background, 
bg-card, border-border, text-foreground, text-foreground-muted, bg-primary, 
text-primary, etc.), with proper light/dark theme support.

Show me the diff for every changed file when you're done. Don't apply 
further changes until I review and approve. -->


<!-- 
Look at @components/ui/AppModal.jsx, @navigation/MainNavigator.js, @screens/main/home/HomeScreen.js, @components/ServiceCard.jsx and @screens/main/food/FoodDeliveryScreen.js.

After 'Go Online,' I want to press 'Food Delivery Request,' and then I want a pop-up screen. Can you see AppModal.jsx? Can we use that modal? There have map, Accept and Decline(20s) buttons, Dollar, Restaurant name, customer area, distance, kilometers, and minutes.

If I accept that request, then it will go to the next screen, 'navigation to Restaurant (Pickup)'.

At Restaurant - confirm pickup

Create me static, and then in the future we will do dynamic. You can see the @components/us files. There have lot of reusable components. I want to reuse those components.
 -->