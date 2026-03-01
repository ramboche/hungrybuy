"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    resolveTableAction,
    addToCartAction,
    updateQuantityAction,
    removeFromCartAction,
    placeOrderAction,
} from "@/store/actions/cartAction";
import { MenuItem, Variant } from "@/lib/types";

export function useCart() {
    const dispatch = useAppDispatch();
    const cartState = useAppSelector((state) => state.cart);

    const totalAmount = cartState.cart.reduce((total, item) => {
        const price = item.variant ? item.variant.price : item.menuItem.price || 0;
        return total + price * item.quantity;
    }, 0);

    const resolveTableFromToken = useCallback(
        async (token: string) => {
            await dispatch(resolveTableAction(token));
        },
        [dispatch]
    );

    const addToCart = useCallback(
        async (menuItem: MenuItem, quantity: number, variant?: Variant) => {
            await dispatch(addToCartAction(menuItem, quantity, variant));
        },
        [dispatch]
    );

    const updateQuantity = useCallback(
        async (cartItemId: string, newQuantity: number) => {
            await dispatch(updateQuantityAction(cartItemId, newQuantity));
        },
        [dispatch]
    );

    const removeFromCart = useCallback(
        async (cartItemId: string) => {
            await dispatch(removeFromCartAction(cartItemId));
        },
        [dispatch]
    );

    const placeOrder = useCallback(async () => {
        await dispatch(placeOrderAction());
    }, [dispatch]);

    return {
        ...cartState,
        totalAmount,
        resolveTableFromToken,
        addToCart,
        updateQuantity,
        removeFromCart,
        placeOrder,
    };
}