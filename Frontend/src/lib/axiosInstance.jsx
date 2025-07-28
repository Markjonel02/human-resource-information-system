/* import axios from "axios";

import.meta.env.NODE_ENV === "development"
  ? "hhtp://localhost:5000/api"
  : "/api";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Include cookies in requests
});
 */
// lib/axiosInstance.js
import axios from "axios";

// Define the base URL dynamically based on environment variables.
// VITE_API_URL is typically used in Vite projects for environment variables.
// Fallback to localhost for development if the variable isn't set.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create a new Axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // Use the dynamically determined base URL
  headers: {
    "Content-Type": "application/json", // IMPORTANT: Ensure Content-Type is set for JSON payloads
  },
  withCredentials: true, // Include cookies (like refresh token) in requests
});

// Request Interceptor: Automatically attach the Authorization header with the access token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the accessToken from localStorage. This assumes it's stored there after login.
    const accessToken = localStorage.getItem("accessToken");

    // If an accessToken exists and the request is not to the login or register endpoint,
    // add it to the Authorization header.
    // Login/Register endpoints are where you *get* the token, so they don't need it.
    if (
      accessToken &&
      !config.url.includes("/auth/login") &&
      !config.url.includes("/auth/register")
    ) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration and refresh logic
axiosInstance.interceptors.response.use(
  (response) => response, // If response is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 Unauthorized and it's not a request we've already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as being retried

      try {
        // Attempt to refresh the token by calling your backend's refresh endpoint
        const refreshTokenResponse = await axiosInstance.get("/auth/refresh", {
          withCredentials: true, // This is crucial for sending the HTTP-only refresh token cookie
        });

        const newAccessToken = refreshTokenResponse.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken); // Store the new access token

        // Update the Authorization header for the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request with the new access token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        // If refresh fails (e.g., refresh token expired or invalid),
        // clear authentication data and potentially redirect to login.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user"); // Assuming you also store user info
        // You might want to add navigation here, e.g., window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    // For any other error (not 401 or already retried), just reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;
