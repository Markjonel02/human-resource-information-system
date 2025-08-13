const user = require("../models/user");
const Attendance = require("../models/attendance");

//calculate total hours
const getMinutesDiff = (start, end) => {
  if (!start || !end) return 0;
  return Math.max(0, Math.floor((end - start) / (1000 * 60)));
};

//attemdance record

exports.addAttendance = async (req, res) => {
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
