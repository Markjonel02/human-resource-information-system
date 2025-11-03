const {
  scheduleBirthdayCheck,
  createAnnouncement,
  getAnnouncements,
} = require("../../../controllers/Admin/announcements/announcementsController");
const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const authorizeRoles = require("../../../middlewares/authorizeRole");
router.use(verifyJWT);

// Initialize birthday scheduler on app start
scheduleBirthdayCheck();

router.post("/announcements", authorizeRoles("admin"), createAnnouncement);
router.get("/announcements", getAnnouncements);

module.exports = router;
