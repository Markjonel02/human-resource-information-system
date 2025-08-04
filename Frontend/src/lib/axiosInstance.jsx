import axios from "axios";
import { showToast } from "../lib/toastService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const isLoginPage = window.location.pathname === "/login";
    const status = error?.response?.status;
    const logoutFlag = error?.response?.data?.logout;

    // ✅ Case 1: Force logout due to status change or expired token
    if (logoutFlag && status === 401) {
      showToast({
        title: "Session Ended",
        description:
          error.response.data.message ||
          "You have been logged out automatically.",
        status: "warning",
      });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (!isLoginPage) {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // ✅ Case 2: Attempt token refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axiosInstance.get("/auth/refresh");
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
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

    return Promise.reject(error);
  }
);

export default axiosInstance;
