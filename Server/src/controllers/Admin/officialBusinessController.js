const OfficialBusiness = require("../../models/officialbusinessSchema/officialBusinessSchema");
const User = require("../../models/user");
const Leave = require("../../models/LeaveSchema/leaveSchema");
const {
  validateOfficialBusiness,
} = require("../../utils/officialbusinessValidator");
const mongoose = require("mongoose");
const getAllOfficialBusinesss = async (req, res) => {
  try {
    const query =
      req.user.role === "employee" && req.user.role === "hr"
        ? { employee: req.user.id }
        : {}; // Admin/HR can see all
    const getOB = await OfficialBusiness.find(query)
      .populate("employee", "employeeId firstname lastname")
      .populate("approvedBy", "firstname lastname")
      .populate("rejectedBy", "firstname lastname")
      .sort({ createdAt: -1 });

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

const editOfficialBusiness = async (req, res) => {
  try {
    // 1. Authorization check: only Admin & HR can edit official business
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(401).json({
        message: "Unauthorized! You cannot access this resource.",
      });
    }

    // 2. Extract Official Business ID from params
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Official Business ID is required!" });
    }

    // 3. Check if the Official Business record exists
    const existingOB = await OfficialBusiness.findById(id);
    if (!existingOB) {
      return res
        .status(404)
        .json({ message: "Official Business record not found." });
    }

    // 4. Extract and validate fields from request body (allow partial updates)
    const { employeeId, dateFrom, dateTo, reason, status } = req.body;
    const performedBy = req.user ? req.user._id : null;

    // Use existing values if not provided in update
    const updatedEmployeeId = employeeId || existingOB.employee;
    const updatedDateFrom = dateFrom ? new Date(dateFrom) : existingOB.dateFrom;
    const updatedDateTo = dateTo ? new Date(dateTo) : existingOB.dateTo;
    const updatedReason = reason || existingOB.reason;
    const updatedStatus = status || existingOB.status;

    // 5. Check if the employee exists (if employeeId is being updated)
    if (employeeId && employeeId !== existingOB.employee.toString()) {
      const employee = await User.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found." });
      }
    }

    // 6. Validate date range
    if (updatedDateFrom > updatedDateTo) {
      return res.status(400).json({
        message: "Date From cannot be later than Date To.",
      });
    }

    // 7. Check for date conflicts only if dates are being changed
    const datesChanged =
      updatedDateFrom.getTime() !== existingOB.dateFrom.getTime() ||
      updatedDateTo.getTime() !== existingOB.dateTo.getTime() ||
      updatedEmployeeId !== existingOB.employee.toString();

    if (datesChanged) {
      // Reuse validation utility (excluding current record)
      const validation = await validateOfficialBusiness(
        updatedEmployeeId,
        updatedDateFrom,
        updatedDateTo,
        id // Exclude current record from validation
      );
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          conflict: validation.conflict,
        });
      }

      // 8. Check for pending leaves that conflict with the official business dates
      const pendingLeaves = await Leave.find({
        employee: updatedEmployeeId,
        status: "pending",
        $or: [
          // Leave starts within OB period
          {
            dateFrom: { $gte: updatedDateFrom, $lte: updatedDateTo },
          },
          // Leave ends within OB period
          {
            dateTo: { $gte: updatedDateFrom, $lte: updatedDateTo },
          },
          // Leave spans entire OB period
          {
            dateFrom: { $lte: updatedDateFrom },
            dateTo: { $gte: updatedDateTo },
          },
        ],
      });

      if (pendingLeaves.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot update Official Business. Employee has pending leave applications that conflict with these dates.",
          conflicts: pendingLeaves.map((leave) => ({
            leaveId: leave._id,
            dateFrom: leave.dateFrom,
            dateTo: leave.dateTo,
            leaveType: leave.leaveType,
            status: leave.status,
          })),
        });
      }
    }

    // 9. Prepare update payload
    const updateData = {
      employee: updatedEmployeeId,
      reason: updatedReason,
      dateFrom: updatedDateFrom,
      dateTo: updatedDateTo,
      status: updatedStatus,
      performedBy,
      updatedAt: new Date(),
    };

    // 10. Update the Official Business record
    const updatedOB = await OfficialBusiness.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("employee", "firstname lastname employeeId email");

    if (!updatedOB) {
      return res
        .status(404)
        .json({ message: "Failed to update Official Business record." });
    }

    // 11. Return success response
    return res.status(200).json({
      message: "Successfully updated Official Business record.",
      data: updatedOB,
    });
  } catch (error) {
    console.error("Error editing Official Business:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const rejectOfficialBusiness = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res
      .status(401)
      .jsong({ message: "Unauthroized, you are forbiden to access this page" });
  }
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const Ob_requests = await OfficialBusiness.findById(id).populate(
      "employee",
      "firstname lastname employeeId"
    );

    if (Ob_requests.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending request can be rejected!" });
    }
    if (!Ob_requests) {
      return res
        .status(400)
        .json({ message: "Cannot found the OfficialBussiness id" });
    }

    Ob_requests.rejectedBy = adminId;
    Ob_requests.rejectedAt = new Date();
    Ob_requests.status = "rejected";

    Ob_requests.save();
    await Ob_requests.populate("employee", "employeeId  firstname lastname");

    res.status(200).json({ message: "Official business successfuly rejected" });
  } catch (err) {
    console.log("message", err);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

const rejectOfficialBusinessbulk = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res
      .status(401)
      .json({ message: "Unauthorized access to this page" });
  }

  try {
    const { ids } = req.body;
    const adminId = req.user._id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "No Official Business IDs were provided" });
    }

    const allRequests = await OfficialBusiness.find({
      _id: { $in: ids },
    }).populate("employee", "firstname lastname employeeId");

    if (!allRequests || allRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No Official Business requests found" });
    }

    const alreadyProcessed = [];
    const conflictingRequests = [];
    const validRequests = [];

    for (const request of allRequests) {
      if (request.status === "rejected" || request.status === "approved") {
        alreadyProcessed.push({
          id: request._id,
          employee: `${request.employee.firstname} ${request.employee.lastname}`,
          status:
            request.status === "rejected"
              ? "Official Business already rejected"
              : "Official Business already approved",
        });
        continue;
      }

      const conflictingLeave = await Leave.findOne({
        employee: request.employee._id,
        leaveStatus: "rejected",
        $or: [
          { dateFrom: { $gte: request.dateFrom, $lte: request.dateTo } },
          { dateTo: { $gte: request.dateFrom, $lte: request.dateTo } },
          {
            dateFrom: { $lte: request.dateFrom },
            dateTo: { $gte: request.dateTo },
          },
        ],
      });

      if (conflictingLeave) {
        conflictingRequests.push({
          id: request._id,
          employee: `${request.employee.firstname} ${request.employee.lastname}`,
          conflict: `Leave from ${conflictingLeave.dateFrom.toLocaleDateString()} to ${conflictingLeave.dateTo.toLocaleDateString()}`,
        });
      } else {
        validRequests.push(request);
      }
    }

    if (validRequests.length > 0) {
      await OfficialBusiness.updateMany(
        { _id: { $in: validRequests.map((r) => r._id) } },
        {
          status: "rejected",
          rejectedBy: adminId,
          rejectedAt: new Date(),
        }
      );
    }

    return res.status(200).json({
      message: "Bulk rejection completed",
      rejectedCount: validRequests.length,
      conflicted: conflictingRequests,
      alreadyProcessed,
    });
  } catch (error) {
    console.error("Bulk reject error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const bulkapproveOfficialBusiness = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res
      .status(401)
      .json({ message: "Unauthorized, you do not have access to this page" });
  }

  try {
    const { OB_ids } = req.body;
    const adminId = req.user._id;

    if (!Array.isArray(OB_ids) || OB_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "No official business IDs were provided" });
    }

    // Get ALL OBs, not just pending
    const allRequests = await OfficialBusiness.find({
      _id: { $in: OB_ids },
    }).populate("employee", "firstname lastname employeeId");

    if (!allRequests || allRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No Official Business requests found" });
    }

    const alreadyProcessed = [];
    const conflictingRequests = [];
    const validRequests = [];

    for (const request of allRequests) {
      if (request.status === "approved") {
        alreadyProcessed.push({
          id: request._id,
          employee: `${request.employee.firstname} ${request.employee.lastname}`,
          status: "Official Business already approved",
        });
        continue;
      }

      // Check conflicts only for pending requests
      const conflictingLeave = await Leave.findOne({
        employee: request.employee._id,
        leaveStatus: "approved",
        $or: [
          { dateFrom: { $gte: request.dateFrom, $lte: request.dateTo } },
          { dateTo: { $gte: request.dateFrom, $lte: request.dateTo } },
          {
            dateFrom: { $lte: request.dateFrom },
            dateTo: { $gte: request.dateTo },
          },
        ],
      });

      if (conflictingLeave) {
        conflictingRequests.push({
          id: request._id,
          employee: `${request.employee.firstname} ${request.employee.lastname}`,
          conflict: `Leave from ${conflictingLeave.dateFrom.toDateString()} to ${conflictingLeave.dateTo.toDateString()}`,
        });
      } else {
        validRequests.push(request);
      }
    }

    // Approve valid ones
    if (validRequests.length > 0) {
      await OfficialBusiness.updateMany(
        { _id: { $in: validRequests.map((r) => r._id) } },
        {
          status: "approved",
          approvedBy: adminId,
          approvedAt: new Date(),
        }
      );
    }

    return res.status(200).json({
      message: "Bulk approval completed",
      approvedCount: validRequests.length,
      conflicted: conflictingRequests,
      alreadyProcessed, // includes already approved/rejected
    });
  } catch (err) {
    console.error("Bulk approve error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = {
  getAllOfficialBusinesss,
  addAdminOfficialBusiness,
  searchEmployees,
  editOfficialBusiness,
  rejectOfficialBusiness,
  rejectOfficialBusinessbulk,
  bulkapproveOfficialBusiness,
};
