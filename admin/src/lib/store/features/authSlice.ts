import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api'; // <--- Import your new helper
import { AuthState } from '../../types';
import { AxiosError } from 'axios';

// --- ASYNC THUNK (LOGIN ACTION) ---
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // 👇 USE THE HELPER INSTANCE
      // Since baseURL is '.../api', this becomes '.../api/admin/login'
      // Adjust the path string based on your exact route structure
      const response = await api.post('/admin/login', credentials);

      return response.data; // Expected: { token, data: { user: {...} }, message }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;

      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// --- INITIAL STATE ---
const getUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return { token, user, isAuthenticated: true };
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }
  return { token: null, user: null, isAuthenticated: false };
};

const initialState: AuthState = {
  ...getUserFromStorage(),
  isLoading: false,
  error: null,
};

// --- SLICE ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.data.user;

        if (typeof window !== 'undefined') {
          localStorage.setItem('adminToken', action.payload.token);
          localStorage.setItem('adminUser', JSON.stringify(action.payload.data.user));
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;