const express = require("express");
const { getCurrentUser } = require("../../controllers/settings/details");
const { changePassword } = require("../../controllers/settings/changepassword");
const router = express.Router();
const authorizeRoles = require("../../middlewares/authorizeRole");
const verifyJWT = require("../../middlewares/verifyJWT");

router.use(verifyJWT); // Apply JWT verification middleware to all routes in this router

router.get(
  "/my-details",
  authorizeRoles("admin", "hr", "employee"),
  getCurrentUser
);

router.put(
  "/change-password",
  authorizeRoles("admin", "hr", "employee"),
  changePassword
);

module.exports = router;
