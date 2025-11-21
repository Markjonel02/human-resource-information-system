// models/Schedule.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ScheduleSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    scheduleIn: {
      type: String, // Format: "08:00" (24-hour format)
      required: true,
      validate: {
        validator: function (v) {
          // Validate time format HH:MM
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:MM`,
      },
    },
    scheduleOut: {
      type: String, // Format: "17:00" (24-hour format)
      required: true,
      validate: {
        validator: function (v) {
          // Validate time format HH:MM
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:MM`,
      },
    },
    isRestDay: {
      type: Boolean,
      default: false,
    },
    shiftType: {
      type: String,
      enum: ["Regular", "Night", "Flexible", "Split", "Overtime"],
      default: "Regular",
    },
    breakDuration: {
      type: Number, // in minutes
      default: 60, // 1 hour lunch break
    },
    location: {
      type: String,
      trim: true,
      default: "Office",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Who created/assigned this schedule
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    // Status for schedule confirmation
    status: {
      type: String,
      enum: ["pending", "confirmed", "modified", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one schedule per employee per day
ScheduleSchema.index({ employee: 1, date: 1 }, { unique: true });

// Index for querying by date range
ScheduleSchema.index({ date: 1, employee: 1 });

// Virtual to calculate expected work hours
ScheduleSchema.virtual("expectedHours").get(function () {
  if (this.isRestDay) return 0;

  const [inHour, inMin] = this.scheduleIn.split(":").map(Number);
  const [outHour, outMin] = this.scheduleOut.split(":").map(Number);

  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;

  let totalMinutes = outMinutes - inMinutes;

  // Handle overnight shifts (e.g., 22:00 to 06:00)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Add 24 hours in minutes
  }

  // Subtract break duration
  totalMinutes -= this.breakDuration;

  // Convert to hours
  return Math.max(0, totalMinutes / 60);
});

// Method to check if schedule is in the past
ScheduleSchema.methods.isPast = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.date < today;
};

// Method to check if schedule is today
ScheduleSchema.methods.isToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduleDate = new Date(this.date);
  scheduleDate.setHours(0, 0, 0, 0);
  return scheduleDate.getTime() === today.getTime();
};

// Method to format schedule for display
ScheduleSchema.methods.getDisplayTime = function () {
  if (this.isRestDay) {
    return "Rest Day";
  }
  return `${this.scheduleIn} - ${this.scheduleOut}`;
};

// Static method to generate schedules for a month
ScheduleSchema.statics.generateMonthlySchedule = async function (
  employeeId,
  year,
  month,
  defaultSchedule = { scheduleIn: "08:00", scheduleOut: "17:00" }
) {
  try {
    const daysInMonth = new Date(year, month, 0).getDate();
    const schedules = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Check if weekend
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Check if schedule already exists
      const existingSchedule = await this.findOne({
        employee: employeeId,
        date: date,
      });

      if (!existingSchedule) {
        schedules.push({
          employee: employeeId,
          date: date,
          scheduleIn: isWeekend ? "00:00" : defaultSchedule.scheduleIn,
          scheduleOut: isWeekend ? "00:00" : defaultSchedule.scheduleOut,
          isRestDay: isWeekend,
          shiftType: "Regular",
        });
      }
    }

    if (schedules.length > 0) {
      await this.insertMany(schedules);
    }

    return schedules.length;
  } catch (error) {
    throw new Error(`Error generating monthly schedule: ${error.message}`);
  }
};

// Static method to get employee's schedule for a date range
ScheduleSchema.statics.getScheduleRange = async function (
  employeeId,
  startDate,
  endDate
) {
  try {
    const schedules = await this.find({
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ date: 1 })
      .lean();

    return schedules;
  } catch (error) {
    throw new Error(`Error fetching schedule range: ${error.message}`);
  }
};

// Static method to update multiple schedules
ScheduleSchema.statics.bulkUpdateSchedules = async function (scheduleUpdates) {
  try {
    const operations = scheduleUpdates.map((update) => ({
      updateOne: {
        filter: { employee: update.employee, date: update.date },
        update: {
          $set: {
            scheduleIn: update.scheduleIn,
            scheduleOut: update.scheduleOut,
            isRestDay: update.isRestDay,
            shiftType: update.shiftType || "Regular",
          },
        },
        upsert: true,
      },
    }));

    const result = await this.bulkWrite(operations);
    return result;
  } catch (error) {
    throw new Error(`Error bulk updating schedules: ${error.message}`);
  }
};

// Pre-save middleware to validate schedule times
ScheduleSchema.pre("save", function (next) {
  // If it's a rest day, allow 00:00 times
  if (this.isRestDay) {
    return next();
  }

  // Parse times
  const [inHour, inMin] = this.scheduleIn.split(":").map(Number);
  const [outHour, outMin] = this.scheduleOut.split(":").map(Number);

  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;

  // Check if scheduleOut is after scheduleIn (allowing overnight shifts)
  // For regular shifts (same day), scheduleOut should be > scheduleIn
  // For overnight shifts, we allow scheduleOut < scheduleIn
  if (inMinutes === outMinutes && !this.isRestDay) {
    return next(new Error("Schedule in and out times cannot be the same"));
  }

  next();
});

// Ensure virtual fields are included in JSON output
ScheduleSchema.set("toJSON", { virtuals: true });
ScheduleSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Schedule", ScheduleSchema);
