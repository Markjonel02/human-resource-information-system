const Leave = require("../models/LeaveSchema/leaveSchema");
const OfficialBusiness = require("../models/officialbusinessSchema/officialBusinessSchema");
const mongoose = require("mongoose");
/**
 * Validate if an employee can create/update an Official Business
 * @param {ObjectId} employeeId - Employee's user ID
 * @param {Date} start - Start date of the OB
 * @param {Date} end - End date of the OB
 * @returns {Promise<{ valid: boolean, message?: string, conflict?: any }>}
 */
async function validateOfficialBusiness(
  employeeId,
  fromDate,
  toDate,
  excludeId = null
) {
  // 🚫 Block if employee has pending/approved leave overlapping this range
  const conflictingLeave = await Leave.findOne({
    employee: employeeId,
    leaveStatus: { $in: ["pending", "approved"] },
    dateFrom: { $lte: toDate },
    dateTo: { $gte: fromDate },
  });

  if (conflictingLeave) {
    return {
      valid: false,
      message: `Employee has ${
        conflictingLeave.leaveStatus
      } leave request from ${conflictingLeave.dateFrom.toDateString()} to ${conflictingLeave.dateTo.toDateString()}.`,
      conflict: conflictingLeave,
    };
  }

  // 🚫 Block if overlapping OB already exists (exclude current record when editing)
  const queryConditions = {
    employee: employeeId,
    dateFrom: { $lte: toDate },
    dateTo: { $gte: fromDate },
  };

  // Only add exclusion condition if excludeId is provided
  const normalizedFrom = new Date(fromDate.setHours(0, 0, 0, 0));
  const normalizedTo = new Date(toDate.setHours(23, 59, 59, 999));

  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    queryConditions._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  const overlappingOB = await OfficialBusiness.findOne(queryConditions);

  if (overlappingOB) {
    return {
      valid: false,
      message: "Official Business already exists within this date range.",
      conflict: overlappingOB,
    };
  }

  return { valid: true };
}

module.exports = { validateOfficialBusiness };
