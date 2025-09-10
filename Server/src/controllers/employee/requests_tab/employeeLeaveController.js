// Employee: Edit/cancel own leave (optional)
// Add new leave request for employee

const LeaveCredits = require("../../../models/LeaveSchema/leaveCreditsSchema");
const Leave = require("../../../models/LeaveSchema/leaveSchema");
const Attendances = require("../../../models/Attendance");
const LeaveLogs = require("../../../models/Logs/leaveSchemaLogs");
// Create date range for attendance check
function normalizeDateRange(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  start.setHours(0, 0, 0, 0);

  const end = new Date(dateTo);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

const addLeave = async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      message: "Access denied. Only employees can file leave requests.",
    });
  }

  try {
    const { leaveType, dateFrom, dateTo, notes } = req.body;
    const employeeId = req.user._id;

    // Step 1: Validate required fields
    if (!leaveType || !dateFrom || !dateTo || !notes) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Step 2: Validate leave type
    const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "CL"];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type." });
    }

    // Step 3: Calculate total leave days
    const totalLeaveDays =
      Math.ceil(
        (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Step 4: Validate leave credits (for all types with credits)
    const creditRequiredTypes = ["VL", "SL", "BL", "CL"];
    const credits = await LeaveCredits.findOne({ employee: employeeId });

    if (!credits) {
      return res.status(400).json({ message: "Leave credits not found." });
    }

    // Check if any leave type has insufficient credits for the requested duration
    // Map leave types to their remaining credits
    const remainingCredits = creditRequiredTypes.reduce((acc, type) => {
      acc[type] = credits.credits[type]?.remaining || 0;
      return acc;
    }, {});

    // Check if the requested leave type has enough credits
    if (creditRequiredTypes.includes(leaveType)) {
      const remaining = remainingCredits[leaveType];
      if (totalLeaveDays > remaining) {
        return res.status(400).json({
          message: `Requested ${totalLeaveDays} day(s) exceeds available ${leaveType} credits (${remaining} remaining).`,
        });
      }
    }

    // Step 5: Check for overlapping leave
    const overlap = await Leave.findOne({
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

    const { start, end } = normalizeDateRange(dateFrom, dateTo);
    //checking if there are attendance records before filing leave request
    const attendanceRecords = await Attendances.find({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });

    // Step 5: Check for attendance records during the leave period
    if (attendanceRecords.length > 0) {
      return res.status(400).json({
        message:
          "You have attendance records during the requested leave period.",
        conflicts: attendanceRecords.map((r) => r.date),
      });
    }

    // Step 6: Create and save leave request
    const newLeaveRequest = new Leave({
      employee: employeeId,
      leaveType,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      totalLeaveDays,
      notes,
      leaveStatus: "pending",
    });

    await newLeaveRequest.save();

    // Log the leave request creation
    await LeaveLogs.create({
      leaveId: newLeaveRequest._id,
      employeeId: req.user._id,
      action: "LEAVE_REQUESTED",
      description: `Leave requested (${req.user.firstname} ${req.user.lastname})`,
      performedBy: req.user._id,
      changes: {
        leaveType,
        dateFrom,
        dateTo,
        totalLeaveDays,
      },
      metadata: { role: req.user.role },
      ipAddress: req.ip || "N/A",
      userAgent: req.headers["user-agent"] || "N/A",
    });

    res.status(201).json({
      message: "Leave request filed successfully.",
      leaveRequest: newLeaveRequest,
    });
  } catch (error) {
    console.error("Error in addLeave:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getEmployeeLeave = async (req, res) => {
  try {
    const currentUser = req.user;

    // Step 1: Validate authentication
    if (!currentUser || !currentUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    // Step 2: Validate role access
    const allowedRoles = ["employee", "admin", "hr"];
    if (!allowedRoles.includes(currentUser.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied for this role" });
    }

    // Step 3: Build query based on role
    const query =
      currentUser.role === "employee" ? { employee: currentUser._id } : {}; // Admins can view all leave records

    // Step 4: Fetch leave records
    const leaveRecords = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate("employee", "firstname lastname employeeId department");

    // Step 5: Handle empty results
    if (!Array.isArray(leaveRecords) || leaveRecords.length === 0) {
      return res.status(404).json({ message: "No leave records found." });
    }

    // Step 6: Return results
    res.status(200).json(leaveRecords);
  } catch (error) {
    console.error("Error in getEmployeeLeave:", error);
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

    const leaveRequest = await Leave.findOne({
      _id: id,
      employee: req.user._id,
      leaveStatus: "pending",
    });

    if (!leaveRequest) {
      return res.status(404).json({
        message:
          "Leave record not found or cannot be edited. It may have already been processed.",
      });
    }

    const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "CL"];
    if (leaveType && !validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type." });
    }

    const oldValues = {
      leaveType: leaveRequest.leaveType,
      dateFrom: leaveRequest.dateFrom,
      dateTo: leaveRequest.dateTo,
      notes: leaveRequest.notes,
      totalLeaveDays: leaveRequest.totalLeaveDays,
    };

    // Apply updates
    if (leaveType) leaveRequest.leaveType = leaveType;
    if (dateFrom) leaveRequest.dateFrom = new Date(dateFrom);
    if (dateTo) leaveRequest.dateTo = new Date(dateTo);
    if (notes !== undefined) leaveRequest.notes = notes;

    if (leaveRequest.dateFrom && leaveRequest.dateTo) {
      leaveRequest.totalLeaveDays =
        Math.ceil(
          (new Date(leaveRequest.dateTo) - new Date(leaveRequest.dateFrom)) /
            (1000 * 60 * 60 * 24)
        ) + 1;
    }

    // 🚨 Check for another pending leave with same/later start date
    const existingPending = await Leave.findOne({
      _id: { $ne: leaveRequest._id },
      employee: req.user._id,
      leaveStatus: "pending",
      dateFrom: { $gte: leaveRequest.dateFrom },
    });

    if (existingPending) {
      return res.status(400).json({
        message: `You already have another pending leave starting on or after ${new Date(
          existingPending.dateFrom
        ).toLocaleDateString()}.`,
      });
    }

    // Attendance conflict check
    const { start, end } = normalizeDateRange(
      leaveRequest.dateFrom,
      leaveRequest.dateTo
    );

    const checkAttendance = await Attendances.find({
      employee: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (checkAttendance.length > 0) {
      return res.status(400).json({
        message:
          "You have attendance records during the requested leave period.",
        conflicts: checkAttendance.map((r) => r.date),
      });
    }

    await leaveRequest.save();

    // Check for overlapping or duplicate pending leave
    const newValues = {
      leaveType: leaveRequest.leaveType,
      dateFrom: leaveRequest.dateFrom,
      dateTo: leaveRequest.dateTo,
      notes: leaveRequest.notes,
      totalLeaveDays: leaveRequest.totalLeaveDays,
    };

    const changes = {};
    for (const key in newValues) {
      if (String(oldValues[key]) !== String(newValues[key])) {
        changes[key] = { from: oldValues[key], to: newValues[key] };
      }
    }

    await LeaveLogs.create({
      leaveId: leaveRequest._id,
      employeeId: req.user._id,
      action: "UPDATED",
      description: `Leave updated by employee (${req.user.firstname} ${req.user.lastname})`,
      performedBy: req.user._id,
      changes,
      metadata: { role: req.user.role, updatedAt: new Date() },
      ipAddress: req.ip || "N/A",
      userAgent: req.headers["user-agent"] || "N/A",
    });

    res.json({
      message: "Leave request updated successfully.",
      leaveRequest,
    });
  } catch (error) {
    console.error("Error in editLeave:", error);
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
