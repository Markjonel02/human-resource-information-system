const mongoose = require("mongoose");
const OfficialBusinessSchema = new mongoose.Schema({
  employee: {
    ref: "user",
    type: mongoose.Schema.Types.ObjectId,
  },
  dateFrom: {
    type: Date,
    required: true,
  },
  dateTo: {
    type: Date,
    required: true,
  },
  reason: {
    required: true,
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: "null",
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("officialBusiness", OfficialBusinessSchema);
