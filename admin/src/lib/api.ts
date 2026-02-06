import axios from "axios";

// 1. Define Base URL (Change to match your backend)
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 2. Create the Axios Instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. Request Interceptor: Auto-attach Token
api.interceptors.request.use(
  (config) => {
    // Check if we are in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 4. Response Interceptor: Optional global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Auto-logout on 401 Unauthorized
    if (error.response?.status === 401) {
      // logic to redirect to login could go here
    }
    return Promise.reject(error);
  },
);
