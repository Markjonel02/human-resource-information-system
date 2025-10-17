const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const authorizeRoles = require("../../../middlewares/authorizeRole");
const {
  getLateRecordsByEmployee,
  getLateStatsByEmployee,
  getAllEmployeesWithLate,
} = require("../../../controllers/Admin/dcuments/offenses");

// Apply JWT verification to all routes
router.use(verifyJWT);

// @route   GET /api/attendance/late/:employeeId
// @desc    Get all late records for a specific employee
// @access  Private (Admin, HR, or the employee themselves)
router.get(
  "/late/:employeeId",

  getLateRecordsByEmployee
);

router.get("/late-stats/:employeeId", getLateStatsByEmployee);

router.get(
  "/late-employees",
  authorizeRoles("admin", "hr"),
  getAllEmployeesWithLate
);

module.exports = router;
