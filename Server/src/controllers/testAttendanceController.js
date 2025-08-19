const Attendance = require("../models/Attendance");
const User = require("../models/user"); // Assuming you have a User model
const AttendanceLog = require("../models/attendanceLogSchema"); // New model for logs

// Helper function to calculate hours in minutes
const calculateHoursInMinutes = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diffMs = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.floor(diffMs / (1000 * 60))); // Convert to minutes
};

// Helper function to calculate tardiness
const calculateTardiness = (checkIn, scheduledCheckIn = "08:00") => {
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

// Helper function to create attendance logs
const createAttendanceLog = async (data) => {
  try {
    const logEntry = new AttendanceLog({
      employeeId: data.employeeId,
      attendanceId: data.attendanceId,
      action: data.action,
      description: data.description,
      performedBy: data.performedBy,
      changes: data.changes || {},
      timestamp: new Date(),
      metadata: data.metadata || {},
    });

    await logEntry.save();
    console.log(
      `Attendance log created: ${data.action} for employee ${data.employeeId}`
    );
  } catch (error) {
    console.error("Error creating attendance log:", error);
    // Don't throw error to prevent breaking main functionality
  }
};

// Helper function to get changes between old and new records
const getRecordChanges = (oldRecord, newRecord) => {
  const changes = {};
  const fieldsToTrack = [
    "status",
    "checkIn",
    "checkOut",
    "leaveType",
    "notes",
    "tardinessMinutes",
    "hoursRendered",
  ];

  fieldsToTrack.forEach((field) => {
    const oldValue = oldRecord[field];
    const newValue = newRecord[field];

    if (oldValue !== newValue) {
      changes[field] = {
        from: oldValue,
        to: newValue,
      };
    }
  });

  return changes;
};

// Add new attendance record (Admin/HR only)
const addAttendance = async (req, res) => {
  // --- MODIFIED: Added role check to restrict access ---
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message: "Access denied. Only HR and Admin users can add attendance records.",
    });
  }

  try {
    const { employeeId, date, status, checkIn, checkOut, leaveType, notes } =
      req.body;
    const performedBy = req.user ? req.user._id : null;

    // Validate required fields
    if (!employeeId || !date || !status) {
      return res.status(400).json({
        message: "Employee ID, date, and status are required",
      });
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      // Log failed attempt
      await createAttendanceLog({
        employeeId: employeeId,
        action: "CREATE_FAILED",
        description:
          "Attempted to create attendance record for non-existent employee",
        performedBy: performedBy,
        metadata: {
          reason: "Employee not found",
          providedEmployeeId: employeeId,
        },
      });

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
      // Log duplicate attempt
      await createAttendanceLog({
        employeeId: employeeId,
        attendanceId: existingAttendance._id,
        action: "CREATE_DUPLICATE_ATTEMPT",
        description: "Attempted to create duplicate attendance record",
        performedBy: performedBy,
        metadata: {
          date: date,
          existingRecordId: existingAttendance._id,
        },
      });

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

    let finalStatus = status.toLowerCase();
    let autoStatusChange = false;

    // Prepare attendance data
    const attendanceData = {
      employee: employeeId,
      date: new Date(date),
      status: finalStatus,
      notes: notes || "",
    };

    // Handle different status types
    if (finalStatus === "present" || finalStatus === "late") {
      if (checkIn) {
        const checkInDate = parseTimeToDate(checkIn, date);
        attendanceData.checkIn = checkInDate;

        // NEW LOGIC: Check if check-in is after the scheduled time and change status to 'late'
        const scheduledTime = new Date(checkInDate);
        scheduledTime.setHours(8, 0, 0, 0); // Assuming 08:00 is the scheduled time

        if (checkInDate > scheduledTime && finalStatus === "present") {
          autoStatusChange = true;
          finalStatus = "late";
          attendanceData.status = "late";
          attendanceData.tardinessMinutes = calculateTardiness(checkInDate);
        } else if (finalStatus === "late") {
          attendanceData.tardinessMinutes = calculateTardiness(checkInDate);
        } else {
          attendanceData.tardinessMinutes = 0;
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
    } else if (finalStatus === "on_leave") {
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

    // Create success log
    await createAttendanceLog({
      employeeId: employeeId,
      attendanceId: newAttendance._id,
      action: "CREATED",
      description: `Attendance record created with status: ${finalStatus}${
        autoStatusChange ? " (auto-changed from present to late)" : ""
      }`,
      performedBy: performedBy,
      changes: {
        created: attendanceData,
      },
      metadata: {
        originalStatus: status,
        finalStatus: finalStatus,
        autoStatusChange: autoStatusChange,
        date: date,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        tardiness: attendanceData.tardinessMinutes || 0,
      },
    });

    // Log auto status change if it occurred
    if (autoStatusChange) {
      await createAttendanceLog({
        employeeId: employeeId,
        attendanceId: newAttendance._id,
        action: "AUTO_STATUS_CHANGE",
        description: `Status automatically changed from 'present' to 'late' due to check-in after 08:00 AM`,
        performedBy: null, // System action
        changes: {
          status: {
            from: "present",
            to: "late",
          },
        },
        metadata: {
          checkInTime: checkIn,
          scheduledTime: "08:00 AM",
          tardinessMinutes: attendanceData.tardinessMinutes,
        },
      });
    }

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

    // Log error
    if (req.body.employeeId) {
      await createAttendanceLog({
        employeeId: req.body.employeeId,
        action: "CREATE_ERROR",
        description: "Error occurred while creating attendance record",
        performedBy: req.user ? req.user._id : null,
        metadata: {
          error: error.message,
          errorCode: error.code,
        },
      });
    }

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

// Get all attendance records (Admin/HR only)
const getAttendance = async (req, res) => {
  // --- MODIFIED: Added role check and removed employee-specific logic ---
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message: "Access denied. Only HR and Admin users can view attendance records.",
    });
  }

  try {
    const { status, employee, page = 1, limit = 100 } = req.query;
    const currentUser = req.user;

    console.log("Current User:", {
      id: currentUser._id,
      role: currentUser.role,
      name: `${currentUser.firstname} ${currentUser.lastname}`,
    });

    // Build query
    const query = {};
    
    // Admin and HR can see all attendance records and filter
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

    console.log("Final query:", query);

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

    console.log("Found records:", attendanceRecords.length);

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
      hoursRendered: record.hoursRendered || 0,
      tardinessMinutes: record.tardinessMinutes || 0,
      leaveType: record.leaveType,
      notes: record.notes,
    }));

    // Log access (only if user exists)
    const performedBy = req.user ? req.user._id : null;
    if (performedBy) {
      try {
        await createAttendanceLog({
          employeeId: null, // General access, not for a specific employee
          action: "BULK_ACCESS",
          description: `Accessed attendance records (${transformedRecords.length} records) - Role: ${currentUser.role}`,
          performedBy: performedBy,
          metadata: {
            query: req.query,
            recordCount: transformedRecords.length,
            page: page,
            limit: limit,
            userRole: currentUser.role,
          },
        });
      } catch (logError) {
        console.error("Error creating attendance log:", logError);
        // Continue without failing the main request
      }
    }

    console.log("Returning records:", transformedRecords.length);
    res.json(transformedRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --- REMOVED: The `getMyAttendance` function was removed as it was specifically for employees to get their own attendance. ---

// Update attendance record
const updateAttendance = async (req, res) => {
  // Fixed: consistent use of req.user (lowercase 'u')
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only HR and Admin users can update attendance records.",
    });
  }

  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, leaveType, notes } = req.body;
    const performedBy = req.user._id;

    const attendance = await Attendance.findById(id).populate("employee");
    if (!attendance) {
      // Log failed attempt
      await createAttendanceLog({
        employeeId: null,
        attendanceId: id,
        action: "UPDATE_FAILED",
        description: "Attempted to update non-existent attendance record",
        performedBy: performedBy,
        metadata: { providedId: id },
      });

      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    // Store old record for comparison
    const oldRecord = {
      status: attendance.status,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      leaveType: attendance.leaveType,
      notes: attendance.notes,
      tardinessMinutes: attendance.tardinessMinutes,
      hoursRendered: attendance.hoursRendered,
    };

    let autoStatusChange = false;
    let originalStatus = attendance.status;

    // Update basic fields
    if (status) {
      const validStatuses = ["present", "absent", "late", "on_leave"];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          message:
            "Invalid status. Valid statuses are: present, absent, late, on_leave",
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

        // Auto-detect late status
        const scheduledTime = new Date(checkInDate);
        scheduledTime.setHours(8, 0, 0, 0);

        if (checkInDate > scheduledTime && attendance.status === "present") {
          autoStatusChange = true;
          originalStatus = attendance.status;
          attendance.status = "late";
          attendance.tardinessMinutes = calculateTardiness(checkInDate);
        } else if (attendance.status === "late") {
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
            message:
              "Invalid leave type. Valid types are: VL, SL, LWOP, BL, OS, CL",
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

    // Create new record object for comparison
    const newRecord = {
      status: attendance.status,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      leaveType: attendance.leaveType,
      notes: attendance.notes,
      tardinessMinutes: attendance.tardinessMinutes,
      hoursRendered: attendance.hoursRendered,
    };

    // Get changes
    const changes = getRecordChanges(oldRecord, newRecord);

    // Log the update
    await createAttendanceLog({
      employeeId: attendance.employee._id,
      attendanceId: attendance._id,
      action: "UPDATED",
      description: `Attendance record updated${
        autoStatusChange ? " (status auto-changed to late)" : ""
      }`,
      performedBy: performedBy,
      changes: changes,
      metadata: {
        updatedFields: Object.keys(changes),
        autoStatusChange: autoStatusChange,
        originalStatus: originalStatus,
        finalStatus: attendance.status,
        updatedBy: req.user.firstname + " " + req.user.lastname,
      },
    });

    // Log auto status change if it occurred
    if (autoStatusChange) {
      await createAttendanceLog({
        employeeId: attendance.employee._id,
        attendanceId: attendance._id,
        action: "AUTO_STATUS_CHANGE",
        description: `Status automatically changed from '${originalStatus}' to 'late' during update due to check-in after 08:00 AM`,
        performedBy: null, // System action
        changes: {
          status: {
            from: originalStatus,
            to: "late",
          },
        },
        metadata: {
          checkInTime: checkIn,
          scheduledTime: "08:00 AM",
          tardinessMinutes: attendance.tardinessMinutes,
          triggeredDuring: "UPDATE",
        },
      });
    }

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

    // Log error
    if (req.params.id) {
      await createAttendanceLog({
        employeeId: null,
        attendanceId: req.params.id,
        action: "UPDATE_ERROR",
        description: "Error occurred while updating attendance record",
        performedBy: req.user ? req.user._id : null,
        metadata: {
          error: error.message,
          providedData: req.body,
        },
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
    // --- MODIFIED: Added role check to restrict access ---
    if (req.user.role !== "admin" && req.user.role !== "hr") {
        return res.status(403).json({
            message: "Access denied. Only HR and Admin users can delete attendance records.",
        });
    }

  try {
    const { id } = req.params;
    const performedBy = req.user ? req.user._id : null;

    const attendance = await Attendance.findById(id).populate("employee");
    if (!attendance) {
      // Log failed attempt
      await createAttendanceLog({
        employeeId: null,
        attendanceId: id,
        action: "DELETE_FAILED",
        description: "Attempted to delete non-existent attendance record",
        performedBy: performedBy,
        metadata: { providedId: id },
      });

      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    // Store record data before deletion
    const recordData = {
      employeeId: attendance.employee._id,
      employeeName:
        attendance.employee.firstname + " " + attendance.employee.lastname,
      date: attendance.date,
      status: attendance.status,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      leaveType: attendance.leaveType,
      notes: attendance.notes,
    };

    await Attendance.findByIdAndDelete(id);

    // Log successful deletion
    await createAttendanceLog({
      employeeId: attendance.employee._id,
      attendanceId: id,
      action: "DELETED",
      description: `Attendance record deleted for ${recordData.employeeName}`,
      performedBy: performedBy,
      changes: {
        deleted: recordData,
      },
      metadata: {
        deletedBy: req.user
          ? req.user.firstname + " " + req.user.lastname
          : "Unknown",
        originalRecord: recordData,
      },
    });

    res.json({
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);

    // Log error
    if (req.params.id) {
      await createAttendanceLog({
        employeeId: null,
        attendanceId: req.params.id,
        action: "DELETE_ERROR",
        description: "Error occurred while deleting attendance record",
        performedBy: req.user ? req.user._id : null,
        metadata: {
          error: error.message,
        },
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get attendance logs (Admin/HR only)
const getAttendanceLogs = async (req, res) => {
    // --- MODIFIED: Added role check to restrict access ---
    if (req.user.role !== "admin" && req.user.role !== "hr") {
        return res.status(403).json({
            message: "Access denied. Only HR and Admin users can view attendance logs.",
        });
    }

  try {
    const {
      employeeId,
      attendanceId,
      action,
      page = 1,
      limit = 50,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (employeeId) query.employeeId = employeeId;
    if (attendanceId) query.attendanceId = attendanceId;
    if (action) query.action = action.toUpperCase();

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Fetch logs with proper population
    const logs = await AttendanceLog.find(query)
      .populate({
        path: "employeeId",
        select: "firstname lastname employeeId",
      })
      .populate({
        path: "performedBy",
        select: "firstname lastname role",
        match: { _id: { $exists: true } }, // Ensure populated document exists
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AttendanceLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance logs:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get logs for a specific employee (Admin/HR only)
const getEmployeeAttendanceLogs = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // --- MODIFIED: Role check updated to remove employee self-access ---
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({
        message: "Access denied. You do not have permission to view these logs.",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AttendanceLog.find({ employeeId })
      .populate("performedBy", "firstname lastname employeeId")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AttendanceLog.countDocuments({ employeeId });

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching employee attendance logs:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get recent attendance logs (for dashboard/activity feed, Admin/HR only)
const getRecentAttendanceLogs = async (req, res) => {
    // --- MODIFIED: Added role check and removed employee-specific logic ---
    if (req.user.role !== "admin" && req.user.role !== "hr") {
        return res.status(403).json({
            message: "Access denied. You do not have permission to view recent logs.",
        });
    }

  try {
    const { limit = 20, actions } = req.query;

    const query = {};

    if (actions) {
      const actionArray = actions
        .split(",")
        .map((action) => action.toUpperCase());
      query.action = { $in: actionArray };
    }

    const logs = await AttendanceLog.find(query)
      .populate("employeeId", "firstname lastname employeeId department")
      .populate("performedBy", "firstname lastname employeeId")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Group logs by date for better organization
    const groupedLogs = logs.reduce((acc, log) => {
      const date = log.timestamp.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {});

    res.json({
      logs,
      groupedLogs,
      summary: {
        totalLogs: logs.length,
        dateRange:
          logs.length > 0
            ? {
                latest: logs[0].timestamp,
                oldest: logs[logs.length - 1].timestamp,
              }
            : null,
      },
    });
  } catch (error) {
    console.error("Error fetching recent attendance logs:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --- MODIFIED: `getMyAttendance` was removed from the exports ---
module.exports = {
  addAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceLogs,
  getEmployeeAttendanceLogs,
  getRecentAttendanceLogs,
};