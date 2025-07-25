import axios from "axios";

import.meta.env.NODE_ENV === "development"
  ? "hhtp://localhost:5000/api"
  : "/api";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Include cookies in requests
});
