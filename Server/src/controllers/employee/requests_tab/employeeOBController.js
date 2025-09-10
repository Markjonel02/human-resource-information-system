const officialBusinessSchema = require("../../../models/officialbusinessSchema/officialBusinessSchema");
const OfiicialBusiness = require("../../../models/officialbusinessSchema/officialBusinessSchema");

const addofficialBusiness = async (req, res) => {
  try {
    const { reason, dateFrom, dateTo } = req.body;
    if (!reason || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    official_B = new OfiicialBusiness({
      employee: req.user.id,
      reason,
      dateFrom,
      dateTo,
    });

    await official_B.save();
    res.status(200).json({ message: "successfully created OfficialBusiness!" });
  } catch (error) {
    console.error("Error creating OfficialBusiness:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addofficialBusiness,
};
