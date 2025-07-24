// middleware/authorizeRoles.js (or verifyRoles.js)

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if req.user exists and has a role property
    // The verifyJWT middleware should populate req.user with user information
    // For example, if verifyJWT sets req.user = { id: ..., username: ..., role: ... }
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User information or role not found." });
    }

    const rolesArray = [...allowedRoles];
    // Access the role from req.user.role
    const result = rolesArray.includes(req.user.role);

    if (result) {
      next();
    } else {
      res.status(403).json({
        message: "Forbidden: You do not have the necessary permissions.",
      });
    }
  };
};

module.exports = authorizeRoles;
