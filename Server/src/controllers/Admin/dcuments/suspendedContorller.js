const Suspension = require("../../../controllers/Admin/dcuments/suspendedContorller");

// Get all suspensions with populated references
// Get all suspensions with populated references

// Get all suspensions with populated references
exports.getAllSuspensions = async (req, res) => {
  try {
    const suspensions = await Suspension.find()
      .populate("employee", "name email department")
      .populate("suspendBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: suspensions,
      message: "Suspensions retrieved successfully",
    });
  } catch (error) {
    console.error("Get all suspensions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve suspensions",
      error: error.message,
    });
  }
};

// Get suspension by ID
exports.getSuspensionById = async (req, res) => {
  try {
    const { id } = req.params;

    const suspension = await Suspension.findById(id)
      .populate("employee", "name email department")
      .populate("suspendBy", "name email");

    if (!suspension) {
      return res.status(404).json({
        success: false,
        message: "Suspension record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: suspension,
      message: "Suspension retrieved successfully",
    });
  } catch (error) {
    console.error("Get suspension by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve suspension",
      error: error.message,
    });
  }
};

// Create new suspension
exports.createSuspension = async (req, res) => {
  try {
    const { title, descriptions, employee, startDate, endDate, status } =
      req.body;
    const suspendBy = req.user?.id || req.user?._id;

    // Validate required fields
    if (!title || !descriptions || !employee) {
      return res.status(400).json({
        success: false,
        message: "Title, descriptions, and employee are required",
      });
    }

    // Verify employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before end date",
        });
      }
    }

    const newSuspension = new Suspension({
      title,
      descriptions,
      employee,
      suspendBy,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: status || "active",
    });

    await newSuspension.save();

    // Populate references before returning
    const populatedSuspension = await Suspension.findById(newSuspension._id)
      .populate("employee", "name email department")
      .populate("suspendBy", "name email");

    res.status(201).json({
      success: true,
      data: populatedSuspension,
      message: "Suspension record created successfully",
    });
  } catch (error) {
    console.error("Create suspension error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create suspension record",
      error: error.message,
    });
  }
};

// Update suspension
exports.updateSuspension = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, descriptions, employee } = req.body;

    // Validate required fields
    if (!title || !descriptions || !employee) {
      return res.status(400).json({
        success: false,
        message: "Title, descriptions, and employee are required",
      });
    }

    // Verify suspension exists
    const suspension = await Suspension.findById(id);
    if (!suspension) {
      return res.status(404).json({
        success: false,
        message: "Suspension record not found",
      });
    }

    // Verify employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update fields
    suspension.title = title;
    suspension.descriptions = descriptions;
    suspension.employee = employee;
    suspension.updatedAt = new Date();

    await suspension.save();

    // Populate references before returning
    const updatedSuspension = await Suspension.findById(id)
      .populate("employee", "name email department")
      .populate("suspendBy", "name email");

    res.status(200).json({
      success: true,
      data: updatedSuspension,
      message: "Suspension record updated successfully",
    });
  } catch (error) {
    console.error("Update suspension error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update suspension record",
      error: error.message,
    });
  }
};

// Delete suspension
exports.deleteSuspension = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify suspension exists
    const suspension = await Suspension.findById(id);
    if (!suspension) {
      return res.status(404).json({
        success: false,
        message: "Suspension record not found",
      });
    }

    // Delete the suspension
    await Suspension.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Suspension record deleted successfully",
    });
  } catch (error) {
    console.error("Delete suspension error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete suspension record",
      error: error.message,
    });
  }
};

// Get suspensions by employee
exports.getSuspensionsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const suspensions = await Suspension.find({ employee: employeeId })
      .populate("employee", "name email department")
      .populate("suspendBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: suspensions,
      message: "Employee suspensions retrieved successfully",
    });
  } catch (error) {
    console.error("Get suspensions by employee error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve employee suspensions",
      error: error.message,
    });
  }
};

// Update suspension status
exports.updateSuspensionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["active", "pending", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Verify suspension exists
    const suspension = await Suspension.findById(id);
    if (!suspension) {
      return res.status(404).json({
        success: false,
        message: "Suspension record not found",
      });
    }

    // Update status
    suspension.status = status;
    suspension.updatedAt = new Date();

    if (status === "completed") {
      suspension.endDate = new Date();
    }

    await suspension.save();

    // Populate references before returning
    const updatedSuspension = await Suspension.findById(id)
      .populate("employee", "name email department")
      .populate("suspendBy", "name email");

    res.status(200).json({
      success: true,
      data: updatedSuspension,
      message: `Suspension status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update suspension status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update suspension status",
      error: error.message,
    });
  }
};
