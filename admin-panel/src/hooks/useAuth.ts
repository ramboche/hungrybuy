import { login, logoutUser } from "@/store/actions/authAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCallback } from "react";

export default function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      return dispatch(login(email, password));
    },
    [dispatch],
  );

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  return {
    ...auth,
    login: handleLogin,
    logout: handleLogout,
  };
}
