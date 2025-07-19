const jwt = require("jsonwebtoken");
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
