import axios from "axios";

// Change this to your actual backend URL (e.g., http://localhost:5000/api)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // We will store token here
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
