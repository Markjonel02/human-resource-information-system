const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { isValidObjectId } = require("mongoose");

// Constants for business rules
const STANDARD_START_TIME = "08:00";
const MINUTES_PER_HOUR = 60;

// Helper function to calculate minutes between two times
const calculateMinutesBetween = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  return Math.floor((endTime - startTime) / (1000 * 60));
};

// Helper function to calculate tardiness
const calculateTardiness = (
  checkInTime,
  standardStartTime = STANDARD_START_TIME
) => {
  if (!checkInTime) return 0;

  const checkIn = new Date(checkInTime);
  const today = new Date(checkIn);
  const [hours, minutes] = standardStartTime.split(":").map(Number);

  const standardStart = new Date(today);
  standardStart.setHours(hours, minutes, 0, 0);

  return checkIn > standardStart
    ? calculateMinutesBetween(standardStart, checkIn)
    : 0;
};

// Helper function to determine status
const determineStatus = (checkInTime) => {
  return calculateTardiness(checkInTime) > 0 ? "late" : "present";
};

// Get all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const { employee, status, date, page = 1, limit = 50 } = req.query;
    const query = {};

    // Employee filter
    if (employee) {
      const users = await User.find({
        $or: [
          { firstname: { $regex: employee, $options: "i" } },
          { lastname: { $regex: employee, $options: "i" } },
          { employeeId: { $regex: employee, $options: "i" } },
        ],
      }).select("_id");

      query.employee = { $in: users.map((user) => user._id) };
    }

    // Status filter
    if (status) query.status = status;

    // Date filter
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate("employee", "firstname lastname employeeId role department")
        .sort({ date: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    res.json({
      data: attendance,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
};

// Employee check-in
exports.checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Validate employeeId
    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInTime = new Date();

    // Check existing attendance
    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (attendance?.checkIn) {
      return res.status(400).json({
        message: "Already checked in today",
        checkInTime: attendance.checkIn,
      });
    }

    // Calculate metrics
    const tardinessMinutes = calculateTardiness(checkInTime);
    const status = determineStatus(checkInTime);

    if (attendance) {
      // Update existing record
      attendance.checkIn = checkInTime;
      attendance.status = status;
      attendance.tardinessMinutes = tardinessMinutes;
    } else {
      // Create new record
      attendance = new Attendance({
        employee: employeeId,
        date: today,
        checkIn: checkInTime,
        status,
        tardinessMinutes,
      });
    }

    await attendance.save();
    await attendance.populate(
      "employee",
      "firstname lastname employeeId role department"
    );

    res.json({
      message:
        status === "late" ? "Late check-in recorded" : "Check-in successful",
      attendance,
      checkInTime: checkInTime.toISOString(),
      tardinessMinutes,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      message: "Check-in failed",
      error: error.message,
    });
  }
};

// Employee check-out
exports.checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOutTime = new Date();

    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return res.status(400).json({
        message: "No check-in record found for today",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Already checked out today",
        checkOutTime: attendance.checkOut,
      });
    }

    // Calculate hours worked
    const minutesWorked = calculateMinutesBetween(
      attendance.checkIn,
      checkOutTime
    );
    const hoursDisplay = `${Math.floor(minutesWorked / MINUTES_PER_HOUR)}h ${
      minutesWorked % MINUTES_PER_HOUR
    }m`;

    // Update record
    attendance.checkOut = checkOutTime;
    attendance.hoursRendered = minutesWorked;
    await attendance.save();
    await attendance.populate(
      "employee",
      "firstname lastname employeeId role department"
    );

    res.json({
      message: "Check-out successful",
      attendance,
      checkOutTime: checkOutTime.toISOString(),
      hoursRendered: hoursDisplay,
      totalMinutes: minutesWorked,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({
      message: "Check-out failed",
      error: error.message,
    });
  }
};

// Get employee attendance history
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const query = { employee: employeeId };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)
        query.date.$lt = new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        );
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate("employee", "firstname lastname employeeId role department")
        .sort({ date: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    // Calculate summary
    const summary = attendance.reduce(
      (acc, record) => {
        acc.totalDays++;
        acc[`${record.status}Days`]++;
        acc.totalHoursRendered += record.hoursRendered || 0;
        acc.totalTardinessMinutes += record.tardinessMinutes || 0;
        return acc;
      },
      {
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        leaveDays: 0,
        totalHoursRendered: 0,
        totalTardinessMinutes: 0,
      }
    );

    res.json({
      data: attendance,
      summary,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Employee attendance error:", error);
    res.status(500).json({
      message: "Failed to fetch employee attendance",
      error: error.message,
    });
  }
};

// Get today's attendance status
exports.getTodayAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate("employee", "firstname lastname employeeId role department");

    if (!attendance) {
      return res.json({
        hasCheckedIn: false,
        hasCheckedOut: false,
        canCheckIn: true,
        canCheckOut: false,
      });
    }

    res.json({
      attendance,
      hasCheckedIn: !!attendance.checkIn,
      hasCheckedOut: !!attendance.checkOut,
      canCheckIn: !attendance.checkIn,
      canCheckOut: !!attendance.checkIn && !attendance.checkOut,
      hoursRendered: attendance.hoursRendered || 0,
      tardinessMinutes: attendance.tardinessMinutes || 0,
    });
  } catch (error) {
    console.error("Today's attendance error:", error);
    res.status(500).json({
      message: "Failed to fetch today's attendance",
      error: error.message,
    });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [todayStats, monthlyStats, leaveData] = await Promise.all([
      // Today's stats
      Attendance.aggregate([
        { $match: { date: { $gte: today } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalTardiness: { $sum: "$tardinessMinutes" },
            totalHours: { $sum: "$hoursRendered" },
          },
        },
      ]),
      // Monthly stats
      Attendance.aggregate([
        { $match: { date: { $gte: monthStart, $lt: monthEnd } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalTardiness: { $sum: "$tardinessMinutes" },
            totalHours: { $sum: "$hoursRendered" },
          },
        },
      ]),
      // Leave data
      Attendance.aggregate([
        {
          $match: {
            status: "on_leave",
            leaveType: { $exists: true },
            date: { $gte: monthStart, $lt: monthEnd },
          },
        },
        { $group: { _id: "$leaveType", count: { $sum: 1 } } },
      ]),
    ]);

    // Process leave stats with minimum 5
    const leaveStats = {
      VL: 5,
      SL: 5,
      LWOP: 5,
      BL: 5,
      OS: 5,
      CL: 5,
    };

    leaveData.forEach((leave) => {
      if (leaveStats[leave._id] !== undefined) {
        leaveStats[leave._id] += leave.count;
      }
    });

    res.json({
      today: todayStats,
      monthly: monthlyStats,
      leaveBreakdown: leaveStats,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      message: "Failed to fetch attendance statistics",
      error: error.message,
    });
  }
};
