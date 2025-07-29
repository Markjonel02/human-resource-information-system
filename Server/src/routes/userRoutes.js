// routes.js
const express = require("express");
const router = express.Router();

// Corrected paths for controllers and middleware
// Please ensure these paths and filenames match your actual directory structure and file names.
const authController = require("../controllers/authController"); // Assuming authController.js
const employeecreationController = require("../controllers/userCreation"); // Assuming employeecreationController.js
const verifyJWT = require("../middlewares/verifyJWT"); // Assuming middleware/verifyJWT.js
const authorizeRoles = require("../middlewares/authorizeRole"); // Assuming middleware/authorizeRoles.js

// Authentication routes (public access) - These do NOT need JWT verification
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/refresh", authController.refreshToken);
router.post("/auth/logout", authController.logout);

// Apply verifyJWT middleware to all routes defined BELOW this line.
// This ensures that any subsequent route requires authentication.
router.use(verifyJWT);

// Admin-only routes for user creation and deletion, and full access to lists/details/updates
// 'verifyJWT' is already applied by 'router.use(verifyJWT)' above, so no need to add it again here.
router.post(
  "/create-employees",
  authorizeRoles("admin", "hr"), // Only admin can create employees
  employeecreationController.createEmployee
);

router.post(
  "/create-admin",
  authorizeRoles("admin"), // Only admin can create other admins
  employeecreationController.createAdmin
);

// Employee update route - Admin and Manager can update
router.put(
  "/employees/:id",
  authorizeRoles("admin", "manager"),
  employeecreationController.updateEmployee
);

// Routes for viewing employees - Admin and Manager can see all, Employee can see self
router.get(
  "/employees",
  authorizeRoles("admin", "hr_manager", "hr"), // Admin and Manager can get all employees
  employeecreationController.getAllEmployees
);

router.get(
  "/employees/:id",
  authorizeRoles("admin", "manager", "employee"), // Admin, Manager, and Employee (for self) can get by ID
  employeecreationController.getEmployeeById
);

module.exports = router;
