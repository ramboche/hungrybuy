
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useCallback } from "react";

export const useApiAuthError = () => {
  const router = useRouter();

  const handleAuthError = useCallback((error: unknown, contextMessage?: string) => {
    const err = error as AxiosError;
    if (contextMessage) {
      console.error(contextMessage, err);
    } else {
      console.error("API Error:", err);
    }

    if (err.response && err.response.status === 401) {
      localStorage.removeItem("accessToken");   
      router.push("/login");
    }
  }, [router]);

  return { handleAuthError };
};