// lib/axiosInstance.js
import axios from "axios";
import { toast } from "@chakra-ui/react";

// ----------------------
// BASE URL Configuration
// ----------------------
// Priority:
// 1. VITE_API_URL (from .env file)
// 2. Fallback to localhost for development
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ----------------------
// Axios Instance Setup
// ----------------------
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json", // Ensures JSON payloads
  },
  withCredentials: true, // Sends cookies (e.g., refreshToken)
});

// ----------------------
// Request Interceptor
// ----------------------
// Automatically adds accessToken to protected routes
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    // Skip adding token for login and register routes
    const isAuthRoute =
      config.url.includes("/auth/login") ||
      config.url.includes("/auth/register");

    if (accessToken && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------
// Response Interceptor
// ----------------------
// Handles:
// - Expired access token (401)
// - Refresh token errors
// - Logout redirection
axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses through

  async (error) => {
    const originalRequest = error.config;
    const isLoginPage = window.location.pathname === "/login";
    const status = error?.response?.status;
    const logoutFlag = error?.response?.data?.logout;

    // --- Case 1: Forced Logout (401 + logout flag) ---
    if (logoutFlag && status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (isLoginPage) {
        toast({
          title: "Session expired",
          description: "Please login again.",
          status: "warning",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      } else {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // --- Case 2: Access Token Expired, Try Refresh ---
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try refreshing access token
        const res = await axiosInstance.get("/auth/refresh");
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed → force logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        if (isLoginPage) {
          toast({
            title: "Session expired",
            description: "Please login again.",
            status: "warning",
            duration: 4000,
            isClosable: true,
            position: "top",
          });
        } else {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // --- Case 3: Other errors ---
    return Promise.reject(error);
  }
);

export default axiosInstance;
