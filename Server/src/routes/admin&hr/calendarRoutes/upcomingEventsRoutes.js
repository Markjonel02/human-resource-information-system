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
router.get(
  "/get-events",
  authorizeRole("admin", "hr"),
  upcomingevent.getUpcomingEvents
);
router.get(
  "/search-employees",
  authorizeRole("admin", "hr"),
  upcomingevent.searchEmployeesAlternative
);
router.put(
  "/update-event/:eventId",
  authorizeRole("admin", "hr"),
  upcomingevent.updateUpcomingEvent
);
router.delete(
  "/delete-event/:eventId",
  authorizeRole("admin", "hr"),
  upcomingevent.delteUpcomingEvent
);
router.put(
  "/mark-done/:id",
  authorizeRole("admin", "hr"),
  upcomingevent.markAsDone
);
module.exports = router;
