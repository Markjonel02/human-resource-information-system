const express = require("express");
const router = express.Router();
const authController = require("../controllers/authcontroller");
const { verifyToken } = require("../middleware/authMiddleware");


router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/profile", verifyToken, authController.getProfile);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
module.exports = router;
// routes.js
const express = require("express");
const authController = require("./controllers/authController");
const employeecreationController = require("./controllers/employeecreationController");
const verifyJWT = require("./middleware/verifyJWT");
const authorizeRoles = require("./middleware/authorizeRoles");

// Create an Express Router instance

// Authentication routes (public access)
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/refresh", authController.refreshToken);
router.post("/auth/logout", authController.logout);

// Employee routes (protected by JWT and role authorization)
// Apply verifyJWT to all routes below this line that need authentication
// Note: verifyJWT is applied as middleware to the router for all subsequent routes
router.use(verifyJWT);

// Admin-only routes for employee creation and deletion, and full access to lists/details/updates
router.post(
  "/employees",
  authorizeRoles("admin"),
  employeecreationController.createEmployee
);
router.delete(
  "/employees/:id",
  authorizeRoles("admin"),
  employeecreationController.deleteEmployee
);
router.put(
  "/employees/:id",
  authorizeRoles("admin", "manager"),
  employeecreationController.updateEmployee
); // Managers can also update

// Routes for viewing employees - Admin and Manager can see all, Employee can see self
router.get(
  "/employees",
  authorizeRoles("admin", "manager"),
  employeecreationController.getAllEmployees
);
router.get(
  "/employees/:id",
  authorizeRoles("admin", "manager", "employee"),
  employeecreationController.getEmployeeById
);

module.exports = router;
