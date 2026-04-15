// src/store/slices/authSlice.js  (Driver app)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export const loginDriver = createAsyncThunk('auth/login', async ({ phone, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/driver/login', { phone, password });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('driver', JSON.stringify(res.data.driver));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Login failed');
  }
});

export const registerDriver = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/driver/register', data);
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('driver', JSON.stringify(res.data.driver));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Registration failed');
  }
});

export const loadDriver = createAsyncThunk('auth/loadDriver', async (_, { rejectWithValue }) => {
  try {
    const token  = await AsyncStorage.getItem('token');
    const driver = await AsyncStorage.getItem('driver');
    if (!token || !driver) throw new Error('No session');
    return { token, driver: JSON.parse(driver) };
  } catch (err) {
    return rejectWithValue('No session');
  }
});

export const logoutDriver = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove(['token', 'driver']);
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
      if (state.driver) {
        state.driver = { ...state.driver, ...action.payload };
        AsyncStorage.setItem('driver', JSON.stringify(state.driver));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginDriver.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(loginDriver.fulfilled,  (state, action) => {
        state.loading = false;
        state.driver  = action.payload.driver;
        state.token   = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginDriver.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerDriver.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.driver  = action.payload.driver;
        state.token   = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerDriver.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loadDriver.fulfilled,  (state, action) => {
        state.driver  = action.payload.driver;
        state.token   = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loadDriver.rejected,   (state) => { state.isAuthenticated = false; })
      .addCase(logoutDriver.fulfilled, (state) => {
        state.driver  = null;
        state.token   = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateDriverProfile } = authSlice.actions;
export default authSlice.reducer;
