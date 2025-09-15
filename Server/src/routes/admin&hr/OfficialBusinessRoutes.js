const express = require("express");
const officialBusiness = require("../../controllers/Admin/officialBusinessController");
const authorizeRoles = require("../../middlewares/authorizeRole");
const verifyJWT = require("../../middlewares/verifyJWT");
const router = express.Router();

router.use(verifyJWT);

router.get(
  "/getAll_OB",
  authorizeRoles("admin", "hr"),
  officialBusiness.getAllOfficialBusinesss
);

module.exports = router;
