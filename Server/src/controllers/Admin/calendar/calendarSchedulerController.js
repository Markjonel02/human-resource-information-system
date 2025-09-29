const upcomingEvents = require("../../../models/calendar/upcomingEvents");
const User = require("../../../models/user");
const mongoose = require("mongoose");
const Leave = require("../../../models/LeaveSchema/leaveSchema");

// Create a new upcoming event

const createUpcomingEvent = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const {
      title,
      date,
      time,
      duration,
      description,
      type,
      priority,
      participants,
    } = req.body;

    const adminId = req.user._id;

    // Validate required fields
    if (!title || !date || !time) {
      return res
        .status(400)
        .json({ error: "Title, date, and time are required" });
    }

    // Validate participants
    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "At least one participant is required" });
    }

    // Create new event
    const event = new upcomingEvents({
      createdBy: adminId,
      participants, // array of employee IDs
      title,
      date,
      time,
      duration,
      description,
      type,
      priority,
    });

    await event.save();

    // ✅ Re-fetch with population (cleaner than execPopulate in Mongoose 6+)
    const populatedEvent = await upcomingEvents
      .findById(event._id)
      .populate("participants", "firstname lastname employeeId")
      .populate("createdBy", "firstname lastname employeeId");

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUpcomingEvents = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const get_events = await upcomingEvents
      .find()
      .populate("employee", "firstname lastname employeeId")
      .populate("participants", "firstname lastname employeeId")
      .sort({ date: 1, time: 1 });

    if (!get_events || get_events.length === 0) {
      return res.status(404).json({ error: "No events found" });
    }

    res.status(200).json(get_events);
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ error: error.message });
  }
};

const searchEmployeesAlternative = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const searchTerm = q.trim();

    // Build dynamic search query
    let searchQuery = {
      $or: [
        { firstname: { $regex: searchTerm, $options: "i" } },
        { lastname: { $regex: searchTerm, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$firstname", " ", { $ifNull: ["$lastname", ""] }],
              },
              regex: searchTerm,
              options: "i",
            },
          },
        },
      ],
    };

    // Check if search term could be an ID
    const isNumeric = /^\d+$/.test(searchTerm);
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(searchTerm);

    if (isNumeric) {
      searchQuery.$or.push({ employeeId: searchTerm });
      searchQuery.$or.push({
        employeeId: { $regex: searchTerm, $options: "i" },
      });
    }

    if (isObjectId) {
      try {
        searchQuery.$or.push({ _id: mongoose.Types.ObjectId(searchTerm) });
      } catch (err) {
        // Invalid ObjectId, skip
      }
    }

    // Step 1: find employees
    const employees = await User.find(searchQuery)
      .select("_id firstname lastname employeeId department email")
      .limit(10)
      .lean();

    // Step 2: check leave status for each employee
    const today = new Date();

    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const leave = await Leave.findOne({
          employee: emp._id,
          leaveStatus: { $in: ["pending", "approved"] },
          dateFrom: { $lte: today },
          dateTo: { $gte: today },
        })
          .select("leaveType leaveStatus dateFrom dateTo")
          .lean();

        if (leave) {
          emp.leaveMessage =
            leave.leaveStatus === "pending"
              ? `This person has a pending ${leave.leaveType} leave request`
              : `This person is currently on ${leave.leaveType} leave`;
        } else {
          emp.leaveMessage = null;
        }

        return emp;
      })
    );

    res.status(200).json(enrichedEmployees);
  } catch (error) {
    console.error("Error searching employees:", error);
    res.status(500).json({
      message: "Failed to search employees",
      error: error.message,
    });
  }
};

const updateUpcomingEvent = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { eventId } = req.params;
    const {
      title,
      date,
      time,
      duration,
      description,
      type,
      priority,
      participants,
    } = req.body;

    // 🔹 Validate ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    // 🔹 Find existing event
    const event = await upcomingEvents.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 🔹 Validate required fields
    if (!title || !date || !time) {
      return res
        .status(400)
        .json({ error: "Title, date, and time are required" });
    }

    // 🔹 Validate participants (array of IDs) - Optional since schema doesn't require it
    if (
      participants &&
      (!Array.isArray(participants) || participants.length === 0)
    ) {
      return res
        .status(400)
        .json({ error: "Participants must be a non-empty array if provided" });
    }

    // Convert dates for duration-based validation
    const eventStart = new Date(`${date}T${time}`);
    const eventDuration = duration || 60; // Default 60 minutes
    const eventEnd = new Date(eventStart.getTime() + eventDuration * 60000);

    // 🔹 Check if participants have pending/approved leave overlapping event (only if participants provided)
    if (participants && participants.length > 0) {
      const leaves = await Leave.find({
        employee: { $in: participants },
        leaveStatus: { $in: ["pending", "approved"] },
        dateFrom: { $lte: eventEnd },
        dateTo: { $gte: eventStart },
      });

      if (leaves.length > 0) {
        return res.status(400).json({
          error:
            "One or more participants have pending/approved leave during this event period",
          conflictLeaves: leaves,
        });
      }
    }

    // 🔹 Check if participants already have another event on same date/time (only if participants provided)
    if (participants && participants.length > 0) {
      const conflicts = await upcomingEvents.findOne({
        _id: { $ne: eventId }, // exclude current event
        participants: { $in: participants },
        date: date, // Same date
        $or: [
          {
            // Check if times overlap
            $expr: {
              $and: [
                {
                  $lte: [
                    {
                      $dateFromString: {
                        dateString: { $concat: ["$date", "T", "$time"] },
                      },
                    },
                    eventEnd,
                  ],
                },
                {
                  $gte: [
                    {
                      $add: [
                        {
                          $dateFromString: {
                            dateString: { $concat: ["$date", "T", "$time"] },
                          },
                        },
                        { $multiply: [{ $ifNull: ["$duration", 60] }, 60000] },
                      ],
                    },
                    eventStart,
                  ],
                },
              ],
            },
          },
        ],
      });

      if (conflicts) {
        return res.status(400).json({
          error:
            "One or more participants already have another event during this time period",
          conflictEvent: conflicts,
        });
      }
    }

    // 🔹 Validate enum values
    if (type && !["meeting", "call", "review", "task"].includes(type)) {
      return res.status(400).json({
        error: "Invalid type. Must be one of: meeting, call, review, task",
      });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        error: "Invalid priority. Must be one of: low, medium, high",
      });
    }

    // 🔹 Update only the fields that exist in the schema
    event.title = title;
    event.date = date;
    event.time = time;
    if (duration !== undefined) event.duration = duration;
    if (description !== undefined) event.description = description;
    if (type !== undefined) event.type = type;
    if (priority !== undefined) event.priority = priority;
    if (participants !== undefined) event.participants = participants;

    // 🔹 Save updated event
    await event.save();

    // 🔹 Populate participants and employee with consistent field selection
    const updatedEvent = await upcomingEvents
      .findById(eventId)
      .populate("participants", "firstname lastname employeeId email")
      .populate("employee", "firstname lastname employeeId email")
      .populate("createdBy", "firstname lastname employeeId email");

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: error.message });
  }
};

const delteUpcomingEvent = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ error: "Access denied" });
  }
  try {
    const { eventId } = req.params;
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    } // Find existing event
    const event = await upcomingEvents.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ error: error.message });
  }
};

const markAsDone = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { eventId } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    // Update the event
    const event = await upcomingEvents.findByIdAndUpdate(
      eventId,
      {
        done: true,
        markDoneBy: req.user._id,
        markDoneAt: new Date(),
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({
      message: "Event marked as done",
      event,
    });
  } catch (error) {
    console.error("Error marking event as done:", error);
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createUpcomingEvent,
  getUpcomingEvents,
  searchEmployeesAlternative,
  updateUpcomingEvent,
  delteUpcomingEvent,
  markAsDone,
};
