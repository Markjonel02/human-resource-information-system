const UpcomingEvents = require("../../../models/calendar/upcomingEvents");

// Get upcoming events for an employee (if included in participants or creator)
const getEmployeeUpcomingEvents = async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const employeeId = req.user._id; // assuming JWT middleware sets req.user._id

    const events = await UpcomingEvents.find({
      $or: [
        { employee: employeeId }, // events created by employee
        { participants: { $in: [employeeId] } }, // events where employee is a participant
      ],
    })
      .populate("employee", "firstname lastname employeeId")
      .populate("participants", "firstname lastname employeeId")
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
