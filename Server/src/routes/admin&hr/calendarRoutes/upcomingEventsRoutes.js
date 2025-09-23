const upcomingevent = require("../../../controllers/Admin/calendar/calendarSchedulerController");
const express = require("express");
const router = express.Router();
const authorizeRole = require("../../../middlewares/authorizeRole");
const verifyJWT = require("../../../middlewares/verifyJWT");

router.use(verifyJWT);

router.post(
  "/create-events",
  authorizeRole("admin", "hr"),
  upcomingevent.createUpcomingEvent
);

module.exports = router;
