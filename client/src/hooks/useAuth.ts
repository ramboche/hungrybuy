"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginAction, logoutAction } from "@/store/actions/authAction";
import { User } from "@/store/slices/authSlice";

export function useAuth() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    
    const authState = useAppSelector((state) => state.auth);

    const handleLogin = useCallback(
        (accessToken: string, refreshToken: string, userData: User) => {
            dispatch(loginAction(accessToken, refreshToken, userData));
            router.refresh();
        },
        [dispatch, router]
    );

    const handleLogout = useCallback(() => {
        dispatch(logoutAction());
        router.push("/");
    }, [dispatch, router]);

    return {
        ...authState, 
        login: handleLogin,
        logout: handleLogout,
    };
}