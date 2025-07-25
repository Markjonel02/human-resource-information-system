// context/Auth.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize authState from localStorage or default to null
  const [authState, setAuthState] = useState(() => {
    try {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        console.log(
          "AuthContext: Found stored token and user, initializing as authenticated."
        );
        return {
          accessToken: storedToken,
          user: JSON.parse(storedUser), // Parse user object from string
          isAuthenticated: true,
        };
      }
    } catch (error) {
      console.error(
        "AuthContext: Failed to load auth state from localStorage:",
        error
      );
      // Clear localStorage if parsing fails to prevent infinite errors
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    console.log(
      "AuthContext: No stored token/user or error, initializing as not authenticated."
    );
    return { accessToken: null, user: null, isAuthenticated: false };
  });

  const navigate = useNavigate();

  // Function to handle user login
  const login = useCallback((accessToken, user) => {
    console.log(
      "AuthContext: Login function called, setting authState and localStorage."
    );
    setAuthState({ accessToken, user, isAuthenticated: true });
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user)); // Store user object as string
  }, []);

  // Function to handle user logout
  const logout = useCallback(() => {
    console.log(
      "AuthContext: Logout function called, clearing authState and localStorage."
    );
    setAuthState({ accessToken: null, user: null, isAuthenticated: false });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login"); // Redirect to login page after logout
  }, [navigate]);

  // Optional: A useEffect to handle token expiration or validation if needed
  useEffect(() => {
    // This effect can be used for more advanced token management,
    // like checking token expiry or attempting to refresh tokens automatically.
    // For now, the persistence is handled by the initial useState and login/logout functions.
    // You might add logic here to verify accessToken validity periodically.
    console.log("AuthContext: authState updated:", authState.isAuthenticated);
  }, [authState.isAuthenticated, authState.accessToken]);

  const value = {
    authState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
