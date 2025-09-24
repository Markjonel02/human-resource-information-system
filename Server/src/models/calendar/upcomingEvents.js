const mongoose = require("mongoose");

const upcomingEventsSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: { type: String, required: true },
  description: { type: String },
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
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const upcomingEvents = mongoose.model("UpcomingEvent", upcomingEventsSchema);
module.exports = upcomingEvents;
