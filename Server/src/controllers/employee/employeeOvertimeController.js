const overtime = require("../../models/overtimeSchema");
const leave = require("../../models/LeaveSchema/leaveSchema");

const addOvertime = async (req, res) => {
  try {
    const { date, hours, reason, overtimeType = "regular" } = req.body;
    const employeeId = req.user._id;

    // Validation
    if (!date || !hours || !reason) {
      return res.status(400).json({
        success: false,
        message: "Date, hours, and reason are required.",
      });
    }

    if (hours <= 0 || hours > 24) {
      return res.status(400).json({
        success: false,
        message: "Hours must be between 1 and 24.",
      });
    }

    // Check for duplicate overtime on the same date
    const existingOvertime = await overtime.findOne({
      employee: employeeId,
      date: new Date(date),
      status: { $ne: "rejected" },
    });

    if (existingOvertime) {
      return res.status(400).json({
        success: false,
        message: "An overtime request already exists for this date.",
      });
    }

    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0); // Normalize to midnight for accurate comparison

    const checkPendingLeave = await leave.findOne({
      employeeId: employeeId,
      status: "pending", // Only block if leave is not yet approved or rejected
      startDate: { $lte: requestedDate },
      endDate: { $gte: requestedDate },
    });

    if (checkPendingLeave) {
      return res.status(400).json({
        success: false,
        message: `Cannot request overtime on ${requestedDate.toDateString()} because you have a pending leave scheduled from ${checkPendingLeave.startDate.toDateString()} to ${checkPendingLeave.endDate.toDateString()}.`,
      });
    }

    const newOvertimeRequest = new overtime({
      employee: employeeId,
      date: new Date(date),
      hours: parseFloat(hours),
      status: "pending",
      reason,
      overtimeType,
      createdAt: new Date(),
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

    // Build query based on role
    const query =
      currentUser.role === "employee" ? { employee: currentUser._id } : {};

    const overtimeRecords = await overtime
      .find(query)
      .sort({ createdAt: -1 })
      .populate("employee", "firstname lastname employeeId department");

    // Return empty array instead of 404 when no records found
    res.status(200).json({
      success: true,
      data: overtimeRecords || [],
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
