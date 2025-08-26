const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const employeeLeave = require("../../controllers/employee/employeeLeaveController");
router.use(verifyJWT);

// Employee self-service routes

router.post("/add-leave", employeeLeave.addLeave);
router.put("/edit-leave/:id", employeeLeave.editLeave);
router.get("/getemp-leaves", employeeLeave.getEmployeeLeave);
router.get("/my-leave-credits", employeeLeave.getMyLeaveCredits);
module.exports = router;
