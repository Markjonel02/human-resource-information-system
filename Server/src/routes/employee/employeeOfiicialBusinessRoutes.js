const express = require("express");
const router = express.Router();
const addofficialBusiness = require("../../controllers/employee/requests_tab/employeeOBController.js");

router.post("/add_OB", addofficialBusiness.addOfficialBusiness);
router.get("/get_OB/:id", addofficialBusiness.getOfficialBusiness);

module.exports = router;
