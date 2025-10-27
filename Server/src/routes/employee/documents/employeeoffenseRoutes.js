const express = require("express");
const router = express.Router();

// Controllers
const {
  getMyOffenses,
  getOffenseById,
  getOffenseStats,
} = require("../../../controllers/employee/documents/employeeoffensesController");

// Middlewares
const verifyJWT = require("../../../middlewares/verifyJWT");
const authorizeRoles = require("../../../middlewares/authorizeRole");

// ===================================================================
// 🔒 All routes below are PRIVATE (require authentication)
// ===================================================================

// Apply authentication middleware to all routes
router.use(verifyJWT);

// @desc    Get all offenses for the logged-in employee
// @route   GET /api/employee/my-offenses
// @access  Private (Employee only)
router.get("/my-offenses", authorizeRoles("employee"), getMyOffenses);

// @desc    Get a specific offense by ID (only if it belongs to the employee)
// @route   GET /api/employee/offenses/:offenseId
// @access  Private (Employee only)
router.get("/offenses/:offenseId", authorizeRoles("employee"), getOffenseById);

// @desc    Get offense statistics for the employee
// @route   GET /api/employee/offense-stats
// @access  Private (Employee only)
router.get("/offense-stats", authorizeRoles("employee"), getOffenseStats);

module.exports = router;
