const express = require("express");
const router = express.Router();
const addofficialBusiness =
  require("../../controllers/employee/requests_tab/employeeOBController").addofficialBusiness;

router.post("/add_OB", addofficialBusiness);

module.exports = router;

