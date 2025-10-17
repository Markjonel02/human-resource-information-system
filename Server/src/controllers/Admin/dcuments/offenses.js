const Attendance = require("../../../models/attendance");
const getLateRecordsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find all attendance records where status is 'late' for this employee
    const lateRecords = await Attendance.find({
      employee: employeeId,
      status: "late",
    })
      .sort({ date: -1 }) // Most recent first
      .populate("employee", "firstName lastName name email department")
      .select("date checkIn checkOut tardinessMinutes hoursRendered");

    res.status(200).json({
      success: true,
      count: lateRecords.length,
      lateRecords,
    });
  } catch (error) {
    console.error("Get late records error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch late records",
      error: error.message,
    });
  }
};

// @desc    Get late statistics for an employee
// @route   GET /api/attendance/late-stats/:employeeId
// @access  Private
const getLateStatsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    let query = {
      employee: employeeId,
      status: "late",
    };

    // Optional date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const lateRecords = await Attendance.find(query);

    // Calculate statistics
    const totalLateInstances = lateRecords.length;
    const totalTardinessMinutes = lateRecords.reduce(
      (sum, record) => sum + (record.tardinessMinutes || 0),
      0
    );
    const averageTardinessMinutes =
      totalLateInstances > 0 ? totalTardinessMinutes / totalLateInstances : 0;

    res.status(200).json({
      success: true,
      statistics: {
        totalLateInstances,
        totalTardinessMinutes,
        averageTardinessMinutes: Math.round(averageTardinessMinutes),
        totalTardinessHours: (totalTardinessMinutes / 60).toFixed(2),
      },
      lateRecords,
    });
  } catch (error) {
    console.error("Get late stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch late statistics",
      error: error.message,
    });
  }
};

// @desc    Get all employees with late records (for admin view)
// @route   GET /api/attendance/late-employees
// @access  Private (Admin only)
const getAllEmployeesWithLate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { status: "late" };

    // Optional date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const lateRecords = await Attendance.find(query)
      .populate("employee", "firstName lastName name email department")
      .sort({ date: -1 });

    // Group by employee
    const employeeStats = {};

    lateRecords.forEach((record) => {
      const empId = record.employee._id.toString();

      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employee: record.employee,
          lateCount: 0,
          totalTardinessMinutes: 0,
          records: [],
        };
      }

      employeeStats[empId].lateCount++;
      employeeStats[empId].totalTardinessMinutes +=
        record.tardinessMinutes || 0;
      employeeStats[empId].records.push({
        date: record.date,
        checkIn: record.checkIn,
        tardinessMinutes: record.tardinessMinutes,
      });
    });

    // Convert to array and sort by late count
    const result = Object.values(employeeStats).sort(
      (a, b) => b.lateCount - a.lateCount
    );

    res.status(200).json({
      success: true,
      count: result.length,
      employees: result,
    });
  } catch (error) {
    console.error("Get all late employees error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch late employees",
      error: error.message,
    });
  }
};

module.exports = {
  getLateRecordsByEmployee,
  getLateStatsByEmployee,
  getAllEmployeesWithLate,
};
