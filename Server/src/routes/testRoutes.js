const express = require("express");
const router = express.Router();
//midlewares

const verifyJWT = require("../middlewares/verifyJWT");
const authorizeRoles = require("../middlewares/authorizeRole");
const testAttendance = require("../controllers/testAttendanceController");
const AttendanceLog = require("../models/attendanceLogSchema");

router.use(verifyJWT);

router.post(
  "/create-attendance",
  authorizeRoles("admin", "hr", "employee"),
  testAttendance.addAttendance
);

router.get(
  "/get-attendance",
  authorizeRoles("admin", "hr", "employee"),
  testAttendance.getAttendance
);
router.put(
  "/update-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.updateAttendance
);

router.delete(
  "/delete-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.deleteAttendance
);

router.get(
  "/attendance-logs",
  authorizeRoles("admin", "hr"),
  testAttendance.getAttendanceLogs
);
router.get(
  "/attendance-logs/employee/:employeeId",
  authorizeRoles("admin", "hr"),
  testAttendance.getEmployeeAttendanceLogs
);
router.get(
  "/attendance-logs/recent",
  authorizeRoles("admin", "hr"),
  testAttendance.getRecentAttendanceLogs
);

module.exports = router;
