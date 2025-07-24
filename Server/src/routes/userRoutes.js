// routes.js
const express = require("express");
const router = express.Router();

// Corrected paths for controllers and middleware
// Please ensure these paths and filenames match your actual directory structure and file names.
const authController = require("../controllers/authController"); // Assuming authController.js
const employeecreationController = require("../controllers/userCreation"); // Assuming employeecreationController.js
const verifyJWT = require("../middlewares/verifyJWT"); // Assuming middleware/verifyJWT.js
const authorizeRoles = require("../middlewares/authorizeRole"); // Assuming middleware/authorizeRoles.js

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
  verifyJWT,
  authorizeRoles("admin"),
  employeecreationController.createEmployee
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
