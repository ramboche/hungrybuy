import { AppDispatch } from "../index";
import { setAuthLoading, setUser, User } from "../slices/authSlice";
import { api } from "@/lib/api";

export const initializeAuthAction = () => async (dispatch: AppDispatch) => {
  dispatch(setAuthLoading(true));

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      dispatch(setUser(null));
    }
  }

  dispatch(setAuthLoading(false));
};

export const loginAction = (accessToken: string, userData: User) => async (dispatch: AppDispatch) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  dispatch(setUser(userData));
};

export const logoutAction = () => async (dispatch: AppDispatch) => {
  try {
    await api.post("/auth/logout"); 
  } catch (error) {
    console.error("Logout API failed", error);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    dispatch(setUser(null));
    window.location.href = "/"; 
  }
};