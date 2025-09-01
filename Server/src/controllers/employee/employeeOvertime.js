const overtime = require("../../models/overtimeSchema");

const addOvertime = async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      message: "Access denied. Only employees can file overtime requests.",
    });
  }

  try {
    const { date, hours } = req.body;
    const employeeId = req.user._id;

    // Step 1: Validate required fields
    if (!date || !hours) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Step 2: Create and save overtime request
    const newOvertimeRequest = new overtime({
      employee: employeeId,
      date: new Date(date),
      hours,
      status: "pending",
    });

    await newOvertimeRequest.save();

    res.status(201).json({
      message: "Overtime request filed successfully.",
      overtimeRequest: newOvertimeRequest,
    });
  } catch (error) {
    console.error("Error in addOvertime:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getEmployeeOvertime = async (req, res) => {
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
      currentUser.role === "employee" ? { employee: currentUser._id } : {}; // Admins can view all overtime records

    // Step 4: Fetch overtime records
    const overtimeRecords = await overtime
      .find(query)
      .sort({ createdAt: -1 })
      .populate("employee", "firstname lastname employeeId department");

    // Step 5: Handle empty results
    if (!Array.isArray(overtimeRecords) || overtimeRecords.length === 0) {
      return res.status(404).json({ message: "No overtime records found." });
    }

    // Step 6: Return results
    res.status(200).json(overtimeRecords);
  } catch (error) {
    console.error("Error in getEmployeeOvertime:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Edit existing overtime request for employee
const editOvertime = async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      message:
        "Access denied. Only employees can edit their overtime requests.",
    });
  }

  try {
    const { id } = req.params;
    const { date, hours } = req.body;

    const overtimeRequest = await overtime.findOne({
      _id: id,
      employee: req.user._id,
      // Only allow editing if the overtime status is 'pending'
      status: "pending",
    });

    if (!overtimeRequest) {
      return res.status(404).json({
        message:
          "Overtime record not found or cannot be edited. It may have already been processed.",
      });
    }

    if (date) overtimeRequest.date = new Date(date);
    if (hours) overtimeRequest.hours = hours;

    await overtimeRequest.save();

    res.status(200).json({
      message: "Overtime request updated successfully.",
      overtimeRequest,
    });
  } catch (error) {
    console.error("Error in editOvertime:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  addOvertime,
  getEmployeeOvertime,
  editOvertime,
};
