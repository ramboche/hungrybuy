import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { Product, MenuVariant } from '@/lib/types';

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

// --- HELPER TYPES ---
interface CreateProductPayload {
    name: string;
    description?: string;
    price: number; // in cents
    categoryId: string;
    foodType: 'VEG' | 'NON_VEG';
    variants: { label: string; price: number }[];
}

interface UpdateProductPayload extends CreateProductPayload {
    id: string;
    isAvailable: boolean;
}

// --- ASYNC THUNKS ---

export const fetchProducts = createAsyncThunk(
    'menu/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/menu');
            return response.data.data.items;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
        }
    }
);

export const addProduct = createAsyncThunk(
    'menu/add',
    async (payload: CreateProductPayload, { rejectWithValue, dispatch }) => {
        try {
            // 1. Create the Main Item
            const itemResponse = await api.post('/menu/create', {
                name: payload.name,
                description: payload.description,
                price: payload.price,
                foodType: payload.foodType,
                categoryId: payload.categoryId
            });

            const newItem = itemResponse.data.data.item;

            // 2. If there are variants, create them sequentially
            if (payload.variants.length > 0) {
                for (const variant of payload.variants) {
                    await api.post(`/menu/${newItem.id}/variants`, {
                        label: variant.label,
                        price: variant.price
                    });
                }
            }

            // 3. Return the new item ID to trigger a refresh (or return incomplete item)
            // Since variants are separate, it's safer to re-fetch to get the full object with nested variants
            dispatch(fetchProducts());

            return newItem;

        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add product');
        }
    }
);

export const updateProduct = createAsyncThunk(
    'menu/update',
    async (payload: UpdateProductPayload, { rejectWithValue, dispatch }) => {
        try {
            // 1. Update Main Item Fields
            const response = await api.patch(`/menu/${payload.id}`, {
                name: payload.name,
                description: payload.description,
                price: payload.price, // cents
                foodType: payload.foodType,
                categoryId: payload.categoryId,
                isAvailable: payload.isAvailable
            });

            // Note: For a robust app, you would also need to diff/sync variants here.
            // For now, this fixes the main "duplicate" bug by updating the item itself.

            return response.data.data.item;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update product');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'menu/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/menu/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
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
                // Inject placeholder image since backend doesn't have it yet
                state.products = action.payload.map((p: any) => ({
                    ...p,
                    image: '/burgers.jpeg' // Default Placeholder
                }));
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.id !== action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    // Update the item in the list with the new data from backend
                    // We keep the image placeholder since backend doesn't return one yet
                    state.products[index] = {
                        ...action.payload,
                        image: state.products[index].image,
                        variants: state.products[index].variants // Keep existing variants for now
                    };
                }
            });
    },
});

export default menuSlice.reducer;