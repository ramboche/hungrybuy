import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { Table } from '@/lib/types';
import { AxiosError } from 'axios';

interface TableState {
  tables: Table[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TableState = {
  tables: [],
  isLoading: false,
  error: null,
};

// --- ASYNC ACTIONS ---

export const fetchTables = createAsyncThunk(
  'tables/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Matches GET /api/admin/tables
      const response = await api.get('/table');
      console.log(response);
      return response.data.data.tables; // Expecting { data: Table[] }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tables');
    }
  }
);

export const addTable = createAsyncThunk(
  'tables/add',
  async (number: number, { rejectWithValue }) => {
    try {
      // Matches POST /api/admin/tables
      const response = await api.post('/table/create', { number });
      return response.data.data; // Expecting { data: Table }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to add table');
    }
  }
);

export const deleteTable = createAsyncThunk(
  'tables/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      // Matches DELETE /api/admin/tables/:id
      await api.delete(`/table/${id}`);
      return id; // Return ID to remove it from state locally
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to delete table');
    }
  }
);

// --- SLICE ---

const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTables.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add
      .addCase(addTable.fulfilled, (state, action) => {
        state.tables.push(action.payload.table);
        state.tables.sort((a, b) => a.number - b.number); // Keep sorted
      })
      // Delete
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.tables = state.tables.filter((t) => t.id !== action.payload);
      });
  },
});

export default tableSlice.reducer;