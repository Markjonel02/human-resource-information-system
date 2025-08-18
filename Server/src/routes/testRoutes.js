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

// Middleware to restrict employees from updating/deleting other's records
const restrictEmployeeAccess = (req, res, next) => {
  const currentUser = req.user;

  // If user is an employee, add restriction for their own records only
  if (currentUser.role === "employee") {
    req.employeeRestriction = currentUser._id.toString();
  }
  next();
};

// ============ MAIN ATTENDANCE ROUTES ============

// GET /api/attendance - Main route for getting attendance records
// Role-based access: Admin/HR see all, employees see only their own
router.get(
  "/",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeAccess,
  testAttendance.getAttendance
);

// POST /api/attendance - Main route for creating attendance records
// Employee can create their own attendance, admin/hr can create for anyone
router.post(
  "/",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeCreation,
  testAttendance.addAttendance
);

// PUT /api/attendance/:id - Update attendance records
// Admin/HR can update any, employees can only update their own
router.put(
  "/:id",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeAccess,
  testAttendance.updateAttendance
);

// DELETE /api/attendance/:id - Delete attendance records
// Admin/HR can delete any, employees can only delete their own
router.delete(
  "/:id",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeAccess,
  testAttendance.deleteAttendance
);

// ============ LEGACY/ALTERNATIVE ROUTES ============

// Alternative POST route (for backward compatibility)
router.post(
  "/create-attendance",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeCreation,
  testAttendance.addAttendance
);

// Alternative GET route (for backward compatibility)
router.get(
  "/get-attendance",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeAccess,
  testAttendance.getAttendance
);

// ============ EMPLOYEE-SPECIFIC ROUTES ============

// Dedicated endpoint for employees to get their own attendance with enhanced features
router.get(
  "/my-attendance",
  authorizeRoles("employee"), // Only employees can access this
  testAttendance.getMyAttendance
);

// Get employee's attendance summary/statistics
router.get(
  "/my-attendance-summary",
  authorizeRoles("employee"),
  async (req, res) => {
    try {
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

// ============ ADMIN/HR ONLY ROUTES ============

// Admin/HR only - Update attendance records (legacy route)
router.put(
  "/update-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.updateAttendance
);

// Admin/HR only - Delete attendance records (legacy route)
router.delete(
  "/delete-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.deleteAttendance
);

// ============ ATTENDANCE LOGS ROUTES ============

// Admin/HR only - Get all attendance logs
router.get(
  "/logs",
  authorizeRoles("admin", "hr"),
  testAttendance.getAttendanceLogs
);

// Get specific employee's attendance logs
// Admin/HR can access any employee's logs, employees can only access their own
router.get(
  "/logs/employee/:employeeId",
  authorizeRoles("admin", "hr", "employee"),
  (req, res, next) => {
    const currentUser = req.user;
    const requestedEmployeeId = req.params.employeeId;

    // If user is an employee, they can only access their own logs
    if (currentUser.role === "employee") {
      if (requestedEmployeeId !== currentUser._id.toString()) {
        return res.status(403).json({
          message:
            "Access denied. Employees can only access their own attendance logs.",
        });
      }
    }
    next();
  },
  testAttendance.getEmployeeAttendanceLogs
);

// Allow employees to get their own attendance logs
router.get(
  "/logs/my-logs",
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
  "/logs/recent",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeAccess,
  testAttendance.getRecentAttendanceLogs
);

// Legacy route for attendance logs
router.get(
  "/attendance-logs",
  authorizeRoles("admin", "hr"),
  testAttendance.getAttendanceLogs
);

// Legacy route for employee attendance logs
router.get(
  "/attendance-logs/employee/:employeeId",
  authorizeRoles("admin", "hr", "employee"),
  (req, res, next) => {
    const currentUser = req.user;
    const requestedEmployeeId = req.params.employeeId;

    if (currentUser.role === "employee") {
      if (requestedEmployeeId !== currentUser._id.toString()) {
        return res.status(403).json({
          message:
            "Access denied. Employees can only access their own attendance logs.",
        });
      }
    }
    next();
  },
  testAttendance.getEmployeeAttendanceLogs
);

// Legacy route for employee's own logs
router.get(
  "/attendance-logs/my-logs",
  authorizeRoles("employee"),
  (req, res, next) => {
    req.params.employeeId = req.user._id.toString();
    next();
  },
  testAttendance.getEmployeeAttendanceLogs
);

// Legacy route for recent logs
router.get(
  "/attendance-logs/recent",
  authorizeRoles("admin", "hr", "employee"),
  restrictEmployeeAccess,
  testAttendance.getRecentAttendanceLogs
);

module.exports = router;
