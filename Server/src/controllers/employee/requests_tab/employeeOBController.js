const officialBusinessSchema = require("../../../models/officialbusinessSchema/officialBusinessSchema");
const OfiicialBusiness = require("../../../models/officialbusinessSchema/officialBusinessSchema");

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

const getOfficialBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const getOB = await OfiicialBusiness.findById(id)
      .sort({ createdAt: -1 })
      .populate("employee", "employeeId firstname");

    if (!getOB) {
      return res.status(404).json({ message: "No Official Business found." });
    }

    res.status(200).json(getOB);
  } catch (error) {
    console.error("Error fetching Official Business:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  addOfficialBusiness,
  getOfficialBusiness,
};
