// Employee: Edit/cancel own leave (optional)
// Add new leave request for employee

const LeaveCredits = require("../../models/LeaveSchema/leaveCreditsSchema");
const Leave = require("../../models/LeaveSchema/leaveSchema");
const addLeave = async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      message: "Access denied. Only employees can file leave requests.",
    });
  }

  try {
    const { leaveType, dateFrom, dateTo, notes } = req.body;
    const employeeId = req.user._id;

    if (!leaveType || !dateFrom || !dateTo || !notes) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "CL"];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type." });
    }

    // ... (LeaveCredits and Overlap checks)

    if (leaveType !== "LWOP") {
      const credits = await LeaveCredits.findOne({ employee: employeeId });

      if (
        !credits ||
        !credits.credits[leaveType] ||
        credits.credits[leaveType].remaining <= 0
      ) {
        return res.status(400).json({ message: "No leave credits available." });
      }
    }

    const overlap = await Leave.findOne({
      // Use the Leave model for overlap check
      employee: employeeId,
      leaveStatus: { $in: ["pending", "approved"] },
      $or: [
        {
          dateFrom: { $lte: new Date(dateTo) },
          dateTo: { $gte: new Date(dateFrom) },
        },
      ],
    });

    if (overlap) {
      return res.status(400).json({
        message:
          "You already have a pending or approved leave for these dates.",
      });
    }

    // Calculate total leave days
    const totalLeaveDays =
      Math.ceil(
        (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Create a new LEAVE document, NOT an Attendance document
    const newLeaveRequest = new Leave({
      employee: employeeId,
      leaveType,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      totalLeaveDays,
      notes,
      leaveStatus: "pending", // Redundant, but good practice
    });

    // Save the new LEAVE document
    await newLeaveRequest.save();

    res.status(201).json({
      message: "Leave request filed successfully.",
      leaveRequest: newLeaveRequest,
    });
  } catch (error) {
    console.error("Error in addLeave:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getEmployeeLeave = async (req, res) => {
  try {
    const empLeaves = await Leave.find({ employee: req.user._id });
    if (!empLeaves || empLeaves.length === 0) {
      return res.status(404).json({ message: "No leave records found." });
    }
    res.json(empLeaves);
  } catch (error) {
    console.error("Error in getEmployeeLeave:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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

module.exports = { addLeave, editLeave, getMyLeaveCredits, getEmployeeLeave };
