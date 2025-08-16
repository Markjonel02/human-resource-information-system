// routes.js
const express = require("express");
const router = express.Router();

// Corrected paths for controllers and middleware
// Please ensure these paths and filenames match your actual directory structure and file names.
const authController = require("../controllers/authController"); 
const Useradmin = require("../controllers/Admin/userAdmin"); 
const verifyJWT = require("../middlewares/verifyJWT"); 
const authorizeRoles = require("../middlewares/authorizeRole"); 

// Authentication routes (public access) - These do NOT need JWT verification
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/refresh", authController.refreshToken);
router.post("/auth/logout", authController.logout);

// Apply verifyJWT middleware to all routes defined BELOW this line.
// This ensures that any subsequent route requires authentication.
router.use(verifyJWT);
//ping if user i inactive or still active
router.post(
  "/create-employees",
  authorizeRoles("admin", "hr"), // Only admin can create employees
  Useradmin.createEmployee
);

// Employee update route - Admin and Manager can update
router.put(
  "/update-employee/:id",
  authorizeRoles("admin", "hr"),
  Useradmin.updateEmployee
);

// Routes for viewing employees - Admin and Manager can see all, Employee can see self
router.get(
  "/employees",
  authorizeRoles("admin", "hr_manager", "hr"), // Admin and Manager can get all employees
  Useradmin.getAllEmployees
);

router.get(
  "/employees/:id",
  authorizeRoles("admin", "employee", "hr"), // Admin, Manager, and Employee (for self) can get by ID
  Useradmin.getEmployeeById
);

//deactivate single user
router.put(
  "/deactivate-user/:id",
  authorizeRoles("admin", "hr"),
  Useradmin.deactiveSingle
);
router.post(
  "/deactivate-bulk",
  authorizeRoles("admin", "hr"),
  Useradmin.deactivateBulk
);
module.exports = router;
