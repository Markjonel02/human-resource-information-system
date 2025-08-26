const express = require("express");
const router = express.Router();

// Middlewares
const verifyJWT = require("../../middlewares/verifyJWT");
const authorizeRoles = require("../../middlewares/authorizeRole");
const testAttendance = require("../../controllers/testAttendanceController");
// Note: AttendanceLog model is not directly used in routes, but good to keep for context
const AttendanceLog = require("../../models/attendanceLogSchema");

// All routes in this file are protected by JWT verification
router.use(verifyJWT);

// ============ MAIN ATTENDANCE ROUTES (ADMIN/HR ONLY) ============

// GET /api/attendance - Get all attendance records
router.get("/", authorizeRoles("admin", "hr"), testAttendance.getAttendance);

// POST /api/attendance - Create a new attendance record for an employee
router.post("/", authorizeRoles("admin", "hr"), testAttendance.addAttendance);

// PUT /api/attendance/:id - Update an existing attendance record
router.put(
  "/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.updateAttendance
);

// DELETE /api/attendance/:id - Delete an attendance record
router.delete(
  "/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.deleteAttendance
);

// ============ LEGACY ATTENDANCE ROUTES (ADMIN/HR ONLY) ============

// POST /api/attendance/create-attendance - Legacy route for creating records
router.post(
  "/create-attendance",
  authorizeRoles("admin", "hr"),
  testAttendance.addAttendance
);

// GET /api/attendance/get-attendance - Legacy route for getting records
router.get(
  "/get-attendance",
  authorizeRoles("admin", "hr"),
  testAttendance.getAttendance
);

// PUT /api/attendance/update-attendance/:id - Legacy route for updating records
router.put(
  "/update-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.updateAttendance
);

// DELETE /api/attendance/delete-attendance/:id - Legacy route for deleting records
router.delete(
  "/delete-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.deleteAttendance
);

// ============ ATTENDANCE LOGS ROUTES (ADMIN/HR ONLY) ============

// GET /api/attendance/logs - Get all attendance logs
router.get(
  "/logs",
  authorizeRoles("admin", "hr"),
  testAttendance.getAttendanceLogs
);

// GET /api/attendance/logs/employee/:employeeId - Get a specific employee's logs
router.get(
  "/logs/employee/:employeeId",
  authorizeRoles("admin", "hr"),
  testAttendance.getEmployeeAttendanceLogs
);

// GET /api/attendance/logs/recent - Get recent attendance logs
router.get(
  "/logs/recent",
  authorizeRoles("admin", "hr"),
  testAttendance.getRecentAttendanceLogs
);

// ============ LEGACY LOGS ROUTES (ADMIN/HR ONLY) ============

// GET /api/attendance/attendance-logs - Legacy route for all logs
router.get(
  "/attendance-logs",
  authorizeRoles("admin", "hr"),
  testAttendance.getAttendanceLogs
);

// GET /api/attendance/attendance-logs/employee/:employeeId - Legacy route for employee logs
router.get(
  "/attendance-logs/employee/:employeeId",
  authorizeRoles("admin", "hr"),
  testAttendance.getEmployeeAttendanceLogs
);

// GET /api/attendance/attendance-logs/recent - Legacy route for recent logs
router.get(
  "/attendance-logs/recent",
  authorizeRoles("admin", "hr"),
  testAttendance.getRecentAttendanceLogs
);

// ============ LEAVES ============
router.post(
  "/approve-leave/:id",
  authorizeRoles("admin"),
  testAttendance.approveLeave
);

// Approve multiple leaves in bulk (Admin only)
router.post(
  "/approve-leave-bulk",
  authorizeRoles("admin"),
  testAttendance.approveLeaveBulk
);

router.get(
  "/get-leave-requests",
  authorizeRoles("admin",),
  testAttendance.getAllLeaveRequests
);

module.exports = router;
