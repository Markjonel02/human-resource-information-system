const Schedule = require("../../models/scheduleDtrModel");

// Philippine Holidays for 2024-2026
const PHILIPPINE_HOLIDAYS = {
  2024: [
    { date: "2024-01-01", name: "New Year's Day", type: "Regular" },
    { date: "2024-02-10", name: "Lunar New Year", type: "Special Non-Working" },
    {
      date: "2024-02-25",
      name: "EDSA People Power Revolution",
      type: "Special Non-Working",
    },
    { date: "2024-03-28", name: "Maundy Thursday", type: "Regular" },
    { date: "2024-03-29", name: "Good Friday", type: "Regular" },
    { date: "2024-03-30", name: "Black Saturday", type: "Special Non-Working" },
    { date: "2024-04-09", name: "Araw ng Kagitingan", type: "Regular" },
    { date: "2024-04-10", name: "Eid'l Fitr", type: "Regular" },
    { date: "2024-05-01", name: "Labor Day", type: "Regular" },
    { date: "2024-06-12", name: "Independence Day", type: "Regular" },
    { date: "2024-06-17", name: "Eid'l Adha", type: "Regular" },
    {
      date: "2024-08-21",
      name: "Ninoy Aquino Day",
      type: "Special Non-Working",
    },
    { date: "2024-08-26", name: "National Heroes Day", type: "Regular" },
    {
      date: "2024-11-01",
      name: "All Saints' Day",
      type: "Special Non-Working",
    },
    { date: "2024-11-02", name: "All Souls' Day", type: "Special Non-Working" },
    { date: "2024-11-30", name: "Bonifacio Day", type: "Regular" },
    {
      date: "2024-12-08",
      name: "Feast of the Immaculate Conception",
      type: "Special Non-Working",
    },
    { date: "2024-12-24", name: "Christmas Eve", type: "Special Non-Working" },
    { date: "2024-12-25", name: "Christmas Day", type: "Regular" },
    { date: "2024-12-30", name: "Rizal Day", type: "Regular" },
    { date: "2024-12-31", name: "New Year's Eve", type: "Special Non-Working" },
  ],
  2025: [
    { date: "2025-01-01", name: "New Year's Day", type: "Regular" },
    { date: "2025-01-29", name: "Lunar New Year", type: "Special Non-Working" },
    {
      date: "2025-02-25",
      name: "EDSA People Power Revolution",
      type: "Special Non-Working",
    },
    { date: "2025-03-31", name: "Eid'l Fitr", type: "Regular" },
    { date: "2025-04-09", name: "Araw ng Kagitingan", type: "Regular" },
    { date: "2025-04-17", name: "Maundy Thursday", type: "Regular" },
    { date: "2025-04-18", name: "Good Friday", type: "Regular" },
    { date: "2025-04-19", name: "Black Saturday", type: "Special Non-Working" },
    { date: "2025-05-01", name: "Labor Day", type: "Regular" },
    { date: "2025-06-06", name: "Eid'l Adha", type: "Regular" },
    { date: "2025-06-12", name: "Independence Day", type: "Regular" },
    {
      date: "2025-08-21",
      name: "Ninoy Aquino Day",
      type: "Special Non-Working",
    },
    { date: "2025-08-25", name: "National Heroes Day", type: "Regular" },
    {
      date: "2025-11-01",
      name: "All Saints' Day",
      type: "Special Non-Working",
    },
    { date: "2025-11-02", name: "All Souls' Day", type: "Special Non-Working" },
    { date: "2025-11-30", name: "Bonifacio Day", type: "Regular" },
    {
      date: "2025-12-08",
      name: "Feast of the Immaculate Conception",
      type: "Special Non-Working",
    },
    { date: "2025-12-24", name: "Christmas Eve", type: "Special Non-Working" },
    { date: "2025-12-25", name: "Christmas Day", type: "Regular" },
    { date: "2025-12-30", name: "Rizal Day", type: "Regular" },
    { date: "2025-12-31", name: "New Year's Eve", type: "Special Non-Working" },
  ],
  2026: [
    { date: "2026-01-01", name: "New Year's Day", type: "Regular" },
    { date: "2026-02-17", name: "Lunar New Year", type: "Special Non-Working" },
    {
      date: "2026-02-25",
      name: "EDSA People Power Revolution",
      type: "Special Non-Working",
    },
    { date: "2026-03-20", name: "Eid'l Fitr", type: "Regular" },
    { date: "2026-04-02", name: "Maundy Thursday", type: "Regular" },
    { date: "2026-04-03", name: "Good Friday", type: "Regular" },
    { date: "2026-04-04", name: "Black Saturday", type: "Special Non-Working" },
    { date: "2026-04-09", name: "Araw ng Kagitingan", type: "Regular" },
    { date: "2026-05-01", name: "Labor Day", type: "Regular" },
    { date: "2026-05-27", name: "Eid'l Adha", type: "Regular" },
    { date: "2026-06-12", name: "Independence Day", type: "Regular" },
    {
      date: "2026-08-21",
      name: "Ninoy Aquino Day",
      type: "Special Non-Working",
    },
    { date: "2026-08-31", name: "National Heroes Day", type: "Regular" },
    {
      date: "2026-11-01",
      name: "All Saints' Day",
      type: "Special Non-Working",
    },
    { date: "2026-11-02", name: "All Souls' Day", type: "Special Non-Working" },
    { date: "2026-11-30", name: "Bonifacio Day", type: "Regular" },
    {
      date: "2026-12-08",
      name: "Feast of the Immaculate Conception",
      type: "Special Non-Working",
    },
    { date: "2026-12-24", name: "Christmas Eve", type: "Special Non-Working" },
    { date: "2026-12-25", name: "Christmas Day", type: "Regular" },
    { date: "2026-12-30", name: "Rizal Day", type: "Regular" },
    { date: "2026-12-31", name: "New Year's Eve", type: "Special Non-Working" },
  ],
};

// Helper function to get holiday by date
const getHolidayByDate = (dateString, year) => {
  const holidays = PHILIPPINE_HOLIDAYS[year] || [];
  return holidays.find((h) => h.date === dateString);
};

// Helper function to check if date is weekend
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

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

    // Create a map of existing schedules by date
    const scheduleMap = {};
    scheduleRecords.forEach((schedule) => {
      const dateKey = new Date(schedule.date).toISOString().split("T")[0];
      scheduleMap[dateKey] = schedule;
    });

    // Generate all days of the month with schedules
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const formattedSchedules = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth - 1, day);
      const dateString = date.toISOString().split("T")[0];
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

      // Check if it's a weekend
      const isWeekendDay = isWeekend(date);

      // Check if it's a holiday
      const holiday = getHolidayByDate(dateString, targetYear);

      // Get existing schedule or create default
      const existingSchedule = scheduleMap[dateString];

      let scheduleIn,
        scheduleOut,
        isRestDay,
        shiftType,
        holidayInfo = null;

      if (existingSchedule) {
        // Use existing schedule from database
        scheduleIn = existingSchedule.scheduleIn;
        scheduleOut = existingSchedule.scheduleOut;
        isRestDay = existingSchedule.isRestDay;
        shiftType = existingSchedule.shiftType;

        // Format if Date objects
        if (existingSchedule.scheduleIn instanceof Date) {
          scheduleIn = existingSchedule.scheduleIn.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
        if (existingSchedule.scheduleOut instanceof Date) {
          scheduleOut = existingSchedule.scheduleOut.toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }
          );
        }
      } else {
        // Generate default schedule
        if (isWeekendDay) {
          scheduleIn = "00:00";
          scheduleOut = "00:00";
          isRestDay = true;
          shiftType = "Rest Day";
        } else if (holiday) {
          scheduleIn = "00:00";
          scheduleOut = "00:00";
          isRestDay = true;
          shiftType = "Holiday";
          holidayInfo = {
            name: holiday.name,
            type: holiday.type,
          };
        } else {
          // Regular working day
          scheduleIn = "08:00";
          scheduleOut = "17:00";
          isRestDay = false;
          shiftType = "Regular";
        }
      }

      // Add holiday info if it exists
      if (holiday && !holidayInfo) {
        holidayInfo = {
          name: holiday.name,
          type: holiday.type,
        };
      }

      formattedSchedules.push({
        date: dateString,
        day: dayOfWeek,
        scheduleIn: scheduleIn || "00:00",
        scheduleOut: scheduleOut || "00:00",
        isRestDay: isRestDay || false,
        shiftType: shiftType || "Regular",
        isWeekend: isWeekendDay,
        holiday: holidayInfo,
      });
    }

    // Calculate summary statistics
    const summary = {
      totalDays: formattedSchedules.length,
      workDays: formattedSchedules.filter((s) => !s.isRestDay).length,
      restDays: formattedSchedules.filter((s) => s.isRestDay).length,
      holidays: formattedSchedules.filter((s) => s.holiday !== null).length,
      weekends: formattedSchedules.filter((s) => s.isWeekend).length,
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
