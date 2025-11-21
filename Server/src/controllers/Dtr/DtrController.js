// controllers/attendanceController.js
const Attendance = require("../../models/attendance");
const Leave = require("../../models/LeaveSchema/leaveSchema");
const OverTime = require("../../models/overtimeSchema");
const LeaveCredits = require("../../models/LeaveSchema/leaveCreditsSchema");

// helper to format minutes -> "HH:MM"
const formatMinutes = (minutes = 0) => {
  if (!minutes || minutes <= 0) return null;
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
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid month. Must be between 1 and 12",
        });
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      employee: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("leaveRequest", "leaveType")
      .sort({ date: 1 })
      .lean();

    const formattedRecords = attendanceRecords.map((record) => {
      const dateOnly = new Date(record.date);
      const dayOfWeek = dateOnly.toLocaleDateString("en-US", {
        weekday: "short",
      });

      // determine scheduled in-time (from record if present, else default 08:00)
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
        isOnLeave: record.status === "on_leave",
        leaveType: record.leaveRequest?.leaveType || null,
      };
    });

    const summary = {
      totalDays: formattedRecords.length,
      presentDays: formattedRecords.filter(
        (r) => r.status === "present" || r.isLate
      ).length,
      absentDays: formattedRecords.filter((r) => r.isAbsent).length,
      lateDays: formattedRecords.filter((r) => r.isLate).length,
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

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        records: formattedRecords,
        summary,
        minTardinessMinutes,
        minTardinessFormatted: formatMinutes(minTardinessMinutes),
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
      return res
        .status(400)
        .json({
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
      return res
        .status(404)
        .json({
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
      return res
        .status(400)
        .json({
          success: false,
          message: "Both startDate and endDate are required",
        });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
    if (start > end)
      return res
        .status(400)
        .json({
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
