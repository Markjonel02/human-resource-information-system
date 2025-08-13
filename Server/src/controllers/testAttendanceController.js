const user = require("../models/user");
const Attendance = require("../models/attendance");

//calculate total hours
const getMinutesDiff = (start, end) => {
  if (!start || !end) return 0;
  return Math.max(0, Math.floor((end - start) / (1000 * 60)));
};

//attemdance record

exports.addAttendance = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(401).json({
      message: "Unauthrorize you cannot edit this page without admin consent",
    });
  }

  try {
    const { employee, date, status, checkIn, checkOut, leaveType, notes } =
      req.body;

    let hoursRendered = 0;
    let tardinessMinutes = 0;

    //auto calculate tardiness if checkin is provided and schedultime fixed
    const scheduleStart = new Date(checkIn, date);
    scheduleStart.setHours(8, 0, 0, 0); // default hour

    if (checkIn) {
      const actualCheckIn = new Date(checkIn);
      if (actualCheckIn > scheduleStart) {
        tardinessMinutes = getMinutesDiff(scheduleStart, actualCheckIn);
      }
    }

    const newAttendance = new Attendance({
      employee,
      date,
      status,
      checkin,
      checkOut,
      hoursRendered,
      tardinessMinutes,
      leaveType,
      notes,
    });

    await newAttendance.save();
    res.status(201).json({
      message: "Attendance successfully recorded!",
      data: newAttendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Attendance for this date already exists for the employee",
      });
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { month, year, status, employee } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (employee) filter.employee = employee;

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate("employee", "firstname lastname")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({
      mesaage: "Server error while getting the data",
      error: error.messsage,
    });
  }
};

exports.updateAttendance = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({ message: "Forbidden unauthorize role" });
  }
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.checkIn && update.checkOut) {
      updates.hoursRendered = getMinutesDiff(
        new Date(updates.checkIn),
        new Date(updates.checkOut)
      );

      if (updates.checkIn) {
        const scheduleStart = new Date(updates.checkIn);
        scheduleStart(9, 0, 0, 0);
        const actualCheckIn = new Date(updates.checkIn);
        updates.tardinessMinutes =
          actualCheckIn > scheduleStart
            ? getMinutesDiff(scheduleStart, actualCheckIn)
            : 0;
      }

      const updated = await Attendance.findByIdAndUpdate(id, updates, {
        new: true,
      });

      if (!updated)
        return res.status(404).json({ message: "Attendance not found" });

      res.json({ message: "Attendance updated successfully", data: updated });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.checkIn && updates.checkOut) {
      updates.hoursRendered = getMinutesDiff(
        new Date(updates.checkIn),
        new Date(updates.checkOut)
      );
    }

    if (updates.checkIn) {
      const scheduledStart = new Date(updates.checkIn);
      scheduledStart.setHours(9, 0, 0, 0);
      const actualCheckIn = new Date(updates.checkIn);
      updates.tardinessMinutes =
        actualCheckIn > scheduledStart
          ? getMinutesDiff(scheduledStart, actualCheckIn)
          : 0;
    }

    const updated = await Attendance.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Attendance not found" });

    res.json({ message: "Attendance updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete attendance
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Attendance not found" });

    res.json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
