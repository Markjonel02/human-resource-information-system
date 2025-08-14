const Attendance = require("../models/Attendance");
const User = require("../models/user"); // Assuming you have a User model

// Helper function to calculate hours in minutes
const calculateHoursInMinutes = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diffMs = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.floor(diffMs / (1000 * 60))); // Convert to minutes
};

// Helper function to calculate tardiness
const calculateTardiness = (checkIn, scheduledCheckIn = "09:00") => {
  if (!checkIn) return 0;

  const checkInTime = new Date(checkIn);
  const scheduled = new Date(checkInTime);
  const [hours, minutes] = scheduledCheckIn.split(":");
  scheduled.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  if (checkInTime > scheduled) {
    return Math.floor((checkInTime - scheduled) / (1000 * 60)); // Minutes late
  }
  return 0;
};

// Helper function to parse time string to Date
const parseTimeToDate = (timeStr, baseDate) => {
  if (!timeStr || timeStr === "-") return null;

  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Add new attendance record
const addAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, leaveType, notes } =
      req.body;

    // Validate required fields
    if (!employeeId || !date || !status) {
      return res.status(400).json({
        message: "Employee ID, date, and status are required",
      });
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance record already exists for this date",
      });
    }

    // Validate status
    const validStatuses = ["present", "absent", "late", "on_leave"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid status. Must be: present, absent, late, or on_leave",
      });
    }

    // Prepare attendance data
    const attendanceData = {
      employee: employeeId,
      date: new Date(date),
      status: status.toLowerCase(),
      notes: notes || "",
    };

    // Handle different status types
    if (status.toLowerCase() === "present" || status.toLowerCase() === "late") {
      if (checkIn) {
        const checkInDate = parseTimeToDate(checkIn, date);
        attendanceData.checkIn = checkInDate;

        // Calculate tardiness for late status
        if (status.toLowerCase() === "late") {
          attendanceData.tardinessMinutes = calculateTardiness(checkInDate);
        }
      }

      if (checkOut) {
        const checkOutDate = parseTimeToDate(checkOut, date);
        attendanceData.checkOut = checkOutDate;

        // Calculate hours rendered if both check-in and check-out are provided
        if (attendanceData.checkIn && checkOutDate) {
          attendanceData.hoursRendered = calculateHoursInMinutes(
            attendanceData.checkIn,
            checkOutDate
          );
        }
      }
    } else if (status.toLowerCase() === "on_leave") {
      // Validate leave type
      const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "OS", "CL"];
      if (!leaveType || !validLeaveTypes.includes(leaveType)) {
        return res.status(400).json({
          message: "Valid leave type is required for leave status",
        });
      }
      attendanceData.leaveType = leaveType;
    }

    // Create new attendance record
    const newAttendance = new Attendance(attendanceData);
    await newAttendance.save();

    // Populate employee data before returning
    const populatedAttendance = await Attendance.findById(
      newAttendance._id
    ).populate(
      "employee",
      "firstname lastname employeeId department role employmentType"
    );

    res.status(201).json({
      message: "Attendance record created successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("Error adding attendance:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Attendance record already exists for this employee on this date",
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all attendance records
const getAttendance = async (req, res) => {
  try {
    const { status, employee, page = 1, limit = 100 } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status.toLowerCase();
    }

    if (employee) {
      // Search by employee name or ID
      const employees = await User.find({
        $or: [
          { firstname: { $regex: employee, $options: "i" } },
          { lastname: { $regex: employee, $options: "i" } },
          { employeeId: { $regex: employee, $options: "i" } },
        ],
      });

      if (employees.length > 0) {
        query.employee = { $in: employees.map((emp) => emp._id) };
      } else {
        // No matching employees found
        return res.json([]);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate(
        "employee",
        "firstname lastname employeeId department role employmentType"
      )
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform data to match frontend expectations
    const transformedRecords = attendanceRecords.map((record) => ({
      _id: record._id,
      employee: record.employee,
      date: record.date,
      status: record.status.charAt(0).toUpperCase() + record.status.slice(1), // Capitalize
      checkIn: record.checkIn
        ? record.checkIn.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "-",
      checkOut: record.checkOut
        ? record.checkOut.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "-",
      hoursRendered: record.hoursRendered,
      tardinessMinutes: record.tardinessMinutes,
      leaveType: record.leaveType,
      notes: record.notes,
    }));

    res.json(transformedRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update attendance record
const updateAttendance = async (req, res) => {
  if (req.User.role !== "admin" && req.user.role !== "hr") {
    return res.status(401).json({
      message: "yo cannot update anything unless you are hr or admins",
    });
  }
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, leaveType, notes } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    // Update basic fields
    if (status) {
      const validStatuses = ["present", "absent", "late", "on_leave"];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }
      attendance.status = status.toLowerCase();
    }

    if (notes !== undefined) {
      attendance.notes = notes;
    }

    // Handle status-specific updates
    if (attendance.status === "present" || attendance.status === "late") {
      if (checkIn) {
        const checkInDate = parseTimeToDate(checkIn, attendance.date);
        attendance.checkIn = checkInDate;

        if (attendance.status === "late") {
          attendance.tardinessMinutes = calculateTardiness(checkInDate);
        } else {
          attendance.tardinessMinutes = 0;
        }
      }

      if (checkOut) {
        const checkOutDate = parseTimeToDate(checkOut, attendance.date);
        attendance.checkOut = checkOutDate;

        if (attendance.checkIn && checkOutDate) {
          attendance.hoursRendered = calculateHoursInMinutes(
            attendance.checkIn,
            checkOutDate
          );
        }
      }

      // Clear leave type for non-leave status
      attendance.leaveType = null;
    } else if (attendance.status === "on_leave") {
      if (leaveType) {
        const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "OS", "CL"];
        if (!validLeaveTypes.includes(leaveType)) {
          return res.status(400).json({
            message: "Invalid leave type",
          });
        }
        attendance.leaveType = leaveType;
      }

      // Clear time-related fields for leave
      attendance.checkIn = null;
      attendance.checkOut = null;
      attendance.hoursRendered = 0;
      attendance.tardinessMinutes = 0;
    } else if (attendance.status === "absent") {
      // Clear all time-related fields for absent
      attendance.checkIn = null;
      attendance.checkOut = null;
      attendance.hoursRendered = 0;
      attendance.tardinessMinutes = 0;
      attendance.leaveType = null;
    }

    await attendance.save();

    // Return populated record
    const updatedRecord = await Attendance.findById(id).populate(
      "employee",
      "firstname lastname employeeId department role employmentType"
    );

    res.json({
      message: "Attendance record updated successfully",
      attendance: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    await Attendance.findByIdAndDelete(id);

    res.json({
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  addAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
};
