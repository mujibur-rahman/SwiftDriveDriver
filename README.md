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