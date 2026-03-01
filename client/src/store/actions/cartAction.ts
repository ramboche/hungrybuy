import { AppDispatch, RootState } from "../index";
import {
    setCartLoading,
    setTableData,
    setCart,
    updateCartItemOptimistic,
    removeCartItemOptimistic,
    clearCart,
    CartItem
} from "../slices/cartSlice";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

const updateApiToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common["x-table-token"] = token;
    } else {
        delete api.defaults.headers.common["x-table-token"];
    }
};

export const fetchCartAction = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { tableToken } = getState().cart;
    if (!tableToken) return;

    dispatch(setCartLoading(true));
    try {
        const res = await api.get(`/cart`);
        dispatch(setCart(res.data.data.cart));
    } catch (error) {
        console.error("Fetch Cart Error:", error);
    } finally {
        dispatch(setCartLoading(false));
    }
};

export const resolveTableAction = (token: string) => async (dispatch: AppDispatch) => {
    dispatch(setCartLoading(true));
    try {
        const res = await api.get(`/table/qr/${token}`);
        const resolvedTable = res.data.data;
        const tableToken = resolvedTable.tableToken;
        const tableNo = resolvedTable.tableNumber;

        if (tableToken && tableNo) {
            if (typeof window !== "undefined") {
                localStorage.setItem("table", JSON.stringify({ token: tableToken, no: tableNo }));
            }

            updateApiToken(tableToken);
            dispatch(setTableData({ token: tableToken, no: tableNo }));
            toast.success("Connected to table!");

            dispatch(fetchCartAction());
        }
    } catch (error) {
        console.error("QR Resolution Error:", error);
        toast.error("Invalid QR Code");
    } finally {
        dispatch(setCartLoading(false));
    }
};

export const addToCartAction = (menuItemId: string, quantity: number, variantId?: string) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {

        const { tableToken, cart } = getState().cart;

        if (!tableToken) {
            toast.error("No table selected!");
            return;
        }

        try {
            const existingItem = cart.find(
                (item) => item.menuItem.id === menuItemId && item.variant?.id === variantId
            );

            const finalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

            const res = await api.post(`/cart/add`, {
                menuItemId,
                variantId,
                quantity: finalQuantity,
            });

            const receivedItem: CartItem = res.data.data.item;

            const existingIndex = cart.findIndex(item => item.id === receivedItem.id);
            let newCart = [...cart];

            if (existingIndex > -1) {
                newCart[existingIndex] = receivedItem;
            } else {
                newCart = [...newCart, receivedItem];
            }

            dispatch(setCart(newCart));
            toast.success("Added to cart!");

        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Failed to add item");
        }
    };

export const updateQuantityAction = (cartItemId: string, newQuantity: number) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {

        if (newQuantity <= 0) {
            return dispatch(removeFromCartAction(cartItemId));
        }

        dispatch(updateCartItemOptimistic({ cartItemId, quantity: newQuantity }));

        try {
            await api.patch(`/cart/${cartItemId}`, { quantity: newQuantity });
        } catch (error) {
            toast.error("Failed to update cart");
            console.error("Update Cart Error:", error);
            const { tableToken } = getState().cart;
            if (tableToken) dispatch(fetchCartAction());
        }
    };

export const removeFromCartAction = (cartItemId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(removeCartItemOptimistic(cartItemId));

    try {
        await api.delete(`/cart/${cartItemId}`);
        toast.success("Item removed");
    } catch (error) {
        toast.error("Failed to remove item");
        console.error("Remove Cart Item Error:", error);
        const { tableToken } = getState().cart;
        if (tableToken) dispatch(fetchCartAction());
    }
};

export const placeOrderAction = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { tableToken } = getState().cart;

    if (!tableToken) {
        toast.error("Table Token missing!");
        throw new Error("No Table Token");
    }

    try {
        await api.post(`/order/create`);
        dispatch(clearCart());
        toast.success("Order placed successfully!");
    } catch (error) {
        console.error("Place Order Error:", error);
        const err = error as AxiosError<{ message: string }>;
        toast.error(err.response?.data?.message || "Failed to place order");
        throw error;
    }
};