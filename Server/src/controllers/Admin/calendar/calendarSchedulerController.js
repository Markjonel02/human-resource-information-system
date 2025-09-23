const upcomingEvents = require("../../../models/calendar/upcomingEvents");

// Create a new upcoming event

const createUpcomingEvent = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { title, date, time, duration, description, type, priority } =
      req.body;

    // Validate required fields
    if (!title || !date || !time) {
      return res
        .status(400)
        .json({ error: "Title, date, and time are required" });
    }

    const event = new upcomingEvents({
      employeeId: req.user._id,
      title,
      date,
      time,
      duration, // will fallback to schema default if not provided
      description,
      type, // will fallback to schema default if not provided
      priority, // will fallback to schema default if not provided
    });

    // Save first
    await event.save();

    // Populate employeeId details (name, email)
    const populatedEvent = await event.populate("employeeId", "name email");

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUpcomingEvent,
};
