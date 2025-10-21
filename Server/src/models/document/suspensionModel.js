const mongoose = require("mongoose");

const SuspensionSchema = new mongoose.Schema({
  employee: { type: mongoose.Types.ObjectId, ref: "user", required: true },
  title: { type: String, required: true },
  descriptions: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["active", "pending", "completed", "cancelled"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  suspendBy: { type: mongoose.Types.ObjectId, ref: "user", required: true },
});

module.exports = mongoose.model("Suspension", SuspensionSchema);
