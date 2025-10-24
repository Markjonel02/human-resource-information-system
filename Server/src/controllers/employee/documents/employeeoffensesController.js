const Offenses = require("../../../models/document/OffensesModel");

// Helper function to format offense data
const formatOffenseData = (offense) => {
  const offenseObj = offense.toObject();
  return {
    ...offenseObj,
    employeeName: offense.employee
      ? `${offense.employee.firstname} ${offense.employee.lastname}`.trim()
      : "",
    employeeDepartment: offense.employee?.department || "",
    recordedBy: offense.recordedBy
      ? `${offense.recordedBy.firstname} ${offense.recordedBy.lastname}`.trim()
      : "admin",
  };
};

// @desc    Get my offenses (Employee can only view their own offenses)
// @route   GET /api/employee/my-offenses
// @access  Private (Employee only)
const getMyOffenses = async (req, res) => {
  try {
    // Get the current authenticated employee's ID
    const employeeId = req.user._id || req.user.id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Verify that the employee is requesting their own offenses
    if (
      req.user.role === "employee" &&
      req.user._id.toString() !== employeeId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own offenses",
      });
    }

    // Fetch all offenses for the logged-in employee
    const offenses = await Offenses.find({ employee: employeeId })
      .populate("employee", "firstname lastname email department employeeId")
      .populate("recordedBy", "firstname lastname email")
      .sort({ date: -1 }); // Sort by most recent first

    if (!offenses || offenses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No offenses found for you",
        count: 0,
        offenses: [],
      });
    }

    const formattedOffenses = offenses.map(formatOffenseData);

    res.status(200).json({
      success: true,
      message: "Your offenses retrieved successfully",
      count: formattedOffenses.length,
      offenses: formattedOffenses,
    });
  } catch (error) {
    console.error("Get my offenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your offenses",
      error: error.message,
    });
  }
};

// @desc    Get specific offense by ID (Employee can only view if it belongs to them)
// @route   GET /api/employee/offenses/:offenseId
// @access  Private (Employee only)
const getOffenseById = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const { offenseId } = req.params;

    if (!offenseId) {
      return res.status(400).json({
        success: false,
        message: "Offense ID is required",
      });
    }

    // Find the offense
    const offense = await Offenses.findById(offenseId)
      .populate("employee", "firstname lastname email department employeeId")
      .populate("recordedBy", "firstname lastname email");

    if (!offense) {
      return res.status(404).json({
        success: false,
        message: "Offense not found",
      });
    }

    // Check if the offense belongs to the authenticated employee
    if (offense.employee._id.toString() !== employeeId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only view your own offenses",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offense retrieved successfully",
      offense: formatOffenseData(offense),
    });
  } catch (error) {
    console.error("Get offense by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve offense",
      error: error.message,
    });
  }
};

// @desc    Get offense statistics for employee
// @route   GET /api/employee/offense-stats
// @access  Private (Employee only)
const getOffenseStats = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get all offenses for the employee
    const offenses = await Offenses.find({ employee: employeeId }).populate(
      "employee",
      "firstname lastname email department employeeId"
    );

    if (!offenses || offenses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No offenses found",
        stats: {
          totalOffenses: 0,
          bySeverity: {
            minor: 0,
            moderate: 0,
            major: 0,
            severe: 0,
          },
          recentOffenses: [],
        },
      });
    }

    // Count offenses by severity
    const bySeverity = {
      minor: 0,
      moderate: 0,
      major: 0,
      severe: 0,
    };

    offenses.forEach((offense) => {
      const severity = offense.severity?.toLowerCase() || "minor";
      if (bySeverity[severity] !== undefined) {
        bySeverity[severity]++;
      }
    });

    // Get recent offenses (last 5)
    const recentOffenses = offenses.slice(0, 5).map((offense) => ({
      _id: offense._id,
      title: offense.title,
      severity: offense.severity,
      date: offense.date,
    }));

    res.status(200).json({
      success: true,
      message: "Offense statistics retrieved successfully",
      stats: {
        totalOffenses: offenses.length,
        bySeverity,
        recentOffenses,
      },
    });
  } catch (error) {
    console.error("Get offense stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve offense statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getMyOffenses,
  getOffenseById,
  getOffenseStats,
};
