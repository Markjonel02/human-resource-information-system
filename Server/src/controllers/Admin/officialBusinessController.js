const OfficialBusiness = require("../../models/officialbusinessSchema/officialBusinessSchema");

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

module.exports = {
  getAllOfficialBusinesss,
};
