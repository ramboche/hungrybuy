import { api } from "@/api/axios";
import { AppDispatch } from "..";
import { startAuth, setAuth, setError, logout } from "@/store/slices/authSlice";

export const login =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(startAuth());

      const result = await api.post("/admin/login", { email, password });
      const resData = result.data;

      // dev-log
      console.log(resData);

      dispatch(
        setAuth({
          user: resData.data.user,
          accessToken: resData.data.accessToken,
        }),
      );

      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";

      dispatch(setError(message));
      return { success: false, message };
    }
  };

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(startAuth());
    await api.post("/admin/logout");
  } catch (error) {
    // dev-log
    console.log(error);
  } finally {
    dispatch(logout());
  }
};
