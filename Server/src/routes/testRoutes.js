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

router.get(
  "/get-attendance",
  authorizeRoles("admin", "hr"),
  testAttendance.getAttendance
);
router.put(
  "/update-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.updateAttendance
);

router.delete(
  "/delete-attendance/:id",
  authorizeRoles("admin", "hr"),
  testAttendance.deleteAttendance
);
module.exports = router;
