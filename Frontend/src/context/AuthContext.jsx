// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-check session with refresh token
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("/auth/refresh", { withCredentials: true });
        setIsAuthenticated(true);
        setUser(res.data.user);
        localStorage.setItem("isAuthenticated", "true");
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
    } catch (e) {
      console.warn("Logout request failed", e);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("isAuthenticated");
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
