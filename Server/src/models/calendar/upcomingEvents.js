const mongoose = require("mongoose");

const upcomingEventsSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  title: { type: String, required: true },
  description: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 60 },
  type: {
    type: String,
    enum: ["meeting", "call", "review", "task"],
    default: "meeting",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },

});

const UpcomingEvent = mongoose.model("UpcomingEvent", upcomingEventsSchema);
module.exports = UpcomingEvent;
