// driver-app/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export const loginDriver = createAsyncThunk('auth/login', async ({ phone, password }, { rejectWithValue }) => {
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
});

export const registerDriver = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/driver/register', data);
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('driver', JSON.stringify(res.data.driver));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loadDriver = createAsyncThunk('auth/loadDriver', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const driver = await AsyncStorage.getItem('driver');
    if (!token || !driver) throw new Error('No session');
    return { token, driver: JSON.parse(driver) };
  } catch (err) {
    return rejectWithValue('No session');
  }
});

export const logoutDriver = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('driver');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    driver: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    updateDriverProfile: (state, action) => {
      state.driver = { ...state.driver, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginDriver.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.driver = action.payload.driver;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.driver = action.payload.driver;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loadDriver.fulfilled, (state, action) => {
        state.driver = action.payload.driver;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loadDriver.rejected, (state) => {
        state.isAuthenticated = false;
      })
      .addCase(logoutDriver.fulfilled, (state) => {
        state.driver = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateDriverProfile } = authSlice.actions;
export default authSlice.reducer;
