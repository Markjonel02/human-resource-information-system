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
router.post(
  "/addEmp_OB",
  authorizeRoles("admin", "hr"),
  officialBusiness.addAdminOfficialBusiness
);
router.get(
  "/searchEmployees",
  authorizeRoles("admin", "hr"),
  officialBusiness.searchEmployees
);
router.put(
  "/adminedit_OB/:id",
  authorizeRoles("admin", "hr"),
  officialBusiness.editOfficialBusiness
);
router.put(
  "/adminreject_OB/:id",
  authorizeRoles("admin", "hr"),
  officialBusiness.rejectOfficialBusiness
);
router.post(
  "/adminApproved-Bulk",
  authorizeRoles("admin", "hr"),
  officialBusiness.bulkapproveOfficialBusiness
);

module.exports = router;
