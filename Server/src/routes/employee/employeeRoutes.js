const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const employeeAttendance = require("../../controllers/employee/employeeAttendanceController");

router.use(verifyJWT);

// Employee self-service routes
router.get("/my", employeeAttendance.getMyAttendance);
router.get("/my-leave-credits", employeeAttendance.getMyLeaveCredits);
router.post("/my", employeeAttendance.createMyAttendance);
router.post("/add-leave", employeeAttendance.addLeave);
router.put("/edit-leave/:id", employeeAttendance.editLeave);
module.exports = router;
