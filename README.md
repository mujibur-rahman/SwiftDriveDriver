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

কাজ শেষে diff দেখাও, আমি review করবো। -->