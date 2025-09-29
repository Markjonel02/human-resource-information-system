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
    const today = new Date().setHours(0, 0, 0, 0);

    const events = await UpcomingEvents.find({
      done: false, // exclude completed
      date: { $gte: today }, // only future + today
      $or: [
        { employee: employeeId }, // created by employee
        { participants: { $in: [employeeId] } }, // participant
        { createdBy: { $ne: employeeId } }, // admin/others created
      ],
    })
      .populate("employee", "firstname lastname employeeId")
      .populate("participants", "firstname lastname employeeId")
      .populate("createdBy", "firstname lastname employeeId")
      .populate("markDoneBy", "firstname lastname employeeId")
      .sort({ date: 1, time: 1 });

    if (!events || events.length === 0) {
      return res.status(404).json({ error: "No upcoming events for you" });
    }

    // Format response so markDoneBy is clear
    const formatted = events.map((event) => ({
      _id: event._id,
      title: event.title,
      date: event.date,
      time: event.time,
      endDate: event.endDate,
      type: event.type,
      priority: event.priority,
      done: event.done,
      description: event.description,
      employee: event.employee,
      participants: event.participants,
      createdBy: event.createdBy,
      markDoneBy: event.markDoneBy
        ? {
            id: event.markDoneBy._id,
            name: `${event.markDoneBy.firstname} ${event.markDoneBy.lastname}`,
            employeeId: event.markDoneBy.employeeId,
          }
        : null,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("getEmployeeUpcomingEvents error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getEmployeeUpcomingEvents };
