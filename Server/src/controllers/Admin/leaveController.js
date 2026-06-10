const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const LeaveCredits = require("../../models/LeaveSchema/leaveCreditsSchema");
const Leave = require("../../models/LeaveSchema/leaveSchema");

// =====================
// LEAVE APPROVAL / REJECTION
// =====================

// Single Leave Approval Controller
const approveLeave = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    const { id } = req.params;
    const leaveRecord = await Leave.findById(id).populate("employee");

    if (!leaveRecord)
      return res.status(404).json({ message: "Leave record not found" });

    if (leaveRecord.leaveStatus !== "pending")
      return res.status(400).json({ message: "Already processed." });

    // Calculate days
    let daysToDeduct = leaveRecord.totalLeaveDays;
    if (!daysToDeduct && leaveRecord.dateFrom && leaveRecord.dateTo) {
      const s = new Date(leaveRecord.dateFrom);
      const e = new Date(leaveRecord.dateTo);
      daysToDeduct = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    }
    if (!daysToDeduct)
      return res.status(400).json({ message: "Cannot determine leave days." });

    // Credits check
    const employee = leaveRecord.employee;
    const leaveCredit = await LeaveCredits.findOneAndUpdate(
      { employee: employee._id, year: new Date().getFullYear() },
      {
        $setOnInsert: {
          employee: employee._id,
          year: new Date().getFullYear(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (!leaveCredit) {
      leaveCredit = await LeaveCredits.create({
        employee: employee._id,
        credits: {
          VL: { total: 15, remaining: 15 },
          SL: { total: 15, remaining: 15 },
          BL: { total: 3, remaining: 3 },
          MLPL: { total: 60, remaining: 60 },
          LWOP: { total: 30, remaining: 30 },
        },
      });
    }

    const creditEntry = leaveCredit.credits[leaveRecord.leaveType];
    if (!creditEntry)
      return res
        .status(400)
        .json({ message: "Leave type not found in credits." });

    if (creditEntry.remaining < daysToDeduct)
      return res.status(400).json({ message: "Not enough credits." });

    // Deduct + save
    creditEntry.remaining -= daysToDeduct;
    creditEntry.used += daysToDeduct;

    await leaveCredit.save();

    leaveRecord.leaveStatus = "approved";
    leaveRecord.approvedBy = req.user._id;
    leaveRecord.approvedAt = new Date();
    await leaveRecord.save();

    return res.status(200).json({
      message: "Leave approved successfully.",
      leaveRecord,
    });
  } catch (error) {
    console.error("Error approving leave:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
          "firstname lastname employeeId",
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
          "firstname lastname employeeId",
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

// =====================
// LEAVE CREATION & RETRIEVAL
// =====================

// Create Leave (Admin creating leave for themselves or employees)
const createLeave = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message: "Access denied. Only Admin and HR can create leaves here.",
    });
  }

  try {
    const { employeeId, leaveType, dateFrom, dateTo, notes, leaveStatus } =
      req.body;

    if (!employeeId || !leaveType || !dateFrom || !dateTo) {
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    const User = mongoose.model("user"); // Grab the User model

    // Find the employee by their Object _id OR their custom string employeeId
    const employee = await User.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(employeeId) ? employeeId : null },
        { employeeId: employeeId },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Calculate days
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const totalLeaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Create the leave document
    const newLeave = new Leave({
      employee: employee._id,
      leaveType,
      dateFrom,
      dateTo,
      totalLeaveDays,
      notes,
      leaveStatus: leaveStatus || "pending",
    });

    await newLeave.save();

    res.status(201).json({
      success: true,
      message: "Leave request created successfully.",
      leave: newLeave,
    });
  } catch (error) {
    console.error("Error creating leave:", error);
    res.status(500).json({
      message: "Failed to create leave request",
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

    if (!currentUser || !currentUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const allowedRoles = ["employee", "admin", "hr"];
    if (!allowedRoles.includes(currentUser.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied for this role" });
    }

    const query =
      currentUser.role === "employee" ? { employee: currentUser._id } : {};

    const leaveRecords = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate("employee", "firstname lastname employeeId department");

    if (!Array.isArray(leaveRecords) || leaveRecords.length === 0) {
      return res.status(404).json({ message: "No leave records found." });
    }

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
    const validLeaveTypes = ["BL", "SL", "CL", "VL", "MLPL", "LWOP"];

    const breakdown = await Leave.aggregate([
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
        },
      },
    ]);

    const aggregatedCounts = breakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const leaveCounts = {};
    validLeaveTypes.forEach((type) => {
      // Map it to a cleaner name for the frontend UI boxes
      const cleanType = type.replace(/ request/i, "").trim();
      leaveCounts[cleanType] = aggregatedCounts[type] || 0;
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
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const searchTerm = q.trim();

    // Create search conditions for name, employeeId, and email
    const searchConditions = [
      { firstname: { $regex: searchTerm, $options: "i" } },
      { lastname: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { employeeId: { $regex: searchTerm, $options: "i" } },
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
      if (searchTerm.match(/^[a-fA-F0-9]{24}$/)) {
        searchConditions.push({ _id: searchTerm });
      }
      searchConditions.push({ employeeId: searchTerm });
    }

    // FIX: Get User model properly here
    const User = mongoose.model("user");

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

const searchEmployeesId = async (req, res) => {
  try {
    const { q } = req.query; // 🔎 Captures whatever is typed in the search bar

    if (!q || q.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Query must be at least 3 characters" });
    }

    const searchTerm = q.trim();
    const User = mongoose.model("user");

    // Searches across ID, First Name, Last Name, or Email
    const employees = await User.find({
      $or: [
        { employeeId: { $regex: searchTerm, $options: "i" } },
        { firstname: { $regex: searchTerm, $options: "i" } },
        { lastname: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("_id firstname lastname employeeId department email")
      .limit(10);

    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during search" });
  }
};

module.exports = {
  createLeave, // <--- New Controller Added Here
  searchEmployeesId,
  approveLeave,
  approveLeaveBulk,
  rejectLeave,
  rejectLeaveBulk,
  getAllEmployeeLeave,
  getLeaveBreakdown,
  searchEmployees,
};
