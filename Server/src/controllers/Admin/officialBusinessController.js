const OfficialBusiness = require("../../models/officialbusinessSchema/officialBusinessSchema");
const User = require("../../models/user");
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

const addAdminOfficialBusiness = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res
      .status(401)
      .json({ message: "Unauthrorize! you cannot access this page" });
  }
  try {
    const { employeeId, dateFrom, dateTo, reason } = req.body;
    const performedBy = req.user ? req.user._id : null;

    const checkempId = await User.findById(employeeId);
    if (!checkempId) {
      return res.status(400).json({ message: "user cannot be fount " });
    }
    const add_OB = {
      employeeId: req.user,
      performedBy,
      reason,
      dateFrom,
      dateTo,
    };

    if (!reason || !dateFrom || dateTo) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const newOb = new OfficialBusiness(add_OB);
    await newOb.save();
    res.status(200).json({ message: "successfully added to " });
  } catch (error) {}
};
module.exports = {
  getAllOfficialBusinesss,
};
