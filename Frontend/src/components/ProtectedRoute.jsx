// src/components/ProtectedRoute.js
import React from "react"; // Import React as it's a React component
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Correct path to Auth context

const ProtectedRoute = ({ children }) => {
  // Correctly access authState from the useAuth hook
  const { authState } = useAuth();

  // Add console logs to help debug the authentication status
  console.log("ProtectedRoute: Checking authentication state.");
  console.log("ProtectedRoute: authState:", authState);
  console.log("ProtectedRoute: isAuthenticated:", authState.isAuthenticated);

  // If the user is not authenticated, redirect them to the login page
  if (!authState.isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />; // Use `replace` to prevent going back to login via back button
  }

  // If authenticated, render the children (the protected component)
  console.log("ProtectedRoute: Authenticated, rendering children.");
  return children;
};

export default ProtectedRoute;
