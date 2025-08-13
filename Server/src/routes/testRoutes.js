const express = require("express");
const router = express.Router();
//midlewares

const verifyJWT = require("../middlewares/verifyJWT");
const authorizeRoles = require("../middlewares/authorizeRole");
const testAttendance = require("../controllers/testAttendanceController");

router.use(verifyJWT);

router.post(
  "/create-attendance",
  authorizeRoles("admin", "hr"),
  testAttendance.addAttendance
);
module.exports = router;
