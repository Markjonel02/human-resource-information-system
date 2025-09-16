const OfficialBusiness = require("../../models/officialbusinessSchema/officialBusinessSchema");
const User = require("../../models/user");
const Leave = require("../../models/LeaveSchema/leaveSchema");
const {
  validateOfficialBusiness,
} = require("../../utils/officialbusinessValidator");

const getAllOfficialBusinesss = async (req, res) => {
  try {
    const query =
      req.user.role === "employee" && req.user.role === "hr"
        ? { employee: req.user.id }
        : {}; // Admin/HR can see all
    const getOB = await OfficialBusiness.find(query)
      .populate("employee", "employeeId firstname lastname")
      .populate("approvedBy", "firstname ")
      .populate("rejectedBy", "firstname ");
    res.status(200).json({
      success: true,
      data: getOB,
    });
  } catch (error) {
    console.error("Error fetching Official Business:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Controller: Add Official Business (Admin/HR only)

const addAdminOfficialBusiness = async (req, res) => {
  try {
    // 1. Authorization check: only Admin & HR can add official business
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(401).json({
        message: "Unauthorized! You cannot access this resource.",
      });
    }

    // 2. Extract and validate required fields from request body
    const { employeeId, dateFrom, dateTo, reason } = req.body;
    const performedBy = req.user ? req.user._id : null;

    if (!employeeId || !reason || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // 3. Check if the employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // 4. Validate date range
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    if (fromDate > toDate) {
      return res.status(400).json({
        message: "Date From cannot be later than Date To.",
      });
    }

    // 5. Reuse validation utility
    const validation = await validateOfficialBusiness(
      employeeId,
      fromDate,
      toDate
    );
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        conflict: validation.conflict,
      });
    }

    // 6. Prepare Official Business payload
    const add_OB = {
      employee: employeeId,
      reason,
      dateFrom: fromDate,
      dateTo: toDate,
      status: "pending",
      performedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 7. Save the new Official Business record
    const newOb = new OfficialBusiness(add_OB);
    await newOb.save();

    // 8. Populate employee details for response
    const populatedOB = await OfficialBusiness.findById(newOb._id)
      .populate("employee", "firstname lastname employeeId email")
      .lean();

    // 9. Return success response
    return res.status(201).json({
      message: "Successfully created new Official Business.",
      data: populatedOB,
    });
  } catch (error) {
    console.error("Error adding Official Business:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const searchEmployees = async (req, res) => {
  try {
    const { q } = req.query; // q is the search query

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const searchTerm = q.trim();

    // Create search conditions for both name and employee ID
    const searchConditions = [
      // Search by first name (case insensitive)
      { firstname: { $regex: searchTerm, $options: "i" } },

      // Search by last name (case insensitive)
      { lastname: { $regex: searchTerm, $options: "i" } },

      // Search by full name (combining first and last name)
      {
        $expr: {
          $regexMatch: {
            input: {
              $concat: ["$firstname", " ", { $ifNull: ["$lastname", ""] }],
            },
            regex: searchTerm,
            options: "i",
          },
        },
      },
    ];

    // If the search term looks like an ID
    if (searchTerm.match(/^[a-fA-F0-9]{24}$/) || searchTerm.match(/^\d+$/)) {
      // Add MongoDB ObjectId search
      if (searchTerm.match(/^[a-fA-F0-9]{24}$/)) {
        searchConditions.push({ _id: searchTerm });
      }

      // Add custom employeeId field search if you have one
      searchConditions.push({ employeeId: searchTerm });

      // Add employeeId with case-insensitive regex for partial matches
      searchConditions.push({
        employeeId: { $regex: searchTerm, $options: "i" },
      });
    }

    // Find users matching any of the search conditions
    const employees = await User.find({
      $or: searchConditions,
    })
      .select("_id firstname lastname employeeId department email") // Select only needed fields
      .limit(10) // Limit results to prevent performance issues
      .lean(); // Use lean() for better performance

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error searching employees:", error);
    res.status(500).json({
      message: "Failed to search employees",
      error: error.message,
    });
  }
};

// Alternative implementation if you want to search by employee number/ID specifically
const searchEmployeesAlternative = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const searchTerm = q.trim();

    // Build dynamic search query
    let searchQuery = {
      $or: [
        { firstname: { $regex: searchTerm, $options: "i" } },
        { lastname: { $regex: searchTerm, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$firstname", " ", { $ifNull: ["$lastname", ""] }],
              },
              regex: searchTerm,
              options: "i",
            },
          },
        },
      ],
    };

    // Check if search term could be an ID
    const isNumeric = /^\d+$/.test(searchTerm);
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(searchTerm);

    if (isNumeric) {
      searchQuery.$or.push({ employeeId: searchTerm });
      searchQuery.$or.push({
        employeeId: { $regex: searchTerm, $options: "i" },
      });
    }

    if (isObjectId) {
      try {
        searchQuery.$or.push({ _id: mongoose.Types.ObjectId(searchTerm) });
      } catch (err) {
        // Invalid ObjectId, skip this condition
      }
    }

    const employees = await User.find(searchQuery)
      .select("_id firstname lastname employeeId department email")
      .limit(10)
      .lean();

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error searching employees:", error);
    res.status(500).json({
      message: "Failed to search employees",
      error: error.message,
    });
  }
};

const editAdminOfficialBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get OB record
    const obRecord = await OfficialBusiness.findById(id);
    if (!obRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }

    // Validate date fields
    if (!updates.dateFrom || !updates.dateTo) {
      return res.status(400).json({
        success: false,
        message: "dateFrom and dateTo are required.",
      });
    }

    const fromDate = new Date(updates.dateFrom);
    const toDate = new Date(updates.dateTo);

    if (fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "dateFrom cannot be later than dateTo.",
      });
    }

    // ✅ Use reusable validator with excludeId
    const validation = await validateOfficialBusiness(
      obRecord.employee,
      fromDate,
      toDate,
      id
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        conflict: validation.conflict,
      });
    }

    // Update
    const updatedOB = await OfficialBusiness.findByIdAndUpdate(
      id,
      { $set: { ...updates, dateFrom: fromDate, dateTo: toDate } },
      { new: true, runValidators: true }
    ).populate("employee", "firstname lastname employeeId email");

    res.status(200).json({
      success: true,
      message: "Official Business updated successfully",
      data: updatedOB,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllOfficialBusinesss,
  addAdminOfficialBusiness,
  searchEmployees,
  editAdminOfficialBusiness,
};
