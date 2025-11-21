const Schedule = require("../../models/scheduleDtrModel");

/**
 * Get current user's work schedule for a specific month
 * @route GET /api/schedule/my-schedule
 * @query {number} year - Year (default: current year)
 * @query {number} month - Month (1-12, default: current month)
 */
exports.getMySchedule = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { year, month } = req.query;

    // Default to current year and month if not provided
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Validate month
    if (targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Must be between 1 and 12",
      });
    }

    // Calculate start and end dates for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Fetch schedule records for the specified month
    const scheduleRecords = await Schedule.find({
      employee: userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ date: 1 })
      .lean();

    // Format the records for calendar display
    const formattedSchedules = scheduleRecords.map((schedule) => {
      const date = new Date(schedule.date);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

      // Format schedule times (assuming they're stored as strings like "08:00" or Date objects)
      let scheduleIn = schedule.scheduleIn;
      let scheduleOut = schedule.scheduleOut;

      // If scheduleIn/Out are Date objects, format them to time strings
      if (schedule.scheduleIn instanceof Date) {
        scheduleIn = schedule.scheduleIn.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
      if (schedule.scheduleOut instanceof Date) {
        scheduleOut = schedule.scheduleOut.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      return {
        date: date.toISOString().split("T")[0], // YYYY-MM-DD format
        day: dayOfWeek,
        scheduleIn: scheduleIn || "00:00",
        scheduleOut: scheduleOut || "00:00",
        isRestDay: schedule.isRestDay || false,
        shiftType: schedule.shiftType || "Regular",
      };
    });

    // Calculate summary statistics
    const summary = {
      totalDays: formattedSchedules.length,
      workDays: formattedSchedules.filter((s) => !s.isRestDay).length,
      restDays: formattedSchedules.filter((s) => s.isRestDay).length,
    };

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        schedules: formattedSchedules,
        summary: summary,
      },
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching work schedule",
      error: error.message,
    });
  }
};

/**
 * Get schedule for a specific date
 * @route GET /api/schedule/my-schedule/:date
 * @param {string} date - Date in YYYY-MM-DD format
 */
exports.getMyScheduleByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Parse the date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Set time to start and end of day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const schedule = await Schedule.findOne({
      employee: userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean();

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "No schedule found for this date",
      });
    }

    // Format schedule times
    let scheduleIn = schedule.scheduleIn;
    let scheduleOut = schedule.scheduleOut;

    if (schedule.scheduleIn instanceof Date) {
      scheduleIn = schedule.scheduleIn.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    if (schedule.scheduleOut instanceof Date) {
      scheduleOut = schedule.scheduleOut.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    const formattedSchedule = {
      date: schedule.date,
      day: new Date(schedule.date).toLocaleDateString("en-US", {
        weekday: "long",
      }),
      scheduleIn: scheduleIn || "00:00",
      scheduleOut: scheduleOut || "00:00",
      isRestDay: schedule.isRestDay || false,
      shiftType: schedule.shiftType || "Regular",
    };

    res.status(200).json({
      success: true,
      data: formattedSchedule,
    });
  } catch (error) {
    console.error("Error fetching schedule by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching schedule",
      error: error.message,
    });
  }
};

/**
 * Get schedule for a date range
 * @route GET /api/schedule/my-schedule-range
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 */
exports.getMyScheduleRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before or equal to end date",
      });
    }

    // Set time boundaries
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const scheduleRecords = await Schedule.find({
      employee: userId,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .sort({ date: 1 })
      .lean();

    // Format records
    const formattedSchedules = scheduleRecords.map((schedule) => {
      const date = new Date(schedule.date);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

      let scheduleIn = schedule.scheduleIn;
      let scheduleOut = schedule.scheduleOut;

      if (schedule.scheduleIn instanceof Date) {
        scheduleIn = schedule.scheduleIn.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
      if (schedule.scheduleOut instanceof Date) {
        scheduleOut = schedule.scheduleOut.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      return {
        date: date.toISOString().split("T")[0],
        day: dayOfWeek,
        scheduleIn: scheduleIn || "00:00",
        scheduleOut: scheduleOut || "00:00",
        isRestDay: schedule.isRestDay || false,
        shiftType: schedule.shiftType || "Regular",
      };
    });

    // Calculate summary
    const summary = {
      dateRange: {
        from: startDate,
        to: endDate,
      },
      totalDays: formattedSchedules.length,
      workDays: formattedSchedules.filter((s) => !s.isRestDay).length,
      restDays: formattedSchedules.filter((s) => s.isRestDay).length,
    };

    res.status(200).json({
      success: true,
      data: {
        schedules: formattedSchedules,
        summary: summary,
      },
    });
  } catch (error) {
    console.error("Error fetching schedule range:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching schedule range",
      error: error.message,
    });
  }
};
