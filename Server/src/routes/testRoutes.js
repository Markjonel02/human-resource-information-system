const express = require("express");
const router = express.Router();
const testusercreationController = require("../controllers/testusercreationController");

router.post("/testusercreation", testusercreationController.CreateEmployee);
module.exports = router;
