const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const employeeLeave = require("../../controllers/employee/requests_tab/employeeLeaveController");
const authorizeRoles = require("../../middlewares/authorizeRole");

router.use(verifyJWT);
// Employee self-service routes

router.post("/add-leave", authorizeRoles("employee"), employeeLeave.addLeave);
router.put(
  "/edit-leave/:id",
  authorizeRoles("employee"),
  employeeLeave.editLeave
);
router.get(
  "/getemp-leaves",
  authorizeRoles("employee", "admin", "hr"),
  employeeLeave.getEmployeeLeave
);
router.get(
  "/my-leave-credits",
  authorizeRoles("employee"),
  employeeLeave.getMyLeaveCredits
);
module.exports = router;
