const officialBusinessSchema = require("../../../models/officialbusinessSchema/officialBusinessSchema");
const OfficialBusiness = require("../../../models/officialbusinessSchema/officialBusinessSchema");

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

    await official_B.save();

    res
      .status(200)
      .json({ message: "Successfully created Official Business request!" });
  } catch (error) {
    console.error("Error creating OfficialBusiness:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get ALL official business records for the current user
const getAllOfficialBusiness = async (req, res) => {
  try {
    // Get all official business records for the current user
    const officialBusinessList = await OfficialBusiness.find({ 
      employee: req.user.id 
    })
      .sort({ createdAt: -1 })
      .populate("employee", "employeeId firstname lastname")
      .populate("approvedBy", "firstname lastname") // If you have approval tracking
      .populate("rejectedBy", "firstname lastname"); // If you have rejection tracking

    res.status(200).json({
      success: true,
      data: officialBusinessList,
      count: officialBusinessList.length
    });
  } catch (error) {
    console.error("Error fetching Official Business:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Get a SINGLE official business record by ID
const getOfficialBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const getOB = await OfficialBusiness.findOne({
      _id: id,
      employee: req.user.id // Ensure user can only access their own records
    })
      .populate("employee", "employeeId firstname lastname")
      .populate("approvedBy", "firstname lastname")
      .populate("rejectedBy", "firstname lastname");

    if (!getOB) {
      return res.status(404).json({ 
        success: false,
        message: "Official Business not found or you don't have permission to access it." 
      });
    }

    res.status(200).json({
      success: true,
      data: getOB
    });
  } catch (error) {
    console.error("Error fetching Official Business:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};


module.exports = {
  addOfficialBusiness,
  getOfficialBusiness,
};
