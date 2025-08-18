const Attendance = require("../models/Attendance");
const User = require("../models/User"); // Assuming you have a User model

// Helper function to calculate minutes between two times
const calculateMinutesBetween = (startTime, endTime) => {
  return Math.floor((endTime - startTime) / (1000 * 60));
};

// Helper function to calculate tardiness
const calculateTardiness = (checkInTime, standardStartTime = "08:00") => {
  const checkIn = new Date(checkInTime);
  const today = new Date(checkIn);
  const [hours, minutes] = standardStartTime.split(":").map(Number);

  const standardStart = new Date(today);
  standardStart.setHours(hours, minutes, 0, 0);

  if (checkIn > standardStart) {
    return calculateMinutesBetween(standardStart, checkIn);
  }
  return 0;
};

// Helper function to determine status based on check-in time
const determineStatus = (checkInTime, standardStartTime = "08:00") => {
  const tardiness = calculateTardiness(checkInTime, standardStartTime);
  return tardiness > 0 ? "late" : "present";
};

// Get all attendance records with populated employee data
exports.getAllAttendance = async (req, res) => {
  try {
    const { employee, status, date, page = 1, limit = 50 } = req.query;

    const query = {};

    // Filter by employee name or ID
    if (employee) {
      const users = await User.find({
        $or: [
          { firstname: { $regex: employee, $options: "i" } },
          { lastname: { $regex: employee, $options: "i" } },
          { employeeId: { $regex: employee, $options: "i" } },
        ],
      });

      if (users.length > 0) {
        query.employee = { $in: users.map((user) => user._id) };
      } else {
        return res.json([]); // No matching employees
      }
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const attendance = await Attendance.find(query)
      .populate("employee", "firstname lastname employeeId role department")
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};

// Employee check-in
exports.checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const checkInTime = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if employee already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({
        message: "Employee already checked in today",
        checkInTime: existingAttendance.checkIn,
      });
    }

    // Calculate tardiness and status
    const tardinessMinutes = calculateTardiness(checkInTime);
    const status = determineStatus(checkInTime);

    let attendance;

    if (existingAttendance) {
      // Update existing record
      existingAttendance.checkIn = checkInTime;
      existingAttendance.status = status;
      existingAttendance.tardinessMinutes = tardinessMinutes;
      attendance = await existingAttendance.save();
    } else {
      // Create new attendance record
      attendance = new Attendance({
        employee: employeeId,
        date: today,
        checkIn: checkInTime,
        status: status,
        tardinessMinutes: tardinessMinutes,
      });
      await attendance.save();
    }

    // Populate employee data for response
    await attendance.populate(
      "employee",
      "firstname lastname employeeId role department"
    );

    res.json({
      message: `Check-in successful${
        status === "late" ? " (Marked as late)" : ""
      }`,
      attendance,
      checkInTime: checkInTime.toLocaleTimeString(),
      tardinessMinutes,
    });
  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({ message: "Check-in failed" });
  }
};

// Employee check-out
exports.checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const checkOutTime = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return res.status(400).json({
        message: "No check-in record found for today. Please check in first.",
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        message: "Cannot check out without checking in first.",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Employee already checked out today",
        checkOutTime: attendance.checkOut,
      });
    }

    // Calculate hours rendered
    const hoursRendered = calculateMinutesBetween(
      attendance.checkIn,
      checkOutTime
    );

    // Update attendance record
    attendance.checkOut = checkOutTime;
    attendance.hoursRendered = hoursRendered;
    await attendance.save();

    // Populate employee data for response
    await attendance.populate(
      "employee",
      "firstname lastname employeeId role department"
    );

    const hoursDisplay = `${Math.floor(hoursRendered / 60)}h ${
      hoursRendered % 60
    }m`;

    res.json({
      message: "Check-out successful",
      attendance,
      checkOutTime: checkOutTime.toLocaleTimeString(),
      hoursRendered: hoursDisplay,
      totalMinutes: hoursRendered,
    });
  } catch (error) {
    console.error("Error during check-out:", error);
    res.status(500).json({ message: "Check-out failed" });
  }
};

// Get employee's attendance history
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    const query = { employee: employeeId };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.date.$lt = end;
      }
    }

    const attendance = await Attendance.find(query)
      .populate("employee", "firstname lastname employeeId role department")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Calculate summary statistics
    const summary = {
      totalDays: attendance.length,
      presentDays: attendance.filter((a) => a.status === "present").length,
      lateDays: attendance.filter((a) => a.status === "late").length,
      absentDays: attendance.filter((a) => a.status === "absent").length,
      leaveDays: attendance.filter((a) => a.status === "on_leave").length,
      totalHoursRendered: attendance.reduce(
        (sum, a) => sum + (a.hoursRendered || 0),
        0
      ),
      totalTardinessMinutes: attendance.reduce(
        (sum, a) => sum + (a.tardinessMinutes || 0),
        0
      ),
    };

    res.json({
      attendance,
      summary,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(attendance.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching employee attendance:", error);
    res.status(500).json({ message: "Failed to fetch employee attendance" });
  }
};

// Get today's attendance status for an employee
exports.getTodayAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
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
        message: "No attendance record for today",
      });
    }

    const hasCheckedIn = !!attendance.checkIn;
    const hasCheckedOut = !!attendance.checkOut;

    res.json({
      attendance,
      hasCheckedIn,
      hasCheckedOut,
      canCheckIn: !hasCheckedIn,
      canCheckOut: hasCheckedIn && !hasCheckedOut,
      hoursRendered: attendance.hoursRendered || 0,
      tardinessMinutes: attendance.tardinessMinutes || 0,
    });
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ message: "Failed to fetch today's attendance" });
  }
};

// Get attendance statistics for dashboard
exports.getAttendanceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's statistics
    const todayStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalTardiness: { $sum: "$tardinessMinutes" },
          totalHours: { $sum: "$hoursRendered" },
        },
      },
    ]);

    // Monthly statistics
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthlyStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lt: monthEnd },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalTardiness: { $sum: "$tardinessMinutes" },
          totalHours: { $sum: "$hoursRendered" },
        },
      },
    ]);

    // Ensure minimum 5 for each leave type (as requested)
    const leaveStats = {
      VL: 5,
      SL: 5,
      LWOP: 5,
      BL: 5,
      OS: 5,
      CL: 5,
    };

    // Add actual leave counts from database
    const leaveData = await Attendance.aggregate([
      {
        $match: {
          status: "on_leave",
          leaveType: { $exists: true, $ne: null },
          date: { $gte: monthStart, $lt: monthEnd },
        },
      },
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Add actual counts to minimum 5
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
    console.error("Error fetching attendance statistics:", error);
    res.status(500).json({ message: "Failed to fetch attendance statistics" });
  }
};
