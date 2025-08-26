const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const employeeAttendance = require("../../controllers/employee/employeeAttendanceController");

router.use(verifyJWT);

// Employee self-service routes
router.get("/my", employeeAttendance.getMyAttendance);
router.post("/my", employeeAttendance.createMyAttendance);

module.exports = router;
