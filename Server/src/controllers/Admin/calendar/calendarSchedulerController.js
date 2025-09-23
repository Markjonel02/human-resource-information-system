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

const getUpcomingEvents = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ error: "Access denied" });
  }
  try {
    const get_events = await upcomingEvents
      .find()
      .populate("employeeId", "firstname lastname employeeId")
      .sort({ date: 1, time: 1 });

    if (!get_events) {
      return res.status(404).json({ error: "No events found" });
    }
    res.status(200).json(get_events);
  } catch (error) {
    console.log("error", error);
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

module.exports = {
  createUpcomingEvent,
  getUpcomingEvents,
  searchEmployeesAlternative,
};
