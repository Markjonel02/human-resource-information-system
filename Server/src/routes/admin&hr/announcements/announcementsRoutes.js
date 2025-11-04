const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  bulkDeleteAnnouncements,
  initializeAutomaticSchedulers,
  triggerBirthdayCheck,
} = require("../../../controllers/Admin/announcements/announcementsController");
const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const authorizeRoles = require("../../../middlewares/authorizeRole");

// Apply JWT verification to all routes
router.use(verifyJWT);

// Initialize automatic birthday check and cleanup schedulers on app start
initializeAutomaticSchedulers();

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

// Delete single announcement (Admin only)
router.delete(
  "/delete-announcement/:id",
  authorizeRoles("admin"),
  deleteAnnouncement
);

// Bulk delete announcements (Admin only)
router.post(
  "/bulk-delete-announcements",
  authorizeRoles("admin"),
  bulkDeleteAnnouncements
);

// =====================
// OPTIONAL MANUAL TRIGGERS (For Admin Testing Only)
// =====================

// Manually trigger birthday check (optional - for testing)
router.post(
  "/trigger-birthday-check",
  authorizeRoles("admin"),
  triggerBirthdayCheck
);

module.exports = router;
