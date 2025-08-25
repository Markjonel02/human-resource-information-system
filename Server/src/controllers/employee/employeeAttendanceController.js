const Attendance = require("../../models/Attendance");
const LeaveCredits = require("../../models/attendanceSchema/leaveCreditsSchema");
const calculateHoursInMinutes = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diffMs = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.floor(diffMs / (1000 * 60))); // minutes
};

// Helper function to calculate tardiness
const calculateTardiness = (checkIn, scheduledCheckIn = "08:00") => {
  if (!checkIn) return 0;

  const checkInTime = new Date(checkIn);
  const scheduled = new Date(checkInTime);
  const [hours, minutes] = scheduledCheckIn.split(":");
  scheduled.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  if (checkInTime > scheduled) {
    return Math.floor((checkInTime - scheduled) / (1000 * 60)); // Minutes late
  }
  return 0;
};

// Helper function to parse time string to Date
const parseTimeToDate = (timeStr, baseDate) => {
  if (!timeStr || timeStr === "-") return null;

  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};
// Employee: Get own attendance records
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.user._id })
      .populate("employee", "firstname lastname employeeId department role")
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Employee: Get own leave credits
const getMyLeaveCredits = async (req, res) => {
  try {
    let credits = await LeaveCredits.findOne({ employee: req.user._id });
    const currentYear = new Date().getFullYear();
    if (!credits) {
      credits = await LeaveCredits.create({
        employee: req.user._id,
        year: currentYear,
      });
    } else if (credits.year !== currentYear) {
      credits.resetCredits();
      credits.year = currentYear;
      await credits.save();
    }
    res.json(credits);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const createMyAttendance = async (req, res) => {
  // Only allow employees to add their own attendance
  if (req.user.role !== "employee") {
    return res.status(403).json({
      message:
        "Access denied. Only employees can add their own attendance records.",
    });
  }

  try {
    const {
      date,
      status,
      checkIn,
      checkOut,
      leaveType,
      notes,
      dateFrom,
      dateTo,
    } = req.body;

    if (!date || !status) {
      return res.status(400).json({
        message: "Date and status are required",
      });
    }

    // Prevent duplicate for the same day
    const exists = await Attendance.findOne({
      employee: req.user._id,
      date: new Date(date),
    });
    if (exists) {
      return res.status(400).json({
        message: "Attendance already filed for this date.",
      });
    }

    // If leave, check credits
    if (status === "on_leave") {
      const credits = await LeaveCredits.findOne({ employee: req.user._id });
      if (
        !credits ||
        !credits.credits[leaveType] ||
        credits.credits[leaveType].remaining <= 0
      ) {
        return res.status(400).json({
          message: "No leave credits available for this type.",
        });
      }
      // If you have a useCredit method, call it here
      if (typeof credits.useCredit === "function") {
        credits.useCredit(leaveType);
        await credits.save();
      } else {
        // Fallback: decrement remaining manually
        credits.credits[leaveType].used += 1;
        credits.credits[leaveType].remaining -= 1;
        await credits.save();
      }
    }

    // Convert date and time fields to Date objects
    const attendanceData = {
      employee: req.user._id,
      date: new Date(date),
      status,
      notes: notes || "",
    };
    // Add leave date range if on_leave
    if (status === "on_leave") {
      if (dateFrom) attendanceData.dateFrom = new Date(dateFrom);
      if (dateTo) attendanceData.dateTo = new Date(dateTo);
    }

    if (status === "present" || status === "late") {
      if (checkIn) {
        // Accepts "HH:mm" format
        const [h, m] = checkIn.split(":");
        const checkInDate = new Date(date);
        checkInDate.setHours(Number(h), Number(m), 0, 0);
        attendanceData.checkIn = checkInDate;

        // Calculate tardiness
        const scheduledTime = new Date(checkInDate);
        scheduledTime.setHours(8, 0, 0, 0);
        if (checkInDate > scheduledTime) {
          attendanceData.status = "late";
          attendanceData.tardinessMinutes = calculateTardiness(checkInDate);
        } else {
          attendanceData.tardinessMinutes = 0;
        }
      }
      if (checkOut) {
        const [h, m] = checkOut.split(":");
        const checkOutDate = new Date(date);
        checkOutDate.setHours(Number(h), Number(m), 0, 0);
        attendanceData.checkOut = checkOutDate;
      }
      if (attendanceData.checkIn && attendanceData.checkOut) {
        attendanceData.hoursRendered = calculateHoursInMinutes(
          attendanceData.checkIn,
          attendanceData.checkOut
        );
      }
    } else if (status === "on_leave") {
      const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "OS", "CL"];
      if (!leaveType || !validLeaveTypes.includes(leaveType)) {
        return res.status(400).json({
          message: "Valid leave type is required for leave status",
        });
      }
      attendanceData.leaveType = leaveType;
    }

    const attendance = new Attendance(attendanceData);
    await attendance.save();
    res.status(201).json({
      message: "Attendance created successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Employee: Edit/cancel own leave (optional)
// Add new leave request for employee
const addLeave = async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      message: "Access denied. Only employees can file leave requests.",
    });
  }

  try {
    const { leaveType, dateFrom, dateTo, notes } = req.body;

    if (!leaveType || !dateFrom || !dateTo) {
      return res.status(400).json({
        message: "Leave type, start date, and end date are required.",
      });
    }

    // Validate leave type
    const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "OS", "CL"];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        message: "Invalid leave type.",
      });
    }

    // Prevent overlapping leave for the same dates
    const overlap = await Attendance.findOne({
      employee: req.user._id,
      status: "on_leave",
      $or: [
        {
          dateFrom: { $lte: new Date(dateTo) },
          dateTo: { $gte: new Date(dateFrom) },
        },
      ],
    });
    if (overlap) {
      return res.status(400).json({
        message: "You already have a leave filed for these dates.",
      });
    }

    const totalLeaveDays =
      Math.ceil(
        (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)
      ) + 1;

    const attendance = new Attendance({
      employee: req.user._id,
      status: "on_leave",
      leaveType,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      totalLeaveDays,
      notes: notes || "",
      leaveStatus: "pending",
      date: new Date(dateFrom), // For compatibility
    });

    await attendance.save();
    res.status(201).json({
      message: "Leave request filed successfully.",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Edit existing leave request for employee
const editLeave = async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      message: "Access denied. Only employees can edit their leave requests.",
    });
  }

  try {
    const { id } = req.params;
    const { leaveType, dateFrom, dateTo, notes } = req.body;

    const attendance = await Attendance.findOne({
      _id: id,
      employee: req.user._id,
      status: "on_leave",
      leaveStatus: "pending", // Only allow editing if still pending
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Leave record not found or cannot be edited.",
      });
    }

    // Validate leave type
    const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "OS", "CL"];
    if (leaveType && !validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        message: "Invalid leave type.",
      });
    }

    if (leaveType) attendance.leaveType = leaveType;
    if (dateFrom) attendance.dateFrom = new Date(dateFrom);
    if (dateTo) attendance.dateTo = new Date(dateTo);
    if (notes !== undefined) attendance.notes = notes;

    // Update totalLeaveDays if dates changed
    if (attendance.dateFrom && attendance.dateTo) {
      attendance.totalLeaveDays =
        Math.ceil(
          (new Date(attendance.dateTo) - new Date(attendance.dateFrom)) /
            (1000 * 60 * 60 * 24)
        ) + 1;
    }

    await attendance.save();
    res.json({
      message: "Leave request updated successfully.",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getMyAttendance,
  getMyLeaveCredits,
  createMyAttendance,
  addLeave,
  editLeave,
};
