const overtime = require("../../models/overtimeSchema");
const leave = require("../../models/LeaveSchema/leaveSchema");

const addOvertime = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      hours,
      reason,
      overtimeType = "regular",
    } = req.body;
    const employeeId = req.user._id;

    // Validation
    if (!dateFrom || !dateTo || !hours || !reason) {
      return res.status(400).json({
        success: false,
        message: "Date from, date to, hours, and reason are required.",
      });
    }

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    // Validate date range
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Date from cannot be later than date to.",
      });
    }

    if (hours <= 0 || hours > 24) {
      return res.status(400).json({
        success: false,
        message: "Hours must be between 1 and 24.",
      });
    }

    // Normalize dates to midnight for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Check for overlapping overtime requests
    const existingOvertime = await overtime.findOne({
      employee: employeeId,
      status: { $ne: "rejected" },
      $or: [
        // New request starts within existing period
        {
          dateFrom: { $lte: startDate },
          dateTo: { $gte: startDate },
        },
        // New request ends within existing period
        {
          dateFrom: { $lte: endDate },
          dateTo: { $gte: endDate },
        },
        // New request completely contains existing period
        {
          dateFrom: { $gte: startDate },
          dateTo: { $lte: endDate },
        },
        // Existing request completely contains new period
        {
          dateFrom: { $lte: startDate },
          dateTo: { $gte: endDate },
        },
      ],
    });

    if (existingOvertime) {
      return res.status(400).json({
        success: false,
        message: "An overtime request already exists for overlapping dates.",
      });
    }

    // Check for leave conflicts - any approved leave that overlaps with overtime period
    const conflictingLeave = await leave.findOne({
      employee: employeeId,
      leaveStatus: "approved",
      $or: [
        // Leave starts within overtime period
        {
          dateFrom: { $gte: startDate, $lte: endDate },
        },
        // Leave ends within overtime period
        {
          dateTo: { $gte: startDate, $lte: endDate },
        },
        // Leave completely contains overtime period
        {
          dateFrom: { $lte: startDate },
          dateTo: { $gte: endDate },
        },
        // Overtime completely contains leave period
        {
          dateFrom: { $gte: startDate },
          dateTo: { $lte: endDate },
        },
      ],
    });

    if (conflictingLeave) {
      return res.status(400).json({
        success: false,
        message: `Cannot request overtime during approved leave period (${conflictingLeave.dateFrom.toDateString()} to ${conflictingLeave.dateTo.toDateString()}).`,
      });
    }

    // Check for pending leave requests that might conflict
    const pendingLeave = await leave.findOne({
      employee: employeeId,
      leaveStatus: "pending",
      $or: [
        {
          dateFrom: { $gte: startDate, $lte: endDate },
        },
        {
          dateTo: { $gte: startDate, $lte: endDate },
        },
        {
          dateFrom: { $lte: startDate },
          dateTo: { $gte: endDate },
        },
      ],
    });

    if (pendingLeave) {
      return res.status(400).json({
        success: false,
        message: `You have a pending leave request for overlapping dates (${pendingLeave.dateFrom.toDateString()} to ${pendingLeave.dateTo.toDateString()}). Please wait for leave approval or cancel the leave request.`,
      });
    }

    // Calculate total overtime days
    const timeDiff = endDate - startDate;
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    const newOvertimeRequest = new overtime({
      employee: employeeId,
      dateFrom: startDate,
      dateTo: endDate,
      totalOvertimeDays: totalDays,
      hours: parseFloat(hours),
      status: "pending",
      reason,
      overtimeType,
    });

    await newOvertimeRequest.save();
    await newOvertimeRequest.populate(
      "employee",
      "firstname lastname employeeId department"
    );

    res.status(201).json({
      success: true,
      message: "Overtime request submitted successfully.",
      overtimeRequest: newOvertimeRequest,
    });
  } catch (error) {
    console.error("Error in addOvertime:", error);

    // Handle duplicate key error (unique index violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An overtime request for this exact period already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit overtime request",
      error: error.message,
    });
  }
};

const getEmployeeOvertime = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser || !currentUser._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const allowedRoles = ["employee", "admin"];
    if (!allowedRoles.includes(currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Base query
    const query =
      currentUser.role === "employee" ? { employee: currentUser._id } : {};

    // Apply filters
    if (req.query.status) {
      query.status = new RegExp(`^${req.query.status}$`, "i");
    }

    // Fetch overtime records
    let overtimeRecords = await overtime
      .find(query)
      .sort({ createdAt: -1 })
      .populate("employee", "firstname lastname employeeId department")
      .populate("approvedBy", "firstname lastname employeeId"); // ✅ includes approver

    // If department filter exists, filter after population
    if (req.query.department) {
      overtimeRecords = overtimeRecords.filter(
        (rec) => rec.employee?.department === req.query.department
      );
    }

    res.status(200).json({
      success: true,
      data: overtimeRecords,
      count: overtimeRecords.length,
    });
  } catch (error) {
    console.error("Error in getEmployeeOvertime:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overtime records",
      error: error.message,
    });
  }
};

const editOvertime = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, hours, reason, overtimeType } = req.body;
    const currentUser = req.user;

    // Build query based on user role
    const query = { _id: id };
    if (currentUser.role === "employee") {
      query.employee = currentUser._id;
      query.status = "pending"; // Employees can only edit pending requests
    }

    const overtimeRequest = await overtime.findOne(query);

    if (!overtimeRequest) {
      return res.status(404).json({
        success: false,
        message: "Overtime record not found or cannot be edited.",
      });
    }

    // Validate hours if provided
    if (hours && (hours <= 0 || hours > 24)) {
      return res.status(400).json({
        success: false,
        message: "Hours must be between 1 and 24.",
      });
    }

    // Update fields
    if (date) overtimeRequest.date = new Date(date);
    if (hours) overtimeRequest.hours = parseFloat(hours);
    if (reason) overtimeRequest.reason = reason;
    if (overtimeType) overtimeRequest.overtimeType = overtimeType;

    await overtimeRequest.save();
    await overtimeRequest.populate(
      "employee",
      "firstname lastname employeeId department"
    );

    res.status(200).json({
      success: true,
      message: "Overtime request updated successfully.",
      overtimeRequest,
    });
  } catch (error) {
    console.error("Error in editOvertime:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update overtime request",
      error: error.message,
    });
  }
};

const deleteOvertime = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const query = { _id: id };
    if (currentUser.role === "employee") {
      query.employee = currentUser._id;
      query.status = "pending"; // Employees can only delete pending requests
    }

    const deletedOvertime = await overtime.findOneAndDelete(query);

    if (!deletedOvertime) {
      return res.status(404).json({
        success: false,
        message: "Overtime record not found or cannot be deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Overtime record deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteOvertime:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete overtime record",
      error: error.message,
    });
  }
};

module.exports = {
  addOvertime,
  getEmployeeOvertime,
  editOvertime,
  deleteOvertime,
};
