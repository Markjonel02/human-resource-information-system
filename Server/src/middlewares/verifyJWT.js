// middleware/verifyJWT.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user"); // ✅ Import your User model

dotenv.config(); // Load environment variables from .env

/**
 * Middleware to verify JWT access tokens
 * and force logout if user is inactive
 */
const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message:
        "Unauthorized: Missing or improperly formatted Authorization header.",
      logout: true,
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      message: "Unauthorized: Malformed token.",
      logout: true,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      const { name } = err;

      if (name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired. Please log in again.",
          logout: true,
        });
      }

      if (name === "JsonWebTokenError") {
        return res.status(403).json({
          message: "Invalid token signature. You have been logged out.",
          logout: true,
        });
      }

      return res.status(403).json({
        message: "Forbidden: Token verification failed.",
        logout: true,
      });
    }

    if (!decoded?.UserInfo?.id) {
      return res.status(500).json({
        message: "Server Error: Token does not contain required user info.",
        logout: true,
      });
    }

    try {
      // ✅ Check if user is still active
      const user = await User.findById(decoded.UserInfo.id).lean();

      if (!user) {
        return res.status(401).json({
          message: "User not found. Please log in again.",
          logout: true,
        });
      }

      if (user.employeeStatus !== 1) {
        return res.status(403).json({
          message:
            "Your account has been disabled. Please contact administration.",
          logout: true,
        });
      }

      // Attach live user info (optional but more accurate)
      req.user = {
        id: user._id,
        username: user.username,
        role: user.role,
      };

      next();
    } catch (dbError) {
      console.error("verifyJWT DB error:", dbError);
      return res.status(500).json({
        message: "Internal server error while verifying user status.",
        logout: true,
      });
    }
  });
};

module.exports = verifyJWT;
