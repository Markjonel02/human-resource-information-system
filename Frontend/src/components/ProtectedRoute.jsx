// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Auth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
