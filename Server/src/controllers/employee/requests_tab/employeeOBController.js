const OfficialBusiness = require("../../../models/officialbusinessSchema/officialBusinessSchema");
const mongoose = require("mongoose");
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
  try {
    const { reason, dateFrom, dateTo } = req.body;

    if (!reason || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const official_B = new OfficialBusiness({
      employee: req.user.id,
      reason,
      dateFrom,
      dateTo,
    });

    const savedOB = await official_B.save();

    // Populate the employee data before sending response
    await savedOB.populate("employee", "employeeId firstname lastname");

    res.status(200).json({
      message: "Successfully created Official Business request!",
      data: savedOB,
    });
  } catch (error) {
    console.error("Error creating OfficialBusiness:", error);
    res.status(500).json({ message: "Internal server error" });
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

  deleteOfficialBusiness,
};
