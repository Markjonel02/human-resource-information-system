// routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMyDTR,
  /*   getMyLeaveCredits, */
  getMyAttendanceByDate,
  getMyDTRRange,
  getMyOvertime, // added
} = require("../../controllers/Dtr/DtrController.js");
const verifyJWT = require("../../middlewares/verifyJWT");

router.use(verifyJWT);

// Apply authentication middleware to all routes

// @route   GET /api/attendance/my-dtr
// @desc    Get current user's monthly DTR
// @access  Private
// @query   year (optional), month (optional)
router.get("/my-dtr", getMyDTR);

// @route   GET /api/attendance/my-dtr-range
// @desc    Get current user's DTR for a date range
// @access  Private
// @query   startDate (required), endDate (required)
router.get("/my-dtr-range", getMyDTRRange);

// @route   GET /api/attendance/my-dtr/:date
// @desc    Get current user's attendance for a specific date
// @access  Private
// @param   date (YYYY-MM-DD)
router.get("/my-dtr/:date", getMyAttendanceByDate);

// @route   GET /api/attendance/my-leave-credits
// @desc    Get current user's leave balances and history
// @access  Private
// @query   status (optional), year (optional)
/* router.get("/my-leave-credits", getMyLeaveCredits); */

// @route   GET /api/attendance/my-overtime
// @desc    Get current user's overtime requests
// @access  Private
router.get("/my-overtime", getMyOvertime);

module.exports = router;
