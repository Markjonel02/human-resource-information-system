const {
  scheduleBirthdayCheck,
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../../../controllers/Admin/announcements/announcementsController");
const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const authorizeRoles = require("../../../middlewares/authorizeRole");

// Apply JWT verification to all routes
router.use(verifyJWT);

// Initialize birthday scheduler on app start (only once)
scheduleBirthdayCheck();

// =====================
// PUBLIC ROUTES (All authenticated users)
// =====================

// Get all announcements
router.get("/get-announcements", getAnnouncements);

// Get single announcement by ID
router.get("/get-announcement/:id", getAnnouncementById);

// =====================
// ADMIN ONLY ROUTES
// =====================

// Create announcement (Admin only)
router.post(
  "/create-announcements",
  authorizeRoles("admin"),
  createAnnouncement
);

// Update announcement (Admin only)
router.put(
  "/update-announcement/:id",
  authorizeRoles("admin"),
  updateAnnouncement
);

// Delete announcement (Admin only)
router.delete(
  "/delete-announcement/:id",
  authorizeRoles("admin"),
  deleteAnnouncement
);

module.exports = router;
