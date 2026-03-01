import { MenuItem } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export type Variant = {
    id: string;
    label: string;
    price: number;
};


export type CartItem = {
    id: string;
    quantity: number;
    menuItem: MenuItem;
    variant?: Variant | null;
};

interface CartState {
    cart: CartItem[];
    isLoading: boolean;
    tableToken: string | null;
    tableNo: number;
}

const getInitialTable = () => {
    if (typeof window !== "undefined") {
        const storedTable = localStorage.getItem("table");
        if (storedTable) {
            try {
                return JSON.parse(storedTable);
            } catch {
                return { token: null, no: 0 };
            }
        }
    }
    return { token: null, no: 0 };
};

const initialTable = getInitialTable();

const initialState: CartState = {
    cart: [],
    isLoading: false,
    tableToken: initialTable.token,
    tableNo: initialTable.no,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCartLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setTableData: (state, action: PayloadAction<{ token: string; no: number }>) => {
            state.tableToken = action.payload.token;
            state.tableNo = action.payload.no;
        },
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.cart = action.payload;
        },

        updateCartItemOptimistic: (state, action: PayloadAction<{ cartItemId: string; quantity: number }>) => {
            const item = state.cart.find((i) => i.id === action.payload.cartItemId);
            if (item) item.quantity = action.payload.quantity;
        },
        removeCartItemOptimistic: (state, action: PayloadAction<string>) => {
            state.cart = state.cart.filter((item) => item.id !== action.payload);
        },
        clearCart: (state) => {
            state.cart = [];
        },
    },
});

export const {
    setCartLoading,
    setTableData,
    setCart,
    updateCartItemOptimistic,
    removeCartItemOptimistic,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;