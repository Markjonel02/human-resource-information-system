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
    for (const type of creditRequiredTypes) {
      const remaining = credits.credits[type]?.remaining || 0;
      if (totalLeaveDays > remaining) {
        return res.status(400).json({
          message: `Requested ${totalLeaveDays} day(s) exceeds available ${type} credits (${remaining} remaining).`,
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
    const allowedRoles = ["employee", "admin"];
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
      // Only allow editing if the leave status is 'pending'
      leaveStatus: "pending",
    });

    if (!leaveRequest) {
      return res.status(404).json({
        message:
          "Leave record not found or cannot be edited. It may have already been processed.",
      });
    }

    // Validate leave type
    const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "CL"];
    if (leaveType && !validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        message: "Invalid leave type.",
      });
    }

    if (leaveType) leaveRequest.leaveType = leaveType;
    if (dateFrom) leaveRequest.dateFrom = new Date(dateFrom);
    if (dateTo) leaveRequest.dateTo = new Date(dateTo);
    if (notes !== undefined) leaveRequest.notes = notes;

    // Update totalLeaveDays if dates changed
    if (leaveRequest.dateFrom && leaveRequest.dateTo) {
      leaveRequest.totalLeaveDays =
        Math.ceil(
          (new Date(leaveRequest.dateTo) - new Date(leaveRequest.dateFrom)) /
            (1000 * 60 * 60 * 24)
        ) + 1;
    }

    await leaveRequest.save();
    res.json({
      message: "Leave request updated successfully.",
      leaveRequest,
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
