const mongoose = require("mongoose");

const OffensesSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  title: { type: String, required: true },
  severity: {
    type: String,
    enum: ["major", "critical", "minor"],
    required: true,
  },
  date: { type: Date, required: true },
  description: { type: String },
});

module.exports = mongoose.model("Offenses", OffensesSchema);
