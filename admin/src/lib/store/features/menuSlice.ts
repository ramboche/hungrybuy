import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { Product, MenuVariant } from '@/lib/types';
import { AxiosError } from 'axios';

interface AddProductThunkPayload {
    itemData: FormData; 
    variants: { label: string; price: number }[];
}

interface UpdateProductThunkPayload {
    id: string;
    itemData: FormData;
    variants: { id?: string; label: string; price: number }[];
}

interface MenuState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
}

const initialState: MenuState = {
    products: [],
    isLoading: false,
    error: null,
};


// --- ASYNC THUNKS ---

export const fetchProducts = createAsyncThunk(
    'menu/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/menu');
            return response.data.data.items;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch menu');
        }
    }
);

export const addProduct = createAsyncThunk(
    'menu/add',
    async ({ itemData, variants }: AddProductThunkPayload, { rejectWithValue, dispatch }) => {
        try {

            // 1. Create Main Item (Sends Multipart/Form-Data)
            const itemResponse = await api.post('/menu/create', itemData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const newItem = itemResponse.data.data.item;

            // 2. Create Variants (Sends JSON - backend unchanged)
            if (variants.length > 0) {
                await Promise.all(variants.map(variant =>
                    api.post(`/menu/${newItem.id}/variants`, {
                        label: variant.label,
                        price: Number(variant.price)
                    })
                ));
            }

            dispatch(fetchProducts());
            return newItem;

        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to add product');
        }
    }
);


export const updateProduct = createAsyncThunk(
    'menu/update',
    async ({ id, itemData, variants }: UpdateProductThunkPayload, { rejectWithValue, dispatch }) => {
        try {
            // 1. Update Main Item (Sends Multipart/Form-Data)
            await api.patch(`/menu/${id}`, itemData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // --- 2. SYNC VARIANTS (Logic preserved) ---

            // A. Fetch current variants
            const existingVarsResponse = await api.get(`/menu/${id}/variants`);
            const dbVariants: MenuVariant[] = existingVarsResponse.data.data.variants || [];

            // B. Identify Changes
            const payloadVariantIds = variants.map(v => v.id).filter(Boolean);

            const toDelete = dbVariants.filter(v => !payloadVariantIds.includes(v.id));
            const toAdd = variants.filter(v => !v.id);
            const toUpdate = variants.filter(v => v.id);

            // C. Execute API Calls
            await Promise.all([
                ...toDelete.map(v => api.delete(`/menu/${id}/variants/${v.id}`)),
                ...toAdd.map(v => api.post(`/menu/${id}/variants`, { label: v.label, price: Number(v.price) })),
                ...toUpdate.map(v => api.patch(`/menu/${id}/variants/${v.id}`, { label: v.label, price: Number(v.price) }))
            ]);

            dispatch(fetchProducts());
            return id;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to update product');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'menu/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/menu/${id}`);
            return id;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
        }
    }
);

// --- SLICE ---

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => { state.isLoading = true; })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.map((p: Product) => ({
                    ...p,
                    // image: '/burgers.jpeg'
                }));
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.id !== action.payload);
            })
            // Update is mostly handled by fetchProducts dispatch now, 
            // but we can leave this for optimistic UI updates if needed later.
            .addCase(updateProduct.fulfilled, () => {
                // The fetchProducts dispatch inside the thunk will handle the actual data refresh
            });
    },
});

export default menuSlice.reducer;