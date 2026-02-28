"use client";

import { Provider } from "react-redux";
import { store } from "../../store/index";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { initializeAuthAction } from "../../store/actions/authAction";
import { api } from "@/lib/api";
import { fetchCartAction } from "@/store/actions/cartAction";

function AppInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const tableToken = useAppSelector((state) => state.cart.tableToken);

    useEffect(() => {
        dispatch(initializeAuthAction());
        if (tableToken) {
            api.defaults.headers.common["x-table-token"] = tableToken;
            dispatch(fetchCartAction());
        }
    }, [dispatch, tableToken]);

    return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AppInitializer>
                {children}
            </AppInitializer>
        </Provider>
    );
}