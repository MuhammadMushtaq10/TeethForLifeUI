import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const loginAdmin = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await client.post('/api/admin', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminMode', data.mode || 'live');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    mode: localStorage.getItem('adminMode') || 'live',
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.mode = 'live';
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('adminMode');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.mode = action.payload.mode || 'live';
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
