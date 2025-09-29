const UpcomingEvents = require("../../../models/calendar/upcomingEvents");

// Get upcoming events for an employee (if included in participants or creator)
const getEmployeeUpcomingEvents = async (req, res) => {
  if (
    req.user.role !== "employee" &&
    req.user.role !== "admin" &&
    req.user.role !== "hr"
  ) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const employeeId = req.user._id;
    const today = new Date().toISOString().split("T")[0]; // "2025-09-29"

    const events = await UpcomingEvents.find({
      $and: [
        {
          $or: [
            { employee: employeeId },
            { participants: { $in: [employeeId] } },
            { createdBy: { $exists: true } }, // any admin-created
          ],
        },
        { date: { $gte: today } }, // ✅ string compare works with YYYY-MM-DD
      ],
    })
      .populate("employee", "firstname lastname employeeId")
      .populate("participants", "firstname lastname employeeId")
      .populate("createdBy", "firstname lastname employeeId role")
      .sort({ date: 1, time: 1 });

    if (!events || events.length === 0) {
      return res.status(404).json({ error: "No upcoming events for you" });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error("getEmployeeUpcomingEvents error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getEmployeeUpcomingEvents };
