const express = require("express");
const router = express.Router();

// Controllers
const {
  getMyOffenses,
  getOffenseById,
  getOffenseStats,
} = require("../../../controllers/employee/documents/employeeoffensesController");

// Middleware for authentication
// ===================================================================
// 🔒 All routes below are PRIVATE (require authentication)
// ===================================================================

// @desc    Get all offenses for the logged-in employee
// @route   GET /api/employee/my-offenses
// @access  Private (Employee only)
router.get("/my-offenses", getMyOffenses);

// @desc    Get a specific offense by ID (only if it belongs to the employee)
// @route   GET /api/employee/offenses/:offenseId
// @access  Private (Employee only)
router.get("/offenses/:offenseId", getOffenseById);

// @desc    Get offense statistics for the employee
// @route   GET /api/employee/offense-stats
// @access  Private (Employee only)
router.get("/offense-stats", getOffenseStats);

module.exports = router;
