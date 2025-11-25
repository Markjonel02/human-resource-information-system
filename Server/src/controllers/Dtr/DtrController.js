// controllers/attendanceController.js
const Attendance = require("../../models/attendance");
const Leave = require("../../models/LeaveSchema/leaveSchema");
const OverTime = require("../../models/overtimeSchema");
const LeaveCredits = require("../../models/LeaveSchema/leaveCreditsSchema");

// helper to format minutes -> "HH:MM"
const formatMinutes = (minutes = 0) => {
  if (minutes === null || minutes === undefined || minutes <= 0) return null;
  const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hrs}:${mins}`;
};

const formatTimeAMPM = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// parse "HH:MM" or Date fallback
const buildScheduledDate = (baseDate, scheduleStr) => {
  const d = new Date(baseDate);
  let hh = 8,
    mm = 0; // default 08:00
  if (scheduleStr && typeof scheduleStr === "string") {
    const parts = scheduleStr.split(":");
    if (parts.length >= 1) hh = parseInt(parts[0], 10) || 8;
    if (parts.length >= 2) mm = parseInt(parts[1], 10) || 0;
  }
  d.setHours(hh, mm, 0, 0);
  return d;
};

// compute tardiness in minutes (if any) given scheduledDate and actualCheckIn date
const computeTardiness = (scheduledDate, checkInDate) => {
  if (!checkInDate) return 0;
  const diffMs = new Date(checkInDate) - new Date(scheduledDate);
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  return diffMin;
};

exports.getMyDTR = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;

    if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Must be between 1 and 12",
      });
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Fetch attendance records for the month
    const attendanceRecords = await Attendance.find({
      employee: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: "leaveRequest",
        select: "leaveType leaveStatus dateFrom dateTo",
      })
      .sort({ date: 1 })
      .lean();

    // Fetch approved leave records overlapping the month
    // NOTE: use direct AND condition for overlapping interval
    const leaveRecords = await Leave.find({
      employee: userId,
      dateFrom: { $lte: endDate },
      dateTo: { $gte: startDate },
      leaveStatus: "approved", // only approved leaves to mark days
    })
      .select("leaveType dateFrom dateTo totalLeaveDays leaveStatus")
      .lean();

    // Fetch leave credits for the year
    const leaveCredits = await LeaveCredits.findOne({
      employee: userId,
      year: targetYear,
    }).lean();

    // helper to find a leave that covers a specific attendance date
    const findLeaveForDate = (d) => {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      return leaveRecords.find(
        (l) => new Date(l.dateFrom) <= dayEnd && new Date(l.dateTo) >= dayStart
      );
    };

    const formattedRecords = attendanceRecords.map((record) => {
      const dateOnly = new Date(record.date);
      const dayOfWeek = dateOnly.toLocaleDateString("en-US", {
        weekday: "short",
      });

      // scheduled in-time (from record if present, else default 08:00)
      const scheduleInStr = record.scheduleIn || record.schedule?.in || "08:00";
      const scheduledInDate = buildScheduledDate(record.date, scheduleInStr);

      const checkInDate = record.checkIn ? new Date(record.checkIn) : null;
      const checkOutDate = record.checkOut ? new Date(record.checkOut) : null;

      // tardiness minutes: if checkIn after scheduledIn -> minutes diff
      const tardinessMinutes = computeTardiness(scheduledInDate, checkInDate);
      const lateFormatted = formatMinutes(tardinessMinutes); // null if 0

      const totalHours = record.hoursRendered
        ? formatMinutes(record.hoursRendered)
        : null;

      // see if this date is covered by an approved leave
      const leaveForDay = findLeaveForDate(record.date);
      const isOnLeave = !!leaveForDay || record.status === "on_leave";
      const leaveType =
        leaveForDay?.leaveType || record.leaveRequest?.leaveType || null;

      return {
        date: dateOnly.toISOString().split("T")[0], // YYYY-MM-DD
        day: dayOfWeek,
        status: record.status || null,
        scheduleIn: scheduleInStr,
        scheduleOut: record.scheduleOut || record.schedule?.out || null,
        checkIn: checkInDate ? formatTimeAMPM(checkInDate) : null,
        checkOut: checkOutDate ? formatTimeAMPM(checkOutDate) : null,
        totalHours,
        tardinessMinutes,
        late: lateFormatted, // "HH:MM" or null -> frontend shows value and uses truthiness for '*'
        isLate: tardinessMinutes > 0,
        isAbsent: record.status === "absent",
        isOnLeave,
        leaveType,
        // set leave indicators per requested UI format
        vl: leaveType === "VL" && isOnLeave ? "1" : null,
        sl: leaveType === "SL" && isOnLeave ? "1" : null,
        fl: leaveType === "FL" && isOnLeave ? "1" : null,
        mlpl: leaveType === "MLPL" && isOnLeave ? "1" : null,
        lwop: leaveType === "LWOP" && isOnLeave ? "1" : null,
      };
    });

    // Calculate summary
    const summary = {
      totalDays: formattedRecords.length,
      presentDays: formattedRecords.filter(
        (r) => r.status === "present" || r.isLate
      ).length,
      absentDays: formattedRecords.filter((r) => r.isAbsent).length,
      lateDays: formattedRecords.filter((r) => r.isLate).length,
      leaveDays: formattedRecords.filter((r) => r.isOnLeave).length,
      totalMinutesWorked: formattedRecords.reduce((sum, r) => {
        if (!r.totalHours) return sum;
        const [h = "0", m = "0"] = r.totalHours.split(":");
        return sum + (Number(h) * 60 + Number(m));
      }, 0),
      totalTardinessMinutes: formattedRecords.reduce(
        (sum, r) => sum + (r.tardinessMinutes || 0),
        0
      ),
    };

    const tardyValues = formattedRecords
      .map((r) => r.tardinessMinutes || 0)
      .filter((m) => m > 0);
    const minTardinessMinutes = tardyValues.length
      ? Math.min(...tardyValues)
      : 0;

    // Map leaveCredits nested structure to simple fields expected by frontend
    const mappedLeaveCredits = leaveCredits
      ? {
          vacationLeave: leaveCredits.credits?.VL?.remaining ?? 0,
          sickLeave: leaveCredits.credits?.SL?.remaining ?? 0,
          birthdayLeave: leaveCredits.credits?.BL?.remaining ?? 0,
          lwop: leaveCredits.credits?.LWOP?.remaining ?? 0,
          forceLeave: leaveCredits.credits?.FL?.remaining ?? 0,
          mlpl: leaveCredits.credits?.MLPL?.remaining ?? 0,
          compensatory: leaveCredits.credits?.CL?.remaining ?? 0,
        }
      : null;

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        records: formattedRecords,
        summary,
        minTardinessMinutes,
        minTardinessFormatted: formatMinutes(minTardinessMinutes),
        leaveRecords: leaveRecords.map((leave) => ({
          leaveType: leave.leaveType,
          dateFrom: leave.dateFrom,
          dateTo: leave.dateTo,
          leaveStatus: leave.leaveStatus,
          totalLeaveDays: leave.totalLeaveDays,
        })),
        leaveCredits: mappedLeaveCredits,
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
exports.getMySickLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    // Build date filter
    let dateFilter = {};
    if (year && month) {
      const targetYear = parseInt(year, 10);
      const targetMonth = parseInt(month, 10);
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const targetYear = parseInt(year, 10);
      const startDate = new Date(targetYear, 0, 1);
      const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    }

    // Fetch sick leave records
    const sickLeaveRecords = await Leave.find({
      employee: userId,
      leaveType: "SL",
      leaveStatus: "approved",
      ...(Object.keys(dateFilter).length > 0 && {
        dateFrom: dateFilter,
      }),
    })
      .select(
        "leaveType dateFrom dateTo totalLeaveDays notes leaveStatus approvedAt"
      )
      .sort({ dateFrom: -1 })
      .lean();

    // Fetch corresponding attendance records
    const sickLeaveIds = sickLeaveRecords.map((leave) => leave._id);
    const attendanceRecords = await Attendance.find({
      employee: userId,
      leaveRequest: { $in: sickLeaveIds },
      status: "on_leave",
    })
      .select("date leaveRequest")
      .sort({ date: 1 })
      .lean();

    // Format the response
    const formattedSickLeaves = sickLeaveRecords.map((leave) => {
      // Get all attendance dates for this leave
      const leaveDates = attendanceRecords
        .filter((att) => att.leaveRequest.toString() === leave._id.toString())
        .map((att) => {
          const date = new Date(att.date);
          return {
            date: date.toISOString().split("T")[0],
            dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
            fullDate: date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          };
        });

      return {
        leaveId: leave._id,
        leaveType: leave.leaveType,
        dateFrom: leave.dateFrom,
        dateTo: leave.dateTo,
        totalDays: leave.totalLeaveDays,
        notes: leave.notes,
        status: leave.leaveStatus,
        approvedAt: leave.approvedAt,
        // Detailed dates covered by this leave
        dates: leaveDates,
        // Summary
        dateRange: `${new Date(leave.dateFrom).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} - ${new Date(leave.dateTo).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
      };
    });

    // Get sick leave credits
    const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const leaveCredits = await LeaveCredits.findOne({
      employee: userId,
      year: currentYear,
    }).lean();

    const sickLeaveCredits = leaveCredits?.credits?.SL || null;

    // Calculate summary
    const summary = {
      totalSickLeavesTaken: sickLeaveRecords.length,
      totalDaysUsed: sickLeaveRecords.reduce(
        (sum, leave) => sum + leave.totalLeaveDays,
        0
      ),
      remainingCredits: sickLeaveCredits?.remaining ?? 0,
      totalCredits: sickLeaveCredits?.total ?? 0,
      usedCredits: sickLeaveCredits?.used ?? 0,
    };

    res.status(200).json({
      success: true,
      data: {
        sickLeaves: formattedSickLeaves,
        summary,
        year: currentYear,
        month: month ? parseInt(month, 10) : null,
      },
    });
  } catch (error) {
    console.error("Error fetching sick leave:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sick leave records",
      error: error.message,
    });
  }
};

// Get sick leave days for a specific month (for DTR display)
exports.getSickLeaveDaysForMonth = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required",
      });
    }

    const targetYear = parseInt(year, 10);
    const targetMonth = parseInt(month, 10);
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Fetch sick leave records that overlap with the month
    const sickLeaveRecords = await Leave.find({
      employee: userId,
      leaveType: "SL",
      leaveStatus: "approved",
      dateFrom: { $lte: endDate },
      dateTo: { $gte: startDate },
    })
      .select("leaveType dateFrom dateTo totalLeaveDays notes")
      .lean();

    // Get all dates covered by sick leaves in this month
    const sickLeaveDates = [];
    sickLeaveRecords.forEach((leave) => {
      const leaveStart = new Date(
        Math.max(new Date(leave.dateFrom).getTime(), startDate.getTime())
      );
      const leaveEnd = new Date(
        Math.min(new Date(leave.dateTo).getTime(), endDate.getTime())
      );

      let currentDate = new Date(leaveStart);
      while (currentDate <= leaveEnd) {
        const dateStr = currentDate.toISOString().split("T")[0];
        sickLeaveDates.push({
          date: dateStr,
          dayOfWeek: currentDate.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          leaveId: leave._id,
          notes: leave.notes,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        sickLeaveDays: sickLeaveDates,
        totalSickLeaveDays: sickLeaveDates.length,
      },
    });
  } catch (error) {
    console.error("Error fetching sick leave days:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sick leave days",
      error: error.message,
    });
  }
};

// Get all leave types with dates (not just sick leave)
exports.getMyLeavesByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month, leaveType } = req.query;

    // Build date filter
    let dateFilter = {};
    if (year && month) {
      const targetYear = parseInt(year, 10);
      const targetMonth = parseInt(month, 10);
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const targetYear = parseInt(year, 10);
      const startDate = new Date(targetYear, 0, 1);
      const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    }

    // Build query
    const query = {
      employee: userId,
      leaveStatus: "approved",
      ...(Object.keys(dateFilter).length > 0 && {
        dateFrom: dateFilter,
      }),
    };

    // Add leave type filter if provided
    if (leaveType) {
      query.leaveType = leaveType;
    }

    // Fetch leave records
    const leaveRecords = await Leave.find(query)
      .select(
        "leaveType dateFrom dateTo totalLeaveDays notes leaveStatus approvedAt"
      )
      .sort({ dateFrom: -1 })
      .lean();

    // Group by leave type
    const leavesByType = leaveRecords.reduce((acc, leave) => {
      const type = leave.leaveType;
      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push({
        leaveId: leave._id,
        dateFrom: leave.dateFrom,
        dateTo: leave.dateTo,
        totalDays: leave.totalLeaveDays,
        notes: leave.notes,
        status: leave.leaveStatus,
        approvedAt: leave.approvedAt,
        dateRange: `${new Date(leave.dateFrom).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} - ${new Date(leave.dateTo).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
      });

      return acc;
    }, {});

    // Calculate totals by type
    const summary = Object.keys(leavesByType).map((type) => ({
      leaveType: type,
      totalLeaves: leavesByType[type].length,
      totalDays: leavesByType[type].reduce(
        (sum, leave) => sum + leave.totalDays,
        0
      ),
    }));

    res.status(200).json({
      success: true,
      data: {
        leavesByType,
        summary,
        year: year ? parseInt(year, 10) : null,
        month: month ? parseInt(month, 10) : null,
      },
    });
  } catch (error) {
    console.error("Error fetching leaves by type:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave records",
      error: error.message,
    });
  }
};

// GET overtime for current user
exports.getMyOvertime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const query = { employee: userId };
    if (status) query.status = status;

    const otRecords = await OverTime.find(query).sort({ dateFrom: -1 }).lean();

    const formatted = otRecords.map((ot) => ({
      id: ot._id,
      dateFrom: ot.dateFrom,
      dateTo: ot.dateTo,
      totalOvertimeDays: ot.totalOvertimeDays,
      hours: ot.hours,
      status: ot.status,
      overtimeType: ot.overtimeType,
      reason: ot.reason,
      approvedBy: ot.approvedBy || null,
      rejectedBy: ot.rejectedBy || null,
      approvedAt: ot.approvedAt || null,
      rejectedAt: ot.rejectedAt || null,
      rejectionReason: ot.rejectionReason || null,
      createdAt: ot.createdAt,
    }));

    const totalApprovedHours = otRecords
      .filter((o) => o.status === "approved")
      .reduce((sum, o) => sum + (o.hours || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        overtime: formatted,
        totalApprovedHours,
        count: formatted.length,
      },
    });
  } catch (error) {
    console.error("Error fetching overtime:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching overtime records",
      error: error.message,
    });
  }
};

exports.getMyAttendanceByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime()))
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const attendance = await Attendance.findOne({
      employee: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("leaveRequest", "leaveType notes")
      .lean();

    if (!attendance)
      return res.status(404).json({
        success: false,
        message: "No attendance record found for this date",
      });

    const scheduleInStr =
      attendance.scheduleIn || attendance.schedule?.in || "08:00";
    const scheduledInDate = buildScheduledDate(attendance.date, scheduleInStr);
    const checkInDate = attendance.checkIn
      ? new Date(attendance.checkIn)
      : null;
    const checkOutDate = attendance.checkOut
      ? new Date(attendance.checkOut)
      : null;
    const tardinessMinutes = computeTardiness(scheduledInDate, checkInDate);

    const formattedAttendance = {
      date: attendance.date,
      day: new Date(attendance.date).toLocaleDateString("en-US", {
        weekday: "long",
      }),
      status: attendance.status,
      scheduleIn: scheduleInStr,
      scheduleOut: attendance.scheduleOut || attendance.schedule?.out || null,
      checkIn: checkInDate ? new Date(checkInDate).toISOString() : null,
      checkOut: checkOutDate ? new Date(checkOutDate).toISOString() : null,
      totalHours: attendance.hoursRendered
        ? formatMinutes(attendance.hoursRendered)
        : null,
      hoursRenderedMinutes: attendance.hoursRendered || 0,
      tardinessMinutes,
      late: formatMinutes(tardinessMinutes),
      isLate: tardinessMinutes > 0,
      isAbsent: attendance.status === "absent",
      isOnLeave: attendance.status === "on_leave",
      leaveDetails: attendance.leaveRequest || null,
    };

    res.status(200).json({ success: true, data: formattedAttendance });
  } catch (error) {
    console.error("Error fetching attendance by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance record",
      error: error.message,
    });
  }
};

exports.getMyDTRRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required",
      });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    if (start > end)
      return res.status(400).json({
        success: false,
        message: "Start date must be before or equal to end date",
      });

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      employee: userId,
      date: { $gte: start, $lte: end },
    })
      .populate("leaveRequest", "leaveType")
      .sort({ date: 1 })
      .lean();

    const formattedRecords = attendanceRecords.map((record) => {
      const dateOnly = new Date(record.date);
      const dayOfWeek = dateOnly.toLocaleDateString("en-US", {
        weekday: "short",
      });

      const scheduleInStr = record.scheduleIn || record.schedule?.in || "08:00";
      const scheduledInDate = buildScheduledDate(record.date, scheduleInStr);
      const checkInDate = record.checkIn ? new Date(record.checkIn) : null;
      const checkOutDate = record.checkOut ? new Date(record.checkOut) : null;
      const tardinessMinutes = computeTardiness(scheduledInDate, checkInDate);

      return {
        date: dateOnly.toISOString().split("T")[0],
        day: dayOfWeek,
        status: record.status,
        scheduleIn: scheduleInStr,
        scheduleOut: record.scheduleOut || record.schedule?.out || null,
        checkIn: checkInDate ? formatTimeAMPM(checkInDate) : null,
        checkOut: checkOutDate ? formatTimeAMPM(checkOutDate) : null,
        totalHours: record.hoursRendered
          ? formatMinutes(record.hoursRendered)
          : null,
        tardinessMinutes,
        late: formatMinutes(tardinessMinutes),
        isLate: tardinessMinutes > 0,
        isAbsent: record.status === "absent",
        isOnLeave: record.status === "on_leave",
        leaveType: record.leaveRequest?.leaveType || null,
      };
    });

    const summary = {
      dateRange: { from: startDate, to: endDate },
      totalDays: formattedRecords.length,
      presentDays: formattedRecords.filter(
        (r) => r.status === "present" || r.isLate
      ).length,
      absentDays: formattedRecords.filter((r) => r.isAbsent).length,
      lateDays: formattedRecords.filter((r) => r.isLate).length,
      totalTardinessMinutes: formattedRecords.reduce(
        (sum, r) => sum + (r.tardinessMinutes || 0),
        0
      ),
    };

    const tardyValues = formattedRecords
      .map((r) => r.tardinessMinutes || 0)
      .filter((m) => m > 0);
    const minTardinessMinutes = tardyValues.length
      ? Math.min(...tardyValues)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        records: formattedRecords,
        summary,
        minTardinessMinutes,
        minTardinessFormatted: formatMinutes(minTardinessMinutes),
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

exports.getMyRawTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;

    if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Must be between 1 and 12",
      });
    }

    // Build date range of the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Query attendance logs
    const records = await Attendance.find({
      employee: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean();

    // Format helper
    const formatAMPM = (dateObj) => {
      if (!dateObj) return null;
      const date = new Date(dateObj);
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const amPm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      minutes = minutes.toString().padStart(2, "0");
      return `${hours}:${minutes} ${amPm}`;
    };

    const formatted = records.map((r) => ({
      date: r.date.toISOString().split("T")[0], // YYYY-MM-DD
      rawIn: formatAMPM(r.checkIn),
      rawOut: formatAMPM(r.checkOut),
    }));

    return res.status(200).json({
      success: true,
      year: targetYear,
      month: targetMonth,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching raw logs:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching raw time logs",
      error: error.message,
    });
  }
};
