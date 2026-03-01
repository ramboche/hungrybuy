import { AppDispatch, RootState } from "../index";
import {
    setCartLoading,
    setTableData,
    setCart,
    updateCartItemOptimistic,
    removeCartItemOptimistic,
    clearCart,
    CartItem,
} from "../slices/cartSlice";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { MenuItem, Variant } from "@/lib/types";

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

export const addToCartAction = (menuItem: MenuItem, quantity: number, variant?: Variant) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {

        const { tableToken, cart } = getState().cart;

        if (!tableToken) {
            toast.error("No table selected!");
            return;
        }

        const previousCart = [...cart];

        const existingItem = cart.find(
            (item) => item.menuItem.id === menuItem.id && item.variant?.id === variant?.id
        );

        const finalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

        const tempId = `temp-${Date.now()}`;

        if (existingItem) {
            dispatch(updateCartItemOptimistic({
                cartItemId: existingItem.id,
                quantity: finalQuantity
            }));
        } else {
            const fakeCartItem = {
                id: tempId,
                quantity: finalQuantity,
                menuItem: menuItem,
                variant: variant || null,
            } as CartItem;

            dispatch(setCart([...cart, fakeCartItem]));
        }

        try {
            const res = await api.post(`/cart/add`, {
                menuItemId: menuItem.id,
                variantId: variant?.id,
                quantity: finalQuantity,
            });

            const officialItem: CartItem = res.data.data.item;

            const currentCart = getState().cart.cart;

            const targetId = existingItem ? existingItem.id : tempId;
            const itemInCurrentState = currentCart.find(
                (i) => i.id === targetId || i.id === officialItem.id
            );

            const latestQuantity = itemInCurrentState ? itemInCurrentState.quantity : finalQuantity;

            const newCart = currentCart.map(item => {
                if (item.id === tempId || item.id === officialItem.id) {
                    return {
                        ...officialItem,
                        quantity: latestQuantity
                    };
                }
                return item;
            });

            dispatch(setCart(newCart));

            if (!existingItem && latestQuantity !== finalQuantity) {
                dispatch(updateQuantityAction(officialItem.id, latestQuantity));
            }

        } catch (error) {
            dispatch(setCart(previousCart));

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

        if (cartItemId.startsWith("temp-")) {
            return;
        }

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

    if (cartItemId.startsWith("temp-")) {
        return;
    }

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