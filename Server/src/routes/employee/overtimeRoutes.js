const express = require("express");
const router = express.Router();
const OvertimeController = require("../../controllers/employee/employeeOvertimeController");
const verifyJWT = require("../../middlewares/verifyJWT");
const authorization = require("../../middlewares/authorizeRole");
const authorizeRoles = require("../../middlewares/authorizeRole");

router.use(verifyJWT);
// apply to all routes
router.post(
  "/addOvertime",
  authorization("employee"),
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
