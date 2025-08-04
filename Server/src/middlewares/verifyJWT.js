// middleware/verifyJWT.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env

/**
 * Middleware to verify JWT access tokens
 */
const verifyJWT = (req, res, next) => {
  // ----------------------------
  // Step 1: Extract Authorization Header
  // ----------------------------
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Header must exist and start with "Bearer "
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message:
        "Unauthorized: Missing or improperly formatted Authorization header.",
    });
  }

  // ----------------------------
  // Step 2: Extract Token from Header
  // ----------------------------
  const token = authHeader.split(" ")[1];

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      message: "Unauthorized: Malformed token.",
    });
  }

  // ----------------------------
  // Step 3: Verify Token
  // ----------------------------
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const { name } = err;

      // Handle common JWT errors explicitly
      if (name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired. Please log in again.",
          logout: true, // Trigger frontend logout
        });
      }

      if (name === "JsonWebTokenError") {
        return res.status(403).json({
          message: "Invalid token signature. You have been logged out.",
          logout: true,
        });
      }

      // Catch-all for other JWT errors
      return res.status(403).json({
        message: "Forbidden: Token verification failed.",
        logout: true,
      });
    }

    // ----------------------------
    // Step 4: Check Decoded Payload
    // ----------------------------
    if (!decoded?.UserInfo) {
      return res.status(500).json({
        message: "Server Error: Token does not contain required user info.",
      });
    }

    // Attach user info to the request object for downstream use
    req.user = decoded.UserInfo;

    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = verifyJWT;
