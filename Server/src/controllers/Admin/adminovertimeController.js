const OverTime = require("../../models/overtimeSchema");
const Leave = require("../../models/LeaveSchema/leaveSchema");
/* const user = require("../../models/user"); */

// Get all overtime requests for admin view
const getAllOvertimeRequests = async (req, res) => {
  try {
    const { status, department, page = 1, limit = 50 } = req.query;

    // Build filter object
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Base query with employee population
    let query = OverTime.find(filter)
      .populate({
        path: "employee",
        select: "firstname lastname employeeId department email",
        match: department && department !== "all" ? { department } : {},
      })
      .populate({
        path: "approvedBy",
        select: "firstname lastname employeeId",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const overtimeRequests = await query.exec();

    // Filter out records where employee is null (due to department filter)
    const filteredRequests = overtimeRequests.filter(
      (req) => req.employee !== null
    );

    // Get total count for pagination
    const totalQuery = OverTime.find(filter).populate({
      path: "employee",
      select: "department",
      match: department && department !== "all" ? { department } : {},
    });

    const totalResults = await totalQuery.exec();
    const totalCount = totalResults.filter(
      (req) => req.employee !== null
    ).length;

    res.status(200).json({
      success: true,
      data: filteredRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in getAllOvertimeRequests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overtime requests",
      error: error.message,
    });
  }
};

// Approve overtime request
const approveOvertimeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    // Find the overtime request
    const overtimeRequest = await OverTime.findById(id).populate(
      "employee",
      "firstname lastname employeeId email"
    );

    if (!overtimeRequest) {
      return res.status(404).json({
        success: false,
        message: "Overtime request not found",
      });
    }

    if (overtimeRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending overtime requests can be approved",
      });
    }

    // Check if employee has conflicting approved leave during overtime period
    const conflictingLeave = await Leave.findOne({
      employee: overtimeRequest.employee._id,
      leaveStatus: "approved",
      $or: [
        {
          dateFrom: {
            $gte: overtimeRequest.dateFrom,
            $lte: overtimeRequest.dateTo,
          },
        },
        {
          dateTo: {
            $gte: overtimeRequest.dateFrom,
            $lte: overtimeRequest.dateTo,
          },
        },
        {
          dateFrom: { $lte: overtimeRequest.dateFrom },
          dateTo: { $gte: overtimeRequest.dateTo },
        },
      ],
    });

    if (conflictingLeave) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve overtime. Employee has approved leave from ${conflictingLeave.dateFrom.toDateString()} to ${conflictingLeave.dateTo.toDateString()}`,
      });
    }

    // Update overtime request
    overtimeRequest.status = "approved";
    overtimeRequest.approvedBy = adminId;
    overtimeRequest.approvedAt = new Date();

    await overtimeRequest.save();

    // Populate the approvedBy field for response
    await overtimeRequest.populate(
      "approvedBy",
      "firstname lastname employeeId"
    );

    res.status(200).json({
      success: true,
      message: "Overtime request approved successfully",
      data: overtimeRequest,
    });
  } catch (error) {
    console.error("Error in approveOvertimeRequest:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve overtime request",
      error: error.message,
    });
  }
};

// Reject overtime request
const rejectOvertimeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user._id;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // Find the overtime request
    const overtimeRequest = await OverTime.findById(id).populate(
      "employee",
      "firstname lastname employeeId email"
    );

    if (!overtimeRequest) {
      return res.status(404).json({
        success: false,
        message: "Overtime request not found",
      });
    }

    if (overtimeRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending overtime requests can be rejected",
      });
    }

    // Update overtime request
    overtimeRequest.status = "rejected";
    overtimeRequest.approvedBy = adminId;
    overtimeRequest.approvedAt = new Date();
    overtimeRequest.rejectionReason = rejectionReason.trim();

    await overtimeRequest.save();

    // Populate the approvedBy field for response
    await overtimeRequest.populate(
      "approvedBy",
      "firstname lastname employeeId"
    );

    res.status(200).json({
      success: true,
      message: "Overtime request rejected successfully",
      data: overtimeRequest,
    });
  } catch (error) {
    console.error("Error in rejectOvertimeRequest:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject overtime request",
      error: error.message,
    });
  }
};

// Bulk approve overtime requests
const bulkApproveOvertimeRequests = async (req, res) => {
  try {
    // Accept multiple possible field names and formats
    let overtimeIds =
      req.body?.overtimeIds ??
      req.body?.ids ??
      req.body?.overtime ??
      req.body?.overtimes;

    // If a comma-separated string was sent, convert to array
    if (typeof overtimeIds === "string") {
      overtimeIds = overtimeIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (!Array.isArray(overtimeIds) || overtimeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of overtime IDs",
      });
    }

    // Validate ObjectId values and separate invalid ones
    const { validIds, invalidIds } = overtimeIds.reduce(
      (acc, id) => {
        if (mongoose.Types.ObjectId.isValid(id)) acc.validIds.push(id);
        else acc.invalidIds.push(id);
        return acc;
      },
      { validIds: [], invalidIds: [] }
    );

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid overtime IDs provided",
        invalidIds,
      });
    }

    const adminId = req.user?._id;

    // Find pending overtime requests that match the valid ids
    const overtimeRequests = await OverTime.find({
      _id: { $in: validIds },
      status: "pending",
    }).populate("employee", "firstname lastname employeeId");

    if (overtimeRequests.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No pending overtime requests found for the provided IDs",
        invalidIds,
      });
    }

    const conflictingRequests = [];
    const approvableIds = [];

    // Check leave conflicts per request
    for (const request of overtimeRequests) {
      const conflictingLeave = await Leave.findOne({
        employee: request.employee._id,
        leaveStatus: "approved",
        $or: [
          {
            dateFrom: { $gte: request.dateFrom, $lte: request.dateTo },
          },
          {
            dateTo: { $gte: request.dateFrom, $lte: request.dateTo },
          },
          {
            dateFrom: { $lte: request.dateFrom },
            dateTo: { $gte: request.dateTo },
          },
        ],
      });

      if (conflictingLeave) {
        conflictingRequests.push({
          id: request._id,
          employee: `${request.employee.firstname} ${request.employee.lastname}`,
          conflict: `Leave from ${conflictingLeave.dateFrom.toDateString()} to ${conflictingLeave.dateTo.toDateString()}`,
        });
      } else {
        approvableIds.push(request._id);
      }
    }

    // Update all approvable requests in one operation
    let updatedCount = 0;
    if (approvableIds.length > 0) {
      const updateRes = await OverTime.updateMany(
        { _id: { $in: approvableIds } },
        {
          status: "approved",
          approvedBy: adminId,
          approvedAt: new Date(),
        }
      );
      updatedCount =
        updateRes.modifiedCount ?? updateRes.nModified ?? approvableIds.length;
    }

    res.status(200).json({
      success: true,
      message: `${updatedCount} overtime requests approved successfully`,
      data: {
        approved: updatedCount,
        conflicts: conflictingRequests.length,
        conflictingRequests,
        invalidIds,
      },
    });
  } catch (error) {
    console.error("Error in bulkApproveOvertimeRequests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk approve overtime requests",
      error: error.message,
    });
  }
};

// Get overtime statistics for admin dashboard
const getOvertimeStatistics = async (req, res) => {
  try {
    const { department, startDate, endDate } = req.query;

    // Build match filter
    const matchFilter = {};

    if (startDate && endDate) {
      matchFilter.dateFrom = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Aggregate pipeline
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
    ];

    // Add department filter if specified
    if (department && department !== "all") {
      pipeline.push({
        $match: { "employee.department": department },
      });
    }

    // Group by status and calculate statistics
    pipeline.push({
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalHours: { $sum: "$hours" },
        totalDays: { $sum: "$totalOvertimeDays" },
      },
    });

    const stats = await OverTime.aggregate(pipeline);

    // Format statistics
    const formattedStats = {
      pending: { count: 0, totalHours: 0, totalDays: 0 },
      approved: { count: 0, totalHours: 0, totalDays: 0 },
      rejected: { count: 0, totalHours: 0, totalDays: 0 },
      total: { count: 0, totalHours: 0, totalDays: 0 },
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = {
        count: stat.count,
        totalHours: stat.totalHours,
        totalDays: stat.totalDays,
      };

      formattedStats.total.count += stat.count;
      formattedStats.total.totalHours += stat.totalHours;
      formattedStats.total.totalDays += stat.totalDays;
    });

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error in getOvertimeStatistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overtime statistics",
      error: error.message,
    });
  }
};

// Get overtime request details
const getOvertimeRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const overtimeRequest = await OverTime.findById(id)
      .populate(
        "employee",
        "firstname lastname employeeId department email phone"
      )
      .populate("approvedBy", "firstname lastname employeeId");

    if (!overtimeRequest) {
      return res.status(404).json({
        success: false,
        message: "Overtime request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: overtimeRequest,
    });
  } catch (error) {
    console.error("Error in getOvertimeRequestDetails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overtime request details",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOvertimeRequests,
  approveOvertimeRequest,
  rejectOvertimeRequest,
  bulkApproveOvertimeRequests,
  getOvertimeStatistics,
  getOvertimeRequestDetails,
};
