/* const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided or invalid format." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid or expired token." });
    }
    req.user = decoded.UserInfo.id; // User ID
    req.username = decoded.UserInfo.username; // Username
    req.role = decoded.UserInfo.role; // User role
    next();
  });
};

module.exports = verifyJWT;
 */

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const verifyJWT = (req, res, next) => {
  // 1. Check for Authorization header
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Debugging: Log the received Authorization header
  console.log("Received Authorization Header:", authHeader);

  // If no header or it doesn't start with "Bearer ", return 401 Unauthorized
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided or invalid format." });
  }

  // 2. Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];

  // Debugging: Log the extracted token
  console.log("Extracted Token:", token);
  // Debugging: Log the JWT Secret being used
  console.log(
    "JWT_SECRET (from env):",
    process.env.JWT_SECRET ? "Loaded" : "NOT LOADED OR UNDEFINED"
  );

  // 3. Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Debugging: Log the JWT verification error
      console.error("JWT Verification Error:", err);

      // Differentiate between token expiration and invalid token for clearer messages
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token expired." });
      }
      if (err.name === "JsonWebTokenError") {
        return res
          .status(403)
          .json({ message: "Forbidden: Invalid token signature." });
      }
      // Generic forbidden for other verification errors
      return res
        .status(403)
        .json({ message: "Forbidden: Token verification failed." });
    }

    // 4. Attach user information from the decoded token payload to the request object
    // CRITICAL FIX: Ensure 'decoded.UserInfo' matches the case of what's in your token payload.
    // Most common convention is 'userInfo' (lowercase 'u').
    // Also, attach the entire user object to req.user for consistency with controllers.
    if (!decoded || !decoded.userInfo) {
      // Check for both 'UserInfo' and 'userInfo'
      console.error("Decoded token missing userInfo property:", decoded);
      return res
        .status(500)
        .json({ message: "Server Error: User information missing in token." });
    }

    // Assuming your token payload structure is { userInfo: { id: '...', username: '...', role: '...' } }
    req.user = decoded.userInfo; // Attach the entire userInfo object
    // Now, in your controllers, you can access req.user.id, req.user.username, req.user.role

    // Debugging: Log the decoded user information
    console.log("Decoded User Info:", req.user);

    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = verifyJWT;
