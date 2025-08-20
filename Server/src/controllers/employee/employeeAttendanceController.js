const Attendance = require("../models/Attendance");
const LeaveCredits = require("../models/attendanceSchema/leaveCreditsSchema");

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

// Employee: Create own attendance
const createMyAttendance = async (req, res) => {
  try {
    const { date, status, checkIn, checkOut, leaveType, notes } = req.body;
    if (!date || !status) {
      return res.status(400).json({ message: "Date and status are required." });
    }
    // Prevent duplicate for the same day
    const exists = await Attendance.findOne({
      employee: req.user._id,
      date: new Date(date),
    });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Attendance already filed for this date." });
    }
    // If leave, check credits
    if (status === "on_leave") {
      const credits = await LeaveCredits.findOne({ employee: req.user._id });
      if (
        !credits ||
        !credits.credits[leaveType] ||
        credits.credits[leaveType].remaining <= 0
      ) {
        return res
          .status(400)
          .json({ message: "No leave credits available for this type." });
      }
      credits.useCredit(leaveType);
      await credits.save();
    }
    // Create attendance
    const attendance = new Attendance({
      employee: req.user._id,
      date,
      status,
      checkIn,
      checkOut,
      leaveType,
      notes,
    });
    await attendance.save();
    res
      .status(201)
      .json({ message: "Attendance created successfully", attendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Employee: Edit/cancel own leave (optional)
const editMyLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, leaveType, notes } = req.body;
    const attendance = await Attendance.findOne({
      _id: id,
      employee: req.user._id,
      status: "on_leave",
    });
    if (!attendance) {
      return res.status(404).json({ message: "Leave record not found." });
    }
    if (leaveType) attendance.leaveType = leaveType;
    if (notes) attendance.notes = notes;
    if (status) attendance.status = status;
    await attendance.save();
    res.json({ message: "Leave updated successfully", attendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  getMyAttendance,
  getMyLeaveCredits,
  createMyAttendance,
  editMyLeave,
};
