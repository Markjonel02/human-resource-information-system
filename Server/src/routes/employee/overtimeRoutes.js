const express = require("express");
const router = express.Router();
const OvertimeController = require("../../controllers/employee/employeeOvertimeController");
const verifyJWT = require("../../middlewares/verifyJWT");
const authorizeRoles = require("../../middlewares/authorizeRole"); // Renamed for consistency

router.use(verifyJWT);

router.post(
  "/addOvertime",
  authorizeRoles("employee"),
  OvertimeController.addOvertime
);

router.put(
  "/editOvertime/:id",
  authorizeRoles("employee"),
  OvertimeController.editOvertime
);

router.delete(
  "/deleteOvertime/:id",
  authorizeRoles("employee"),
  OvertimeController.deleteOvertime
);

router.get(
  "/getEmployeeOvertime",
  authorizeRoles("employee", "admin"),
  OvertimeController.getEmployeeOvertime
);

module.exports = router;
