const mongoose = require("mongoose");

const SuspensionSchema = new mongoose.Schema({
  employee: { type: mongoose.Types.ObjectId, ref: "user", required: true },
  title: { type: String, required: true },
  descriptions: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  suspendBy: { type: mongoose.Types.ObjectId, ref: "user", required: true },
});

module.exports = mongoose.model("Suspension", SuspensionSchema);
