const express = require("express");
const router = express.Router();
const authorizeRole = require("../../middlewares/authorizeRole");
const verifyJwt = require("../../middlewares/verifyJWT");
const empployeeCalendar = require("../../controllers/employee/calendar/employeeCalendar");
router.use(verifyJwt);

router.get(
  "/employee-get-events",
  authorizeRole("employee", "admin", "hr"),
  empployeeCalendar.getEmployeeUpcomingEvents
);

module.exports = router;
