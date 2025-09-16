const OfficialBusiness = require("../../../models/officialbusinessSchema/officialBusinessSchema");
const mongoose = require("mongoose");
const Leave = require("../../../models/LeaveSchema/leaveSchema");
// Get ALL official business records for the current user (for table display)
const getAllOfficialBusiness = async (req, res) => {
  try {
    console.log("Getting all OB for user:", req.user.id);

    const officialBusinessList = await OfficialBusiness.find({
      employee: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("employee", "employeeId firstname lastname");

    console.log("Found OB records:", officialBusinessList.length);

    res.status(200).json({
      success: true,
      data: officialBusinessList,
      count: officialBusinessList.length,
    });
  } catch (error) {
    console.error("Error fetching all Official Business:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a SINGLE official business record by ID

// If you still need to get a single OB by ID, create a separate controller:
const getOfficialBusinessById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const getOB = await OfficialBusiness.findOne({
      _id: id,
      employee: req.user.id, // Ensure user can only access their own records
    }).populate("employee", "employeeId firstname lastname");

    if (!getOB) {
      return res.status(404).json({
        success: false,
        message: "Official Business not found.",
      });
    }

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
// GET /officialBusiness/getOB
const getAllOfficialBusinesss = async (req, res) => {
  try {
    const query = req.user.role === "employee" ? { employee: req.user.id } : {}; // Admin/HR can see all

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

// Add official business
const addOfficialBusiness = async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const { reason, dateFrom, dateTo } = req.body;

    if (!reason || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Parse dates
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (start > end) {
      return res.status(400).json({
        message: "dateFrom cannot be later than dateTo.",
      });
    }

    // 🚫 Block if employee has a pending/approved leave in the range
    const conflictingLeave = await Leave.findOne({
      employee: req.user.id, // always use logged-in employee
      leaveStatus: { $in: ["pending", "approved"] },
      dateFrom: { $lte: end },
      dateTo: { $gte: start },
    });

    if (conflictingLeave) {
      return res.status(400).json({
        success: false,
        message: ` ${
          conflictingLeave.leaveStatus
        } leave request from ${conflictingLeave.dateFrom.toDateString()} to ${conflictingLeave.dateTo.toDateString()}.`,
      });
    }

    // 🚫 Block if overlapping OB already exists
    const overlappingOB = await OfficialBusiness.findOne({
      employee: req.user.id,
      dateFrom: { $lte: end },
      dateTo: { $gte: start },
    });

    if (overlappingOB) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an Official Business request within this date range.",
        conflict: overlappingOB,
      });
    }

    // ✅ Create new Official Business request
    const official_B = new OfficialBusiness({
      employee: req.user.id,
      reason,
      dateFrom: start,
      dateTo: end,
      rejectedBy: null,
    });

    const savedOB = await official_B.save();

    await savedOB.populate("employee", "employeeId firstname lastname");

    res.status(201).json({
      success: true,
      message: "Successfully created Official Business request!",
      createdBy: savedOB.employee,
      data: savedOB,
    });
  } catch (error) {
    console.error("Error creating OfficialBusiness:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateOfficialBusiness = async (req, res) => {
  if (req.user.role !== "employee") {
    return res
      .status(401)
      .json({ message: "Unauthorized, you cannot edit these data" });
  }

  try {
    const { id } = req.params;
    const { reason, dateFrom, dateTo } = req.body;

    if (!reason || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const update_OB = await OfficialBusiness.findByIdAndUpdate(
      id, // ✅ use id directly
      { reason, dateFrom, dateTo }, // ✅ update object
      { new: true, runValidators: true }
    );

    if (!update_OB) {
      return res
        .status(404)
        .json({ message: "Error update, Id cannot be found" });
    }

    res.status(200).json({
      message: "Official business successfully updated!",
      data: update_OB,
    });
  } catch (error) {
    console.error("Error updating official business:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Delete official business
const deleteOfficialBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const deletedOB = await OfficialBusiness.findOneAndDelete({
      _id: id,
      employee: req.user.id, // Ensure user can only delete their own records
    });

    if (!deletedOB) {
      return res.status(404).json({
        success: false,
        message:
          "Official Business not found or you don't have permission to delete it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Official Business deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Official Business:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllOfficialBusinesss,
  getOfficialBusinessById,
  addOfficialBusiness,
  updateOfficialBusiness,
  deleteOfficialBusiness,
};
