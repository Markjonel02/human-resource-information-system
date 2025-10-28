const Attendance = require("../../../models/attendance");
const Offenses = require("../../../models/document/OffensesModel");
const Employee = require("../../../models/user");

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
      : "Admin",
  };
};

const getMyOffenses = async (req, res) => {
  try {
    // Get the current user's ID from the JWT token
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const offenses = await Offenses.find({ employee: userId })
      .populate("employee", "firstname lastname email department employeeId")
      .populate("recordedBy", "firstname lastname email")
      .sort({ date: -1 });

    if (offenses.length === 0) {
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
      message: "Failed to fetch your offenses",
      error: error.message,
    });
  }
};

// @desc    Get employee offenses (by authenticated employee)
// @route   GET /api/offense/my-offenses
// @access  Private (Employee can view their own offenses)

const getEmployeeOffenses = async (req, res) => {
  try {
    // Get the current authenticated employee's ID
    const employeeId = req.user._id || req.user.id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
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
    console.error("Get employee offenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your offenses",
      error: error.message,
    });
  }
};

// @desc    Create offense
// @route   POST /api/offense
// @access  Private
const createOffense = async (req, res) => {
  try {
    const {
      title,
      severity,
      date,
      description,
      employeeId,
      actionTaken,
      notes,
      category,
    } = req.body;

    // ✅ Validate required fields
    if (!title || !severity || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Title, severity, and employee are required.",
      });
    }

    // ✅ Optional: Validate category if provided
    if (category && !["attendance", "conduct", "performance", "insubordination", "other"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category value.",
      });
    }

    // ✅ Check for existing pending offense for this employee
    const existingPendingOffense = await Offenses.findOne({
      employee: employeeId,
      status: "pending",
    }).populate("employee", "firstname lastname employeeId");

    if (existingPendingOffense) {
      const employeeName = `${existingPendingOffense.employee.firstname} ${existingPendingOffense.employee.lastname}`;
      return res.status(409).json({
        success: false,
        message: `Cannot create new offense. ${employeeName} already has a pending offense: "${existingPendingOffense.title}". Please resolve the existing offense before creating a new one.`,
        existingOffense: {
          id: existingPendingOffense._id,
          title: existingPendingOffense.title,
          severity: existingPendingOffense.severity,
          date: existingPendingOffense.date,
        },
      });
    }

    // ✅ Create new offense
    const offense = new Offenses({
      employee: employeeId,
      title,
      severity,
      date: date || new Date(),
      description: description || "",
      actionTaken: actionTaken || "",
      notes: notes || "",
      category: category || "other",
      status: "pending", // Default status
    });

    await offense.save();

    // ✅ Populate employee details
    await offense.populate(
      "employee",
      "firstname lastname department employeeId"
    );

    res.status(201).json({
      success: true,
      message: "Offense created successfully",
      offense: formatOffenseData(offense),
    });
  } catch (error) {
    console.error("Create offense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create offense",
      error: error.message,
    });
  }
};
// @desc    Get all offenses
// @route   GET /api/offense
// @access  Private
const getAllOffenses = async (req, res) => {
  try {
    const offenses = await Offenses.find()
      .populate("employee", "firstname lastname email department employeeId")
      .sort({ date: -1 });

    const formattedOffenses = offenses.map(formatOffenseData);

    res.status(200).json({
      success: true,
      count: formattedOffenses.length,
      offenses: formattedOffenses,
    });
  } catch (error) {
    console.error("Get all offenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offenses",
      error: error.message,
    });
  }
};

// @desc    Get single offense by ID
// @route   GET /api/offense/:id
// @access  Private
const getOffenseById = async (req, res) => {
  try {
    const offense = await Offenses.findById(req.params.id).populate(
      "employee",
      "firstname lastname email department employeeId"
    );

    if (!offense) {
      return res.status(404).json({
        success: false,
        message: "Offense not found",
      });
    }

    res.status(200).json({
      success: true,
      offense: formatOffenseData(offense),
    });
  } catch (error) {
    console.error("Get offense by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offense",
      error: error.message,
    });
  }
};

// @desc    Update offense
// @route   PUT /api/offense/:id
// @access  Private (Admin, HR)
const updateOffense = async (req, res) => {
  try {
    const {
      title,
      severity,
      date,
      description,
      category,
      status,
      actionTaken,
      notes,
    } = req.body;

    const offense = await Offenses.findById(req.params.id);

    if (!offense) {
      return res.status(404).json({
        success: false,
        message: "Offense not found",
      });
    }

    // Update all fields that are provided
    if (title !== undefined) offense.title = title;
    if (severity !== undefined) offense.severity = severity;
    if (date !== undefined) offense.date = date;
    if (description !== undefined) offense.description = description;
    if (category !== undefined) offense.category = category;
    if (status !== undefined) offense.status = status;
    if (actionTaken !== undefined) offense.actionTaken = actionTaken;
    if (notes !== undefined) offense.notes = notes;

    await offense.save();
    await offense.populate(
      "employee",
      "firstname lastname department employeeId"
    );

    res.status(200).json({
      success: true,
      message: "Offense updated successfully",
      offense: formatOffenseData(offense),
    });
  } catch (error) {
    console.error("Update offense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update offense",
      error: error.message,
    });
  }
};

// @desc    Delete offense
// @route   DELETE /api/offense/:id
// @access  Private (Admin)
const deleteOffense = async (req, res) => {
  try {
    const offense = await Offenses.findById(req.params.id);

    if (!offense) {
      return res.status(404).json({
        success: false,
        message: "Offense not found",
      });
    }

    await Offenses.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Offense deleted successfully",
    });
  } catch (error) {
    console.error("Delete offense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete offense",
      error: error.message,
    });
  }
};

// @desc    Get employees with 3 or more late records (potential offense candidates)
// @route   GET /api/offense/check-late-employees
// @access  Private (Admin, HR)
const getEmployeesWithMultipleLates = async (req, res) => {
  try {
    const { minLateCount = 3, days = 30 } = req.query;

    // Calculate date range (default: last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Find all late attendance records in the date range
    const lateRecords = await Attendance.find({
      status: "late",
      date: { $gte: startDate },
    })
      .populate("employee", "firstname lastname employeeId ")
      .sort({ date: -1 });

    // Group by employee and count lates
    const employeeLateStats = {};

    lateRecords.forEach((record) => {
      const empId = record.employee._id.toString();

      if (!employeeLateStats[empId]) {
        employeeLateStats[empId] = {
          employee: record.employee,
          lateCount: 0,
          totalTardinessMinutes: 0,
          lateRecords: [],
        };
      }

      employeeLateStats[empId].lateCount++;
      employeeLateStats[empId].totalTardinessMinutes +=
        record.tardinessMinutes || 0;
      employeeLateStats[empId].lateRecords.push({
        date: record.date,
        checkIn: record.checkIn,
        tardinessMinutes: record.tardinessMinutes,
      });
    });

    // Filter employees with 3 or more lates
    const employeesWithMultipleLates = Object.values(employeeLateStats)
      .filter((emp) => emp.lateCount >= parseInt(minLateCount))
      .sort((a, b) => b.lateCount - a.lateCount);

    res.status(200).json({
      success: true,
      count: employeesWithMultipleLates.length,
      threshold: parseInt(minLateCount),
      dateRange: {
        startDate,
        endDate: new Date(),
        days: parseInt(days),
      },
      employees: employeesWithMultipleLates,
    });
  } catch (error) {
    console.error("Get employees with multiple lates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees with multiple lates",
      error: error.message,
    });
  }
};

// @desc    Get offenses for a specific employee
// @route   GET /api/offense/employee/:employeeId
// @access  Private
const getOffensesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const offenses = await Offenses.find({ employee: employeeId })
      .populate("employee", "firstname lastname email department")
      .sort({ date: -1 });

    const formattedOffenses = offenses.map(formatOffenseData);

    res.status(200).json({
      success: true,
      count: formattedOffenses.length,
      offenses: formattedOffenses,
    });
  } catch (error) {
    console.error("Get offenses by employee error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee offenses",
      error: error.message,
    });
  }
};

const searchEmployees = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    const regex = new RegExp(q.trim(), "i"); // case-insensitive match

    const employees = await Employee.find({
      $or: [
        { firstname: regex },
        { lastname: regex },
        { employeeId: regex },
        { department: regex },
      ],
    })
      .select("_id firstname lastname employeeId department")
      .limit(10)
      .lean();

    // Map results to match frontend expectations
    const mappedEmployees = employees.map((emp) => ({
      _id: emp._id,
      name: `${emp.firstname} ${emp.lastname}`,
      firstname: emp.firstname,
      lastname: emp.lastname,
      department: emp.department || "No Department",
      employeeId: emp.employeeId,
    }));

    res.status(200).json({
      success: true,
      count: mappedEmployees.length,
      employees: mappedEmployees,
    });
  } catch (error) {
    console.error("Search employees error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search employees",
      error: error.message,
    });
  }
};

module.exports = {
  createOffense,
  getAllOffenses,
  getOffenseById,
  updateOffense,
  deleteOffense,
  getEmployeesWithMultipleLates,
  getOffensesByEmployee,
  searchEmployees,
  getMyOffenses,
  getEmployeeOffenses,
};
