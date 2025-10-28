const Suspension = require("../../../models/document/suspensionModel");
exports.getEmployeeSuspensions = async (req, res) => {
  try {
    const employeeId = req.user._id; // Assuming authenticated user ID is in req.user

    // Find all suspensions for this employee
    const suspensions = await Suspension.find({ employee: employeeId })
      .populate({
        path: "suspendBy",
        select: "firstname lastname employeeEmail employeeId",
      })
      .sort({ createdAt: -1 }); // Most recent first

    if (!suspensions || suspensions.length === 0) {
      return res.status(200).json({
        success: true,
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
      message: "Error retrieving suspensions",
      error: error.message,
    });
  }
};

exports.getEmployeeSuspensionById = async (req, res) => {
  try {
    const employeeId = req.user._id; // Authenticated user ID
    const { suspensionId } = req.params;

    // Find suspension and verify it belongs to the employee
    const suspension = await Suspension.findOne({
      _id: suspensionId,
      employee: employeeId,
    }).populate({
      path: "suspendBy",
      select: "firstname lastname employeeEmail employeeId",
    });

    if (!suspension) {
      return res.status(404).json({
        success: false,
        message: "Suspension not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Suspension retrieved successfully",
      data: suspension,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving suspension",
      error: error.message,
    });
  }
};

exports.getActiveSuspensions = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const currentDate = new Date();

    // Find active suspensions (endDate is null or in the future)
    const suspensions = await Suspension.find({
      employee: employeeId,
      $or: [{ endDate: null }, { endDate: { $gte: currentDate } }],
    })
      .populate({
        path: "suspendBy",
        select: "firstname lastname employeeEmail employeeId",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Active suspensions retrieved successfully",
      count: suspensions.length,
      data: suspensions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving active suspensions",
      error: error.message,
    });
  }
};