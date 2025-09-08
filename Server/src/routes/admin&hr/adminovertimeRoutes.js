const OvertimeRoutes = require("../../controllers/Admin/adminovertimeController");
const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");

router.use(verifyJWT);

router.put("/adminApprove/:id", OvertimeRoutes.approveOvertimeRequest);
router.get("/getAllOvertimeRequests", OvertimeRoutes.getAllOvertimeRequests);
router.put("/bulkApprove/:id", OvertimeRoutes.bulkApproveOvertimeRequests);
router.put("/rejectovertime/:id", OvertimeRoutes.rejectOvertimeRequest);

module.exports = router;
