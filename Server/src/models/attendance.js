const mongoose = require("mongoose");
const AttendanceSchema = mongoose.Schema({
  numberLateEntries: { type: Number, require: true },
  numberTotalAbsences: { type: Number, require: true },
  vacationLeave: { type: Number, require: true },
});
