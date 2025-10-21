const Suspension = require("../../../controllers/Admin/dcuments/suspendedContorller");
// Create a suspension
// Create a suspension
exports.createSuspension = async (req, res) => {
  try {
    const { employee, title, descriptions, endDate, suspendBy } = req.body;

    // Validate required fields
    if (!employee || !title || !descriptions || !suspendBy) {
      return res.status(400).json({
        success: false,
        message: "Employee, title, descriptions, and suspendBy are required",
      });
    }

    // Check if employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if suspendBy user exists
    const suspenderExists = await User.findById(suspendBy);
    if (!suspenderExists) {
      return res.status(404).json({
        success: false,
        message: "Suspending user not found",
      });
    }

    // Create new suspension
    const suspension = new Suspension({
      employee,
      title,
      descriptions,
      endDate,
      suspendBy,
    });

    await suspension.save();

    // Populate references
    await suspension.populate([
      { path: "employee", select: "firstname lastname employeeEmail" },
      { path: "suspendBy", select: "firstname lastname employeeEmail" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Suspension created successfully",
      data: suspension,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating suspension",
      error: error.message,
    });
  }
};

// Search employee suspensions
exports.searchEmployeeSuspensions = async (req, res) => {
  try {
    const { employeeId, status, searchTerm } = req.query;
    let query = {};

    // Filter by employee ID
    if (employeeId) {
      query.employee = employeeId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by title or descriptions
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { descriptions: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const suspensions = await Suspension.find(query)
      .populate("employee", "firstname lastname employeeEmail")
      .populate("suspendBy", "firstname lastname employeeEmail")
      .sort({ createdAt: -1 });

    if (suspensions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No suspensions found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Suspensions retrieved successfully",
      count: suspensions.length,
      data: suspensions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error searching suspensions",
      error: error.message,
    });
  }
};

// Get all suspensions for a specific employee
exports.getEmployeeSuspensions = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const suspensions = await Suspension.find({ employee: employeeId })
      .populate("employee", "firstname lastname employeeEmail")
      .populate("suspendBy", "firstname lastname employeeEmail")
      .sort({ createdAt: -1 });

    if (suspensions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No suspensions found for this employee",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee suspensions retrieved successfully",
      count: suspensions.length,
      data: suspensions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving employee suspensions",
      error: error.message,
    });
  }
};

// Update suspension status
exports.updateSuspensionStatus = async (req, res) => {
  try {
    const { suspensionId } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "pending", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const suspension = await Suspension.findByIdAndUpdate(
      suspensionId,
      { status, updatedAt: Date.now() },
      { new: true }
    )
      .populate("employee", "firstname lastname employeeEmail")
      .populate("suspendBy", "firstname lastname employeeEmail");

    if (!suspension) {
      return res.status(404).json({
        success: false,
        message: "Suspension not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Suspension status updated successfully",
      data: suspension,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating suspension status",
      error: error.message,
    });
  }
};

// Delete suspension
exports.deleteSuspension = async (req, res) => {
  try {
    const { suspensionId } = req.params;

    const suspension = await Suspension.findByIdAndDelete(suspensionId);

    if (!suspension) {
      return res.status(404).json({
        success: false,
        message: "Suspension not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Suspension deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting suspension",
      error: error.message,
    });
  }
};

// Search employees by name, email, or employee ID
exports.searchEmployees = async (req, res) => {
  try {
    const { q, searchTerm } = req.query;
    const query = q || searchTerm;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        data: [],
      });
    }

    const employees = await User.find({
      $or: [
        { firstname: { $regex: query, $options: "i" } },
        { lastname: { $regex: query, $options: "i" } },
        { employeeEmail: { $regex: query, $options: "i" } },
        { employeeId: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    })
      .select(
        "firstname lastname employeeEmail employeeId department jobposition jobStatus"
      )
      .limit(10);

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employees found",
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error searching employees",
      error: error.message,
    });
  }
};
