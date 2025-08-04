// lib/axiosInstance.js
import axios from "axios";

// ----------------------
// BASE URL Configuration
// ----------------------
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ----------------------
// Axios Instance Setup
// ----------------------
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Needed for sending cookies (like refresh tokens)
});

// ----------------------
// Request Interceptor
// ----------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

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
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const isLoginPage = window.location.pathname === "/login";
    const status = error?.response?.status;
    const logoutFlag = error?.response?.data?.logout;

    // --- Case 1: Forced logout (invalid token or refresh token expired) ---
    if (logoutFlag && status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      // Don't reload if already on login page
      if (!isLoginPage) {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // --- Case 2: Try refreshing access token ---
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axiosInstance.get("/auth/refresh");
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        if (!isLoginPage) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
