import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
    name: string;
    phone: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
}

const getInitialUser = (): User | null => {
    if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        if (token && storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch {
                return null;
            }
        }
    }
    return null;
};

const initialState: AuthState = {
    user: getInitialUser(),
    isLoading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
    },
});

export const { setAuthLoading, setUser } = authSlice.actions;
export default authSlice.reducer;