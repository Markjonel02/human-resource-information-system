import axios from "axios";
import { showToast } from "../lib/toastService";

// Base URL setup
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Optional: include cookies if your backend uses refresh tokens via cookies
});

// --- REQUEST INTERCEPTOR ---
// Automatically attach access token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    const isAuthRoute =
      config.url.includes("/auth/login") ||
      config.url.includes("/auth/register") ||
      config.url.includes("/auth/refresh");

    if (accessToken && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
// Handle token expiration, deactivation, or forced logout
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const data = error?.response?.data;
    const logoutFlag = data?.logout;
    const isLoginPage = window.location.pathname === "/login";

    // Force logout due to deactivation or manual invalidation
    if (logoutFlag && status === 401) {
      showToast({
        title: "Session Ended",
        description: data?.message || "You have been logged out automatically.",
        status: "warning",
      });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (!isLoginPage) {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // Token expired: try refreshing once
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const newAccessToken = res.data.accessToken;

        // Save new token
        localStorage.setItem("accessToken", newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, force logout
        showToast({
          title: "Session Expired",
          description: "Please log in again.",
          status: "error",
        });

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        if (!isLoginPage) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Default error handler
    console.error("❌ Axios Error:", {
      url: originalRequest?.url,
      status,
      data,
    });

    return Promise.reject(error);
  }
);

export default axiosInstance;
