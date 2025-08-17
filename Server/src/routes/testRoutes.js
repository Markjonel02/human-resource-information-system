const express = require("express");
const router = express.Router();

// Middlewares
const verifyJWT = require("../middlewares/verifyJWT");
const authorizeRoles = require("../middlewares/authorizeRole");
const testAttendance = require("../controllers/testAttendanceController");
const AttendanceLog = require("../models/attendanceLogSchema");

router.use(verifyJWT);

// Middleware to restrict employees from creating attendance for other employees
const restrictEmployeeCreation = (req, res, next) => {
  const currentUser = req.user;
  const { employeeId } = req.body;

  // If user is an employee, they can only create attendance for themselves
  if (currentUser.role === "employee") {
    if (employeeId && employeeId !== currentUser._id.toString()) {
      return res.status(403).json({
        message:
          "Access denied. Employees can only create attendance records for themselves.",
      });
    }
    // If no employeeId provided, set it to current user
    if (!employeeId) {
      req.body.employeeId = currentUser._id.toString();
    }
  }
  next();
};

// Employee can create their own attendance, admin/hr can create for anyone
router.post(
  "/create-attendance",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeCreation,
  testAttendance.addAttendance
);

// Get attendance records - role-based access is handled in the controller
router.get(
  "/get-attendance",
  authorizeRoles("admin", "hr", "employee"),
  testAttendance.getAttendance
);

// NEW: Dedicated endpoint for employees to get their own attendance with enhanced features
router.get(
  "/my-attendance",
  authorizeRoles("employee"), // Only employees can access this
  testAttendance.getMyAttendance
);

// Admin/HR only - Update attendance records
router.put(
  "/update-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.updateAttendance
);

// Admin/HR only - Delete attendance records
router.delete(
  "/delete-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.deleteAttendance
);

// Admin/HR only - Get all attendance logs
router.get(
  "/attendance-logs",
  authorizeRoles("admin", "hr"),
  testAttendance.getAttendanceLogs
);

// Get specific employee's attendance logs
// Admin/HR can access any employee's logs, employees can only access their own
router.get(
  "/attendance-logs/employee/:employeeId",
  authorizeRoles("admin", "hr", "employee"),
  testAttendance.getEmployeeAttendanceLogs
);

// NEW: Allow employees to get their own attendance logs
router.get(
  "/attendance-logs/my-logs",
  authorizeRoles("employee"),
  (req, res, next) => {
    // Set the employeeId to current user's ID for employees
    req.params.employeeId = req.user._id.toString();
    next();
  },
  testAttendance.getEmployeeAttendanceLogs
);

// Get recent attendance logs - role-based filtering handled in controller
router.get(
  "/attendance-logs/recent",
  authorizeRoles("admin", "hr", "employee"),
  testAttendance.getRecentAttendanceLogs
);

// NEW: Additional convenience routes for employees

// Get employee's attendance summary/statistics
router.get(
  "/my-attendance-summary",
  authorizeRoles("employee"),
  async (req, res) => {
    try {
      // You can create a dedicated controller function for this, or handle it here
      const { startDate, endDate } = req.query;

      // Redirect to getMyAttendance with summary flag
      req.query.summaryOnly = true;
      testAttendance.getMyAttendance(req, res);
    } catch (error) {
      console.error("Error in attendance summary:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

module.exports = router;
