const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message:
        "Unauthorized: Missing or improperly formatted Authorization header.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      message: "Unauthorized: Malformed token.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const errorName = err.name;

      if (errorName === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired. Please log in again.",
          logout: true,
        });
      }

      if (errorName === "JsonWebTokenError") {
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

    if (!decoded?.UserInfo) {
      return res.status(500).json({
        message: "Server Error: Token does not contain required user info.",
      });
    }

    req.user = decoded.UserInfo;
    next();
  });
};

module.exports = verifyJWT;
