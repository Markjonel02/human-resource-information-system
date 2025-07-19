const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(401).json({ message: "Unauthorized: Role not found." });
    }
    const rolesArray = [...allowedRoles];
    const result = rolesArray.includes(req.role); // Check if user's role is in the allowed roles

    if (result) {
      next();
    } else {
      res
        .status(403)
        .json({
          message: "Forbidden: You do not have the necessary permissions.",
        });
    }
  };
};

module.exports = authorizeRoles;
