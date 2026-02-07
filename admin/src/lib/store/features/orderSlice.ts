import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { Order, OrderStatus } from '@/lib/types';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  isLoading: false,
  error: null,
};

// --- ASYNC THUNKS ---

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Matches router.get("/all", getAllOrders);
      const response = await api.get('/order/all');
      return response.data.data.orders; 
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: OrderStatus }, { rejectWithValue }) => {
    try {
      // Matches router.patch("/:orderId", updateOrderStatus);
      const response = await api.patch(`/order/${orderId}`, { status });
      return response.data.data.order; 
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

// --- SLICE ---

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        // Sort by newest first
        state.orders = action.payload.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      // Update Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export default orderSlice.reducer;