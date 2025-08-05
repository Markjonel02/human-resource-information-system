import { useEffect } from "react";
import axiosInstance from "../lib/axiosInstance";

/**
 * SessionPing periodically checks if the user's account is still active.
 * If the backend returns `logout: true`, the Axios interceptor will handle logout and toast.
 */
const SessionPing = () => {
  useEffect(() => {
    let intervalId = null;

    // Single ping request to backend
    const pingOnce = async () => {
      try {
        await axiosInstance.get("/auth/ping");
        // If account is active, nothing happens
      } catch (error) {
        // Logout and toast handled globally in axios interceptor
      }
    };

    // Start interval pinging
    const startPing = () => {
      if (!intervalId) {
        intervalId = setInterval(pingOnce, 60000); // every 60 seconds
      }
    };

    // Stop interval pinging
    const stopPing = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Manage ping based on tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPing();
        pingOnce(); // Immediate check on return to tab
      } else {
        stopPing();
      }
    };

    // Initial run on component mount
    if (document.visibilityState === "visible") {
      startPing();
      pingOnce(); // Immediate check after login
    }

    // Listen for tab visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up on unmount
    return () => {
      stopPing();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null; // This component renders nothing
};

export default SessionPing;
