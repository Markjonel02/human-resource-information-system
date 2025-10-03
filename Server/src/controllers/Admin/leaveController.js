
const LeaveCredits = require("../../models/LeaveSchema/leaveCreditsSchema");
const Leave = require("../../models/LeaveSchema/leaveSchema");




// Single Leave Approval Controller
const approveLeave = async (req, res) => {
  // 1. Authorization: Only allow admins to approve leave requests.
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message: "Access denied. Only Admin users can approve leave requests.",
    });
  }

  try {
    const { id } = req.params;

    // 2. Find the leave record and populate the employee details.
    // The .populate() method is crucial to access the employee's ID later.
    const leaveRecord = await Leave.findById(id).populate("employee");

    // 3. Handle case where the leave record is not found.
    if (!leaveRecord) {
      return res.status(404).json({ message: "Leave record not found" });
    }

    // 4. Validate the leave status. We can only approve pending requests.
    if (leaveRecord.leaveStatus !== "pending") {
      return res.status(400).json({
        message: "This leave request has already been processed.",
      });
    }

    // 5. Calculate the total number of days to deduct from the credits.
    let daysToDeduct = 0;
    if (leaveRecord.totalLeaveDays) {
      daysToDeduct = leaveRecord.totalLeaveDays;
    } else if (leaveRecord.dateFrom && leaveRecord.dateTo) {
      const dateFrom = new Date(leaveRecord.dateFrom);
      const dateTo = new Date(leaveRecord.dateTo);
      daysToDeduct = Math.ceil((dateTo - dateFrom) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      return res.status(400).json({
        message: "Cannot determine the number of leave days from the record.",
      });
    }

    // 6. Find the employee's leave credit record.
    const employee = leaveRecord.employee;
    const leaveCredit = await LeaveCredits.findOne({ employee: employee._id });

    // 7. Handle case where the employee's credit record is not found.
    if (!employee || !leaveCredit) {
      return res.status(404).json({
        message: "Employee or leave credit record not found.",
      });
    }

    // 8. Use standard bracket notation to check for the leave type.
    if (!leaveCredit.credits[leaveRecord.leaveType]) {
      return res.status(400).json({
        message: "Leave type not found in employee's credits.",
      });
    }

    // 9. Find the specific leave type (e.g., 'VL', 'SL') within the credits object.
    const currentCredit = leaveCredit.credits[leaveRecord.leaveType];

    // 10. Check if the employee has enough remaining credits.
    if (currentCredit.remaining < daysToDeduct) {
      return res.status(400).json({
        message: `Not enough ${leaveRecord.leaveType} credits to approve this request.`,
      });
    }

    // 11. Subtract the total days from the remaining credits.
    leaveCredit.credits[leaveRecord.leaveType].remaining -= daysToDeduct;

    // 12. Save the updated leave credit document to the database.
    await leaveCredit.save();

    // 13. Update the status of the leave request to 'approved'.
    leaveRecord.leaveStatus = "approved";
    leaveRecord.status = "on_leave";

    // 14. Save the updated leave record.
    await leaveRecord.save();

    // 15. Log the approval action for audit trail purposes.
    const rejectLeave = async (req, res) => {
      if (req.user.role !== "admin" && req.user.role !== "hr") {
        return res.status(403).json({
          message: "Access denied. Only Admin users can reject leave requests.",
        });
      }

      try {
        const { id } = req.params;
        const leaveRecord = await Leave.findById(id).populate("employee");

        if (!leaveRecord) {
          return res.status(404).json({ message: "Leave record not found" });
        }

        if (leaveRecord.leaveStatus !== "pending") {
          return res.status(400).json({
            message: "This leave request has already been processed.",
          });
        }

        leaveRecord.leaveStatus = "rejected";
        await leaveRecord.save();

       /*  await createAttendanceLog({
          employeeId: leaveRecord.employee._id,
          attendanceId: leaveRecord._id,
          action: "LEAVE_REJECTED",
          description: `Leave rejected by admin (${req.user.firstname} ${req.user.lastname})`,
          performedBy: req.user._id,
          changes: {
            leaveStatus: { from: "pending", to: "rejected" },
          },
          metadata: {
            rejectedBy: `${req.user.firstname} ${req.user.lastname}`,
            leaveType: leaveRecord.leaveType,
            dateFrom: leaveRecord.dateFrom,
            dateTo: leaveRecord.dateTo,
          },
        }); */

        res.json({
          message: "Leave rejected successfully.",
          leaveRecord,
        });
      } catch (error) {
        console.error("Error rejecting leave:", error);
        res.status(500).json({
          message: "Internal server error",
          error: error.message,
        });
      }
    };

    // 16. Send a success response.
    res.status(200).json({
      message: "Leave approved successfully and credits updated.",
      leaveRecord,
    });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Bulk Leave Approval Controller
const approveLeaveBulk = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only Admin and HR users can approve leave requests.",
    });
  }

  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Please provide an array of leave request IDs.",
      });
    }

    const approvedLeaves = [];
    const errors = [];

    for (const id of ids) {
      try {
        const leaveRecord = await Leave.findById(id).populate(
          "employee",
          "firstname lastname employeeId"
        );

        if (!leaveRecord) {
          errors.push({ id, error: "Leave record not found" });
          continue;
        }

        if (leaveRecord.leaveStatus !== "pending") {
          errors.push({ id, error: "Leave request already processed" });
          continue;
        }

        // Calculate leave days
        let daysToDeduct = leaveRecord.totalLeaveDays;
        if (!daysToDeduct && leaveRecord.dateFrom && leaveRecord.dateTo) {
          const dateFrom = new Date(leaveRecord.dateFrom);
          const dateTo = new Date(leaveRecord.dateTo);
          daysToDeduct =
            Math.ceil((dateTo - dateFrom) / (1000 * 60 * 60 * 24)) + 1;
        }

        if (!daysToDeduct || daysToDeduct <= 0) {
          errors.push({ id, error: "Invalid leave duration" });
          continue;
        }

        const employee = leaveRecord.employee;
        const leaveCredit = await LeaveCredits.findOne({
          employee: employee._id,
        });

        if (!employee || !leaveCredit) {
          errors.push({
            id,
            error: "Employee or leave credit record not found",
          });
          continue;
        }

        const creditEntry = leaveCredit.credits[leaveRecord.leaveType];
        if (!creditEntry) {
          errors.push({
            id,
            error: "Leave type not found in employee's credits",
          });
          continue;
        }

        if (creditEntry.remaining < daysToDeduct) {
          errors.push({ id, error: "Not enough leave credits" });
          continue;
        }

        // Deduct credits
        creditEntry.remaining -= daysToDeduct;
        await leaveCredit.save();

        // Update leave record
        leaveRecord.leaveStatus = "approved";
        leaveRecord.approvedBy = req.user._id;
        leaveRecord.approvedAt = new Date();
        await leaveRecord.save();
        await leaveRecord.populate(
          "approvedBy",
          "firstname lastname employeeId"
        );

        approvedLeaves.push({
          id,
          employeeName: `${employee.firstname} ${employee.lastname}`,
          approvedBy: `${leaveRecord.approvedBy.firstname} ${leaveRecord.approvedBy.lastname}`,
        });
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk approval completed. ${approvedLeaves.length} approved, ${errors.length} failed.`,
      approved: approvedLeaves,
      errors: errors,
    });
  } catch (error) {
    console.error("Error bulk approving leaves:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reject Leave Controller
const rejectLeave = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only Admin and HR users can reject leave requests.",
    });
  }

  try {
    const { id } = req.params;
    const leaveRecord = await Leave.findById(id).populate("employee");

    if (!leaveRecord) {
      return res.status(404).json({ message: "Leave record not found" });
    }

    if (leaveRecord.leaveStatus !== "pending") {
      return res
        .status(400)
        .json({ message: "This leave request has already been processed." });
    }

    leaveRecord.leaveStatus = "rejected";
    leaveRecord.rejectedBy = req.user._id;
    leaveRecord.rejectedAt = new Date();

    await leaveRecord.save();
    await leaveRecord.populate("rejectedBy", "firstname lastname employeeId");
    // Log rejection in attendance
    /*   await createAttendanceLog({
      employeeId: leaveRecord.employee._id,
      attendanceId: leaveRecord._id,
      action: "LEAVE_REJECTED",
      description: `Leave rejected by ${req.user.firstname} ${req.user.lastname}`,
      performedBy: req.user._id,
      changes: {
        leaveStatus: { from: "pending", to: "rejected" },
      },
      metadata: {
        rejectedBy: req.user.firstname + " " + req.user.lastname,
        date: new Date(),
        leaveType: leaveRecord.leaveType,
        dateFrom: leaveRecord.dateFrom || "",
        dateTo: leaveRecord.dateTo || "",
      },
    }); */

    res.json({
      success: true,
      message: "Leave rejected successfully.",
      leaveRecord,
    });
  } catch (error) {
    console.error("Error rejecting leave:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Bulk Reject Leave Controller
const rejectLeaveBulk = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only Admin and HR users can reject leave requests.",
    });
  }

  try {
    const { ids, reason } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Please provide an array of leave request IDs.",
      });
    }

    const rejectedLeaves = [];
    const errors = [];

    // Process each leave request
    for (const id of ids) {
      try {
        const leaveRecord = await Leave.findById(id).populate("employee");
        if (!leaveRecord) {
          errors.push({ id, error: "Leave record not found" });
          continue;
        }

        if (leaveRecord.leaveStatus !== "pending") {
          errors.push({ id, error: "Leave request already processed" });
          continue;
        }

        // Update status
        leaveRecord.leaveStatus = "rejected";
        leaveRecord.status = "present";
        leaveRecord.rejectedBy = req.user._id;
        leaveRecord.rejectedAt = new Date();
        if (reason) {
          leaveRecord.rejectionReason = reason;
        }
        await leaveRecord.save();
        await LeaveRecord.populate("rejectedBy firstname lastname employeeId");

        // Log the action
        /*   await createAttendanceLog({
          employeeId: leaveRecord.employee._id,
          attendanceId: leaveRecord._id,
          action: "LEAVE_REJECTED_BULK",
          description: `Leave bulk rejected by admin (${req.user.firstname} ${req.user.lastname})`,
          performedBy: req.user._id,
          changes: {
            leaveStatus: { from: "pending", to: "rejected" },
          },
          metadata: {
            rejectedBy: req.user.firstname + " " + req.user.lastname,
            bulkOperation: true,
            rejectionReason: reason || "No reason provided",
          },
        }); */

        rejectedLeaves.push({
          id,
          employeeName: `${leaveRecord.employee.firstname} ${leaveRecord.employee.lastname}`,
        });
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    res.json({
      message: `Bulk rejection completed. ${rejectedLeaves.length} rejected, ${errors.length} failed.`,
      rejected: rejectedLeaves,
      errors: errors,
    });
  } catch (error) {
    console.error("Error bulk rejecting leaves:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getAllEmployeeLeave = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only Admin and HR users can view leave requests.",
    });
  }
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
      currentUser.role === "employee" ? { employee: currentUser._id } : {}; // Admins can view all leave records

    // Step 4: Fetch leave records
    const leaveRecords = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate("employee", "firstname lastname employeeId department");

    // Step 5: Handle empty results
    if (!Array.isArray(leaveRecords) || leaveRecords.length === 0) {
      return res.status(404).json({ message: "No leave records found." });
    }

    // Step 6: Return results
    res.status(200).json(leaveRecords);
  } catch (error) {
    console.error("Error in getEmployeeLeave:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getLeaveBreakdown = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only Admin and HR users can view leave breakdown.",
    });
  }
  try {
    // Define all valid leave types
    const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "CL"];

    // Aggregate leave counts from the database
    const breakdown = await Leave.aggregate([
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation result to a map
    const aggregatedCounts = breakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Ensure all leave types are represented
    const leaveCounts = {};
    validLeaveTypes.forEach((type) => {
      leaveCounts[type] = aggregatedCounts[type] || 0;
    });

    res.status(200).json(leaveCounts);
  } catch (error) {
    console.error("Error fetching leave breakdown:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const searchEmployees = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res
      .status(401)
      .json({ message: "Unauthorized! You cannot access this resource." });
  }

  try {
    const { q } = req.query; // q is the search query

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const searchTerm = q.trim();

    // Create search conditions for name, employeeId, and email
    const searchConditions = [
      // Search by first name
      { firstname: { $regex: searchTerm, $options: "i" } },

      // Search by last name
      { lastname: { $regex: searchTerm, $options: "i" } },

      // Search by email
      { email: { $regex: searchTerm, $options: "i" } },

      // Search by employeeId (string match or partial)
      { employeeId: { $regex: searchTerm, $options: "i" } },

      // Search by full name (firstname + lastname)
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

    // If the search term looks like a MongoDB ObjectId or numeric ID
    if (searchTerm.match(/^[a-fA-F0-9]{24}$/) || searchTerm.match(/^\d+$/)) {
      // Add exact ObjectId search
      if (searchTerm.match(/^[a-fA-F0-9]{24}$/)) {
        searchConditions.push({ _id: searchTerm });
      }

      // Add exact employeeId search
      searchConditions.push({ employeeId: searchTerm });
    }

    // Execute search
    const employees = await User.find({
      $or: searchConditions,
    })
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

module.exports = {
    approveLeave,
    approveLeaveBulk,
    rejectLeave,
    rejectLeaveBulk,
    getAllEmployeeLeave,
    getLeaveBreakdown,
    searchEmployees,
};