// Approve leave (Admin only)

const Attendance = require("../models/Attendance");
const User = require("../models/user"); // Assuming you have a User model
const AttendanceLog = require("../models/attendanceLogSchema"); // New model for logs
const LeaveCredits = require("../models/LeaveSchema/leaveCreditsSchema");
const Leave = require("../models/LeaveSchema/leaveSchema");
const Overtime = require("../models/overtimeSchema");
const OfficialBusiness = require("../models/officialbusinessSchema/officialBusinessSchema");
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
exports.createAttendanceLog = async (data) => {
  try {
    const logEntry = new AttendanceLog({
      employeeId: data.req.user._id,
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
    console.error("Error creating attendance log:", error); // Don't throw error to prevent breaking main functionality
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
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only HR and Admin users can add attendance records.",
    });
  }

  try {
    const {
      employeeId,
      date,
      status,
      checkIn,
      checkOut,
      leaveType,
      notes,
      dateFrom,
      dateTo,
    } = req.body;
    const performedBy = req.user ? req.user._id : null;

    if (!employeeId || !date || !status) {
      return res.status(400).json({
        message: "Employee ID, date, and status are required",
      });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
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

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: new Date(date),
    });

    if (existingAttendance) {
      await createAttendanceLog({
        employeeId: employeeId,
        attendanceId: existingAttendance._id,
        action: "CREATE_DUPLICATE_ATTEMPT",
        description: "Attempted to create duplicate attendance record",
        performedBy: performedBy,
        metadata: { date: date, existingRecordId: existingAttendance._id },
      });
      return res.status(400).json({
        message: "Attendance record already exists for this date",
      });
    }

    const validStatuses = ["present", "absent", "late", "on_leave"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid status. Must be: present, absent, late, or on_leave",
      });
    }

    let finalStatus = status.toLowerCase();
    let autoStatusChange = false;

    const attendanceData = {
      employee: employeeId,
      date: new Date(date),
      status: finalStatus,
      notes: notes || "",
    };
    // ...inside addAttendance...
    if (finalStatus === "on_leave") {
      const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "CL"];
      if (!leaveType || !validLeaveTypes.includes(leaveType)) {
        return res.status(400).json({
          message: "Valid leave type is required for leave status",
        });
      }
      attendanceData.leaveType = leaveType;
      attendanceData.leaveStatus = "pending"; // Always pending on creation
      // Calculate totalLeaveDays
      if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        attendanceData.totalLeaveDays =
          Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    // Add leave date range if on_leave
    if (finalStatus === "on_leave") {
      if (dateFrom) attendanceData.dateFrom = new Date(dateFrom);
      if (dateTo) attendanceData.dateTo = new Date(dateTo);
    }

    if (finalStatus === "present" || finalStatus === "late") {
      if (checkIn) {
        const checkInDate = parseTimeToDate(checkIn, date);
        attendanceData.checkIn = checkInDate;

        const scheduledTime = new Date(checkInDate);
        scheduledTime.setHours(8, 0, 0, 0);

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

        if (attendanceData.checkIn && checkOutDate) {
          attendanceData.hoursRendered = calculateHoursInMinutes(
            attendanceData.checkIn,
            checkOutDate
          );
        }
      }
    } else if (finalStatus === "on_leave") {
      const validLeaveTypes = ["VL", "SL", "LWOP", "BL", "OS", "CL"];
      if (!leaveType || !validLeaveTypes.includes(leaveType)) {
        return res.status(400).json({
          message: "Valid leave type is required for leave status",
        });
      }
      attendanceData.leaveType = leaveType;
    }

    const newAttendance = new Attendance(attendanceData);
    await newAttendance.save();

    await createAttendanceLog({
      employeeId: employeeId,
      attendanceId: newAttendance._id,
      action: "CREATED",
      description: `Attendance record created with status: ${finalStatus}${
        autoStatusChange ? " (auto-changed from present to late)" : ""
      }`,
      performedBy: performedBy,
      changes: { created: attendanceData },
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

    if (autoStatusChange) {
      await createAttendanceLog({
        employeeId: employeeId,
        attendanceId: newAttendance._id,
        action: "AUTO_STATUS_CHANGE",
        description: `Status automatically changed from 'present' to 'late' due to check-in after 08:00 AM`,
        performedBy: null,
        changes: { status: { from: "present", to: "late" } },
        metadata: {
          checkInTime: checkIn,
          scheduledTime: "08:00 AM",
          tardinessMinutes: attendanceData.tardinessMinutes,
        },
      });
    }

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

    if (req.body.employeeId) {
      await createAttendanceLog({
        employeeId: req.body.employeeId,
        action: "CREATE_ERROR",
        description: "Error occurred while creating attendance record",
        performedBy: req.user ? req.user._id : null,
        metadata: { error: error.message, errorCode: error.code },
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
  // Restrict access to admin and HR roles only
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only HR and Admin users can view attendance records.",
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

    // Build attendance query
    const attendanceQuery = {};
    if (status) {
      attendanceQuery.status = status.toLowerCase();
    }

    let employeeIds = null;
    if (employee) {
      const employees = await User.find({
        $or: [
          { firstname: { $regex: employee, $options: "i" } },
          { lastname: { $regex: employee, $options: "i" } },
          { employeeId: { $regex: employee, $options: "i" } },
        ],
      });

      if (employees.length > 0) {
        employeeIds = employees.map((emp) => emp._id);
        attendanceQuery.employee = { $in: employeeIds };
      } else {
        return res.json({ data: [], total: 0 });
      }
    }

    console.log("Final attendance query:", attendanceQuery);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalRecords = await Attendance.countDocuments(attendanceQuery);

    const attendanceRecords = await Attendance.find(attendanceQuery)
      .populate(
        "employee",
        "firstname lastname employeeId department role employmentType"
      )
      .populate("leaveRequest", "leaveType reason")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("Found attendance records:", attendanceRecords.length);

    // Transform attendance records with enhanced data
    const transformedAttendance = await Promise.all(
      attendanceRecords.map(async (record) => {
        let notes = "";
        let isOfficialBusiness = false;

        // Check if this attendance record corresponds to an official business
        if (record.checkIn && record.checkOut && record.status === "present") {
          try {
            const officialBusiness = await OfficialBusiness.findOne({
              employee: record.employee._id,
              status: "approved",
              dateFrom: { $lte: record.date },
              dateTo: { $gte: record.date },
            });

            if (officialBusiness) {
              notes = `Official Business: ${officialBusiness.reason}`;
              isOfficialBusiness = true;
            }
          } catch (error) {
            console.error("Error checking official business:", error);
          }
        }

        // Format hours rendered (convert minutes to hours:minutes)
        const formatHoursRendered = (minutes) => {
          if (!minutes) return "0:00";
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${hours}:${mins.toString().padStart(2, "0")}`;
        };

        // Format tardiness
        const formatTardiness = (minutes) => {
          if (!minutes || minutes === 0) return "No tardiness";
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (hours > 0) {
            return `${hours}h ${mins}m late`;
          }
          return `${mins}m late`;
        };

        return {
          _id: record._id,
          employee: record.employee,
          date: record.date,
          status:
            record.status.charAt(0).toUpperCase() + record.status.slice(1),
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
          hoursRendered: formatHoursRendered(record.hoursRendered),
          hoursRenderedMinutes: record.hoursRendered || 0,
          tardinessMinutes: record.tardinessMinutes || 0,
          tardinessDisplay: formatTardiness(record.tardinessMinutes),
          leaveType: record.leaveRequest?.leaveType || record.leaveType || null,
          leaveReason: record.leaveRequest?.reason || null,
          notes:
            notes ||
            (record.leaveRequest
              ? `Leave: ${record.leaveRequest.reason}`
              : record.notes || ""),
          isOfficialBusiness: isOfficialBusiness,
        };
      })
    );

    // Log access
    try {
      await AttendanceLog({
        employeeId: null,
        action: "BULK_ACCESS",
        description: `Accessed attendance records (${transformedAttendance.length} records) - Role: ${currentUser.role}`,
        performedBy: req.user._id,
        metadata: {
          query: req.query,
          attendanceCount: transformedAttendance.length,
          page: page,
          limit: limit,
          userRole: currentUser.role,
        },
      });
    } catch (logError) {
      console.error("Error creating attendance log:", logError);
    }

    res.json({
      data: transformedAttendance,
      summary: {
        total: totalRecords,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalRecords / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Update attendance record
const updateAttendance = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only HR and Admin users can update attendance records.",
    });
  }

  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, leaveType, notes, dateFrom, dateTo } =
      req.body;
    const performedBy = req.user._id;

    // Validate attendance record exists
    const attendance = await Attendance.findById(id).populate("employee");
    if (!attendance) {
      await AttendanceLog({
        employeeId: req.user ? req.user._id : null,
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
      dateFrom: attendance.dateFrom,
      dateTo: attendance.dateTo,
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
        if (checkInDate) {
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
      }

      if (checkOut) {
        const checkOutDate = parseTimeToDate(checkOut, attendance.date);
        if (checkOutDate) {
          attendance.checkOut = checkOutDate;

          if (attendance.checkIn && checkOutDate) {
            attendance.hoursRendered = calculateHoursInMinutes(
              attendance.checkIn,
              checkOutDate
            );
          }
        }
      }

      // Clear leave-related fields for non-leave status
      attendance.leaveType = null;
      attendance.dateFrom = undefined;
      attendance.dateTo = undefined;
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

      // Add/Update leave date range
      if (dateFrom) attendance.dateFrom = new Date(dateFrom);
      if (dateTo) attendance.dateTo = new Date(dateTo);

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
      attendance.dateFrom = undefined;
      attendance.dateTo = undefined;
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
      dateFrom: attendance.dateFrom,
      dateTo: attendance.dateTo,
    };

    // Get changes
    const changes = getRecordChanges(oldRecord, newRecord);

    // Log the update
    await AttendanceLog({
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
        updatedBy: `${req.user.firstname} ${req.user.lastname}`,
      },
    });

    // Log auto status change if it occurred
    if (autoStatusChange) {
      await AttendanceLog({
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
    try {
      await AttendanceLog({
        employeeId: req.user ? req.user._id : null,
        attendanceId: req.params.id,
        action: "UPDATE_ERROR",
        description: "Error occurred while updating attendance record",
        performedBy: req.user ? req.user._id : null,
        metadata: {
          error: error.message,
          providedData: req.body,
        },
      });
    } catch (logError) {
      console.error("Error logging update error:", logError);
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete attendance record

const deleteAttendance = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({
      message:
        "Access denied. Only HR and Admin users can delete attendance records.",
    });
  }

  try {
    const { id } = req.params;
    const performedBy = req.user._id;

    // Validate attendance record exists
    const attendance = await Attendance.findById(id).populate("employee");
    if (!attendance) {
      await AttendanceLog({
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
      employeeName: `${attendance.employee.firstname} ${attendance.employee.lastname}`,
      date: attendance.date,
      status: attendance.status,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      leaveType: attendance.leaveType,
      notes: attendance.notes,
      hoursRendered: attendance.hoursRendered,
      tardinessMinutes: attendance.tardinessMinutes,
    };

    // Delete the record
    await Attendance.findByIdAndDelete(id);

    // Log successful deletion
    await AttendanceLog({
      employeeId: attendance.employee._id,
      attendanceId: id,
      action: "DELETED",
      description: `Attendance record deleted for ${recordData.employeeName}`,
      performedBy: performedBy,
      changes: {
        deleted: recordData,
      },
      metadata: {
        deletedBy: `${req.user.firstname} ${req.user.lastname}`,
        originalRecord: recordData,
      },
    });

    res.json({
      message: "Attendance record deleted successfully",
      deletedRecord: recordData,
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);

    // Log error
    try {
      await AttendanceLog({
        employeeId: null,
        attendanceId: req.params.id,
        action: "DELETE_ERROR",
        description: "Error occurred while deleting attendance record",
        performedBy: req.user ? req.user._id : null,
        metadata: {
          error: error.message,
        },
      });
    } catch (logError) {
      console.error("Error logging delete error:", logError);
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
      message:
        "Access denied. Only HR and Admin users can view attendance logs.",
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
    } = req.query; // Build query

    const query = {};

    if (employeeId) query.employeeId = employeeId;
    if (attendanceId) query.attendanceId = attendanceId;
    if (action) query.action = action.toUpperCase(); // Calculate pagination

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 }; // Fetch logs with proper population

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
        message:
          "Access denied. You do not have permission to view these logs.",
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
      .limit(parseInt(limit)); // Group logs by date for better organization

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


module.exports = {
  addAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceLogs,
  getEmployeeAttendanceLogs,
  getRecentAttendanceLogs,

};
