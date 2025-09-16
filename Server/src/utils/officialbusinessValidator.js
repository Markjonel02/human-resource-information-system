const Leave = require("../models/LeaveSchema/leaveSchema");
const OfficialBusiness = require("../models/officialbusinessSchema/officialBusinessSchema");

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
      message: `${
        conflictingLeave.leaveStatus
      } leave request from ${conflictingLeave.dateFrom.toDateString()} to ${conflictingLeave.dateTo.toDateString()}.`,
      conflict: conflictingLeave,
    };
  }

  // 🚫 Block if overlapping OB already exists (exclude current record when editing)
  const overlappingOB = await OfficialBusiness.findOne({
    employee: employeeId,
    _id: { $ne: excludeId }, // skip self when editing
    dateFrom: { $lte: toDate },
    dateTo: { $gte: fromDate },
  });

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
