// controllers/attendanceController.js
const Attendance = require("../../models/attendance");
const Leave = require("../../models/LeaveSchema/leaveSchema");

/**
 * Get current user's Daily Time Record (DTR)
 * @route GET /api/attendance/my-dtr
 * @query {number} year - Year (default: current year)
 * @query {number} month - Month (1-12, default: current month)
 */
exports.getMyDTR = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have auth middleware that sets req.user
    const { year, month } = req.query;

    // Default to current year and month if not provided
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Validate month
    if (targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Must be between 1 and 12",
      });
    }

    // Calculate start and end dates for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Fetch attendance records for the specified month
    const attendanceRecords = await Attendance.find({
      employee: userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("leaveRequest", "leaveType")
      .sort({ date: 1 })
      .lean();

    // Format the records for DTR display
    const formattedRecords = attendanceRecords.map((record) => {
      const date = new Date(record.date);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

      // Format check-in and check-out times
      const checkInTime = record.checkIn
        ? new Date(record.checkIn).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : null;

      const checkOutTime = record.checkOut
        ? new Date(record.checkOut).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : null;

      // Convert hours rendered from minutes to HH:MM format
      const totalHours = record.hoursRendered
        ? `${String(Math.floor(record.hoursRendered / 60)).padStart(
            2,
            "0"
          )}:${String(record.hoursRendered % 60).padStart(2, "0")}`
        : null;

      // Convert tardiness from minutes to HH:MM format
      const lateTime =
        record.tardinessMinutes > 0
          ? `${String(Math.floor(record.tardinessMinutes / 60)).padStart(
              2,
              "0"
            )}:${String(record.tardinessMinutes % 60).padStart(2, "0")}`
          : null;

      return {
        date: date.toISOString().split("T")[0], // YYYY-MM-DD format
        day: dayOfWeek,
        status: record.status,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        totalHours: totalHours,
        hoursRenderedMinutes: record.hoursRendered,
        late: lateTime,
        tardinessMinutes: record.tardinessMinutes,
        isLate: record.status === "late" || record.tardinessMinutes > 0,
        isAbsent: record.status === "absent",
        isOnLeave: record.status === "on_leave",
        leaveType: record.leaveRequest?.leaveType || null,
      };
    });

    // Calculate summary statistics
    const summary = {
      totalDays: formattedRecords.length,
      presentDays: formattedRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length,
      absentDays: formattedRecords.filter((r) => r.status === "absent").length,
      lateDays: formattedRecords.filter((r) => r.isLate).length,
      leaveDays: formattedRecords.filter((r) => r.status === "on_leave").length,
      totalHoursWorked: formattedRecords.reduce(
        (sum, r) => sum + (r.hoursRenderedMinutes || 0),
        0
      ),
      totalTardinessMinutes: formattedRecords.reduce(
        (sum, r) => sum + (r.tardinessMinutes || 0),
        0
      ),
    };

    // Convert total hours to HH:MM format
    summary.totalHoursWorkedFormatted = `${String(
      Math.floor(summary.totalHoursWorked / 60)
    ).padStart(2, "0")}:${String(summary.totalHoursWorked % 60).padStart(
      2,
      "0"
    )}`;

    summary.totalTardinessFormatted = `${String(
      Math.floor(summary.totalTardinessMinutes / 60)
    ).padStart(2, "0")}:${String(summary.totalTardinessMinutes % 60).padStart(
      2,
      "0"
    )}`;

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        records: formattedRecords,
        summary: summary,
      },
    });
  } catch (error) {
    console.error("Error fetching DTR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching daily time records",
      error: error.message,
    });
  }
};

/**
 * Get current user's leave balances and history
 * @route GET /api/attendance/my-leave-credits
 * @query {string} status - Filter by leave status (pending, approved, rejected)
 * @query {number} year - Year to filter leaves (optional)
 */
exports.getMyLeaveCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, year } = req.query;

    // Build query
    const query = { employee: userId };

    if (status) {
      query.leaveStatus = status;
    }

    // If year is provided, filter by date range
    if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
      query.dateFrom = { $gte: startDate };
      query.dateTo = { $lte: endDate };
    }

    // Fetch leave records
    const leaveRecords = await Leave.find(query)
      .populate("approvedBy", "firstName lastName")
      .populate("rejectedBy", "firstName lastName")
      .sort({ dateFrom: -1 })
      .lean();

    // Calculate leave balances by type for approved leaves
    const approvedLeaves = await Leave.find({
      employee: userId,
      leaveStatus: "approved",
    }).lean();

    const leaveBalances = {
      VL: 0, // Vacation Leave
      SL: 0, // Sick Leave
      FL: 0, // This might be mapped from your leave types
      MLPL: 0, // Maternity/Paternity Leave
      LWOP: 0, // Leave Without Pay
    };

    // Sum up approved leave days by type
    approvedLeaves.forEach((leave) => {
      if (leaveBalances.hasOwnProperty(leave.leaveType)) {
        leaveBalances[leave.leaveType] += leave.totalLeaveDays;
      }
    });

    // Format leave records for response
    const formattedLeaves = leaveRecords.map((leave) => ({
      id: leave._id,
      leaveType: leave.leaveType,
      dateFrom: leave.dateFrom,
      dateTo: leave.dateTo,
      totalDays: leave.totalLeaveDays,
      notes: leave.notes,
      status: leave.leaveStatus,
      approvedBy: leave.approvedBy
        ? `${leave.approvedBy.firstName} ${leave.approvedBy.lastName}`
        : null,
      approvedAt: leave.approvedAt,
      rejectedBy: leave.rejectedBy
        ? `${leave.rejectedBy.firstName} ${leave.rejectedBy.lastName}`
        : null,
      rejectedAt: leave.rejectedAt,
      rejectionReason: leave.rejectionReason,
      createdAt: leave.createdAt,
    }));

    // Calculate statistics
    const statistics = {
      totalLeavesTaken:
        leaveBalances.VL + leaveBalances.SL + leaveBalances.LWOP,
      pendingRequests: leaveRecords.filter((l) => l.leaveStatus === "pending")
        .length,
      approvedRequests: leaveRecords.filter((l) => l.leaveStatus === "approved")
        .length,
      rejectedRequests: leaveRecords.filter((l) => l.leaveStatus === "rejected")
        .length,
    };

    res.status(200).json({
      success: true,
      data: {
        leaveBalances: leaveBalances,
        leaveRecords: formattedLeaves,
        statistics: statistics,
      },
    });
  } catch (error) {
    console.error("Error fetching leave credits:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave credits",
      error: error.message,
    });
  }
};

/**
 * Get specific date attendance record for current user
 * @route GET /api/attendance/my-dtr/:date
 * @param {string} date - Date in YYYY-MM-DD format
 */
exports.getMyAttendanceByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Parse the date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Set time to start and end of day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const attendance = await Attendance.findOne({
      employee: userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("leaveRequest", "leaveType notes")
      .lean();

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No attendance record found for this date",
      });
    }

    // Format the response
    const formattedAttendance = {
      date: attendance.date,
      day: new Date(attendance.date).toLocaleDateString("en-US", {
        weekday: "long",
      }),
      status: attendance.status,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      totalHours: attendance.hoursRendered
        ? `${String(Math.floor(attendance.hoursRendered / 60)).padStart(
            2,
            "0"
          )}:${String(attendance.hoursRendered % 60).padStart(2, "0")}`
        : null,
      hoursRenderedMinutes: attendance.hoursRendered,
      lateTime: attendance.tardinessMinutes
        ? `${String(Math.floor(attendance.tardinessMinutes / 60)).padStart(
            2,
            "0"
          )}:${String(attendance.tardinessMinutes % 60).padStart(2, "0")}`
        : null,
      tardinessMinutes: attendance.tardinessMinutes,
      isLate: attendance.status === "late" || attendance.tardinessMinutes > 0,
      isAbsent: attendance.status === "absent",
      isOnLeave: attendance.status === "on_leave",
      leaveDetails: attendance.leaveRequest || null,
    };

    res.status(200).json({
      success: true,
      data: formattedAttendance,
    });
  } catch (error) {
    console.error("Error fetching attendance by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance record",
      error: error.message,
    });
  }
};

/**
 * Get DTR for a date range
 * @route GET /api/attendance/my-dtr-range
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 */
exports.getMyDTRRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before or equal to end date",
      });
    }

    // Set time boundaries
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      employee: userId,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("leaveRequest", "leaveType")
      .sort({ date: 1 })
      .lean();

    // Format records (similar to getMyDTR)
    const formattedRecords = attendanceRecords.map((record) => {
      const date = new Date(record.date);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

      const checkInTime = record.checkIn
        ? new Date(record.checkIn).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : null;

      const checkOutTime = record.checkOut
        ? new Date(record.checkOut).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : null;

      const totalHours = record.hoursRendered
        ? `${String(Math.floor(record.hoursRendered / 60)).padStart(
            2,
            "0"
          )}:${String(record.hoursRendered % 60).padStart(2, "0")}`
        : null;

      const lateTime =
        record.tardinessMinutes > 0
          ? `${String(Math.floor(record.tardinessMinutes / 60)).padStart(
              2,
              "0"
            )}:${String(record.tardinessMinutes % 60).padStart(2, "0")}`
          : null;

      return {
        date: date.toISOString().split("T")[0],
        day: dayOfWeek,
        status: record.status,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        totalHours: totalHours,
        hoursRenderedMinutes: record.hoursRendered,
        late: lateTime,
        tardinessMinutes: record.tardinessMinutes,
        isLate: record.status === "late" || record.tardinessMinutes > 0,
        isAbsent: record.status === "absent",
        isOnLeave: record.status === "on_leave",
        leaveType: record.leaveRequest?.leaveType || null,
      };
    });

    // Calculate summary
    const summary = {
      dateRange: {
        from: startDate,
        to: endDate,
      },
      totalDays: formattedRecords.length,
      presentDays: formattedRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length,
      absentDays: formattedRecords.filter((r) => r.status === "absent").length,
      lateDays: formattedRecords.filter((r) => r.isLate).length,
      leaveDays: formattedRecords.filter((r) => r.status === "on_leave").length,
      totalHoursWorked: formattedRecords.reduce(
        (sum, r) => sum + (r.hoursRenderedMinutes || 0),
        0
      ),
      totalTardinessMinutes: formattedRecords.reduce(
        (sum, r) => sum + (r.tardinessMinutes || 0),
        0
      ),
    };

    summary.totalHoursWorkedFormatted = `${String(
      Math.floor(summary.totalHoursWorked / 60)
    ).padStart(2, "0")}:${String(summary.totalHoursWorked % 60).padStart(
      2,
      "0"
    )}`;

    summary.totalTardinessFormatted = `${String(
      Math.floor(summary.totalTardinessMinutes / 60)
    ).padStart(2, "0")}:${String(summary.totalTardinessMinutes % 60).padStart(
      2,
      "0"
    )}`;

    res.status(200).json({
      success: true,
      data: {
        records: formattedRecords,
        summary: summary,
      },
    });
  } catch (error) {
    console.error("Error fetching DTR range:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching date range records",
      error: error.message,
    });
  }
};
