const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Announcement = require("../../../models/Announcements/announcementsModel");

// Create Announcement (Admin only)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, expiresAt, priority } = req.body;

    console.log("DEBUG: req.user =", req.user);
    console.log("DEBUG: req.body =", req.body);

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required and cannot be empty",
      });
    }

    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiration date format",
        });
      }

      if (expirationDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiration date must be in the future",
        });
      }
    }

    const validPriorities = [1, 2, 3];
    const parsedPriority = parseInt(priority);
    if (isNaN(parsedPriority) || !validPriorities.includes(parsedPriority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be 1 (High), 2 (Medium), or 3 (Low)",
      });
    }

    const validTypes = ["general", "birthday", "system", "urgent"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement type",
      });
    }

    if (!req.user || !req.user._id) {
      console.error("ERROR: Authentication failed - req.user is:", req.user);
      return res.status(401).json({
        success: false,
        message:
          "User not authenticated. Make sure you're logged in and your token is valid.",
      });
    }

    const announcement = new Announcement({
      title: title.trim(),
      content: content.trim(),
      type: type || "general",
      postedBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      priority: parsedPriority,
    });

    await announcement.save();
    await announcement.populate("postedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error creating announcement",
      error: error.message,
    });
  }
};

// Get All Announcements
const getAnnouncements = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    filter.$or = [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }];

    const announcements = await Announcement.find(filter)
      .populate("postedBy", "firstname employeeEmail employeeId lastname role")
      .sort({ priority: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};

// Get Single Announcement
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    const announcement = await Announcement.findById(id).populate(
      "postedBy",
      "name email"
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcement",
      error: error.message,
    });
  }
};

// Update Announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, expiresAt, priority, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        content,
        type,
        expiresAt,
        priority,
        isActive,
      },
      { new: true, runValidators: true }
    ).populate("postedBy", "name email");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating announcement",
      error: error.message,
    });
  }
};

// Delete Announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error: error.message,
    });
  }
};

// Bulk Delete Announcements
const bulkDeleteAnnouncements = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one announcement ID to delete",
      });
    }

    const validIds = ids.every((id) => mongoose.Types.ObjectId.isValid(id));
    if (!validIds) {
      return res.status(400).json({
        success: false,
        message: "One or more invalid announcement IDs provided",
      });
    }

    console.log(`🗑️ Attempting to delete ${ids.length} announcements:`, ids);

    const result = await Announcement.deleteMany({
      _id: { $in: ids },
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No announcements found to delete",
      });
    }

    console.log(`✅ Successfully deleted ${result.deletedCount} announcements`);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} announcement(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error bulk deleting announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting announcements",
      error: error.message,
    });
  }
};

// =====================
// BIRTHDAY AUTOMATION
// =====================

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Create Birthday Announcement
const createBirthdayAnnouncement = async (employee) => {
  try {
    const fullName = `${employee.firstname} ${employee.lastname}`;
    const birthdayMessage = `🎉 Happy Birthday! 🎂\n\nWishing ${fullName} a wonderful birthday filled with joy, health, and success! We're grateful to have you as part of our team.`;

    // Check if birthday announcement already exists today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAnnouncement = await Announcement.findOne({
      type: "birthday",
      postedBy: employee._id,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingAnnouncement) {
      console.log(`Birthday announcement already exists for ${fullName}`);
      return existingAnnouncement;
    }

    const announcement = new Announcement({
      title: `Happy Birthday, ${employee.firstname}! 🎉`,
      content: birthdayMessage,
      type: "birthday",
      postedBy: employee._id,
      priority: 1,
      isActive: true,
    });

    await announcement.save();
    await announcement.populate(
      "postedBy",
      "firstname lastname employeeEmail role"
    );

    console.log(`✅ Birthday announcement created for ${fullName}`);

    return announcement;
  } catch (error) {
    console.error("Error creating birthday announcement:", error);
    throw error;
  }
};

// Send Birthday Email with Announcement Details
const sendBirthdayEmail = async (employee) => {
  try {
    const fullName = `${employee.firstname} ${employee.lastname}`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h1 style="color: #ff6b6b; text-align: center; font-size: 32px;">🎉 Happy Birthday! 🎂</h1>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="font-size: 18px; margin: 0;">Dear ${fullName},</p>
            </div>

            <p style="font-size: 16px; color: #555; line-height: 1.6; text-align: center;">
              We're thrilled to celebrate your special day today! 🥳
            </p>

            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Wishing you a wonderful birthday filled with:
            </p>
            <ul style="font-size: 15px; color: #666; line-height: 1.8;">
              <li>✨ Joy and happiness</li>
              <li>💪 Good health and vitality</li>
              <li>🎯 Success in all your endeavors</li>
              <li>❤️ Love and appreciation from your colleagues</li>
            </ul>

            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              Thank you for being a valuable and wonderful member of our team. Your contributions and positive attitude make a real difference!
            </p>

            <div style="background-color: #f0f8ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="font-size: 14px; color: #333; margin: 0;">
                <strong>📢 Your Birthday Announcement</strong> has been posted to the announcements page for everyone to see and celebrate with you!
              </p>
            </div>

            <p style="font-size: 15px; color: #555; line-height: 1.6; text-align: center;">
              Best wishes from your entire team! 🎊
            </p>

            <hr style="border: none; border-top: 2px solid #ff6b6b; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              <strong>Your Company Name | HR Department</strong><br>
              Celebrating every milestone with our team members
            </p>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employee.employeeEmail,
      subject: `🎉 Happy Birthday, ${employee.firstname}! We're Celebrating You Today!`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Birthday email sent to ${employee.employeeEmail}`);

    return true;
  } catch (error) {
    console.error("Error sending birthday email:", error);
    throw error;
  }
};

// Check for Birthdays and Auto-Create Announcements
const checkBirthdays = async () => {
  try {
    console.log("🎂 Running birthday check...");
    const User = mongoose.model("user");
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    // Find employees with birthday today
    const employees = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$birthday" }, parseInt(month)] },
          { $eq: [{ $dayOfMonth: "$birthday" }, parseInt(day)] },
        ],
      },
    });

    if (employees.length > 0) {
      console.log(`🎉 Found ${employees.length} birthday(s) today!`);

      for (const employee of employees) {
        try {
          // Create birthday announcement
          const announcement = await createBirthdayAnnouncement(employee);

          // Send email to employee
          await sendBirthdayEmail(employee);

          console.log(
            `✅ Birthday notification sent for ${employee.firstname} ${employee.lastname}`
          );
        } catch (error) {
          console.error(
            `❌ Error processing birthday for ${employee.firstname}:`,
            error
          );
        }
      }

      console.log(`✅ ${employees.length} birthday notification(s) processed`);
    } else {
      console.log("ℹ️ No birthdays today");
    }
  } catch (error) {
    console.error("❌ Error checking birthdays:", error);
  }
};

// Schedule Birthday Check (Every day at 8:00 AM)
const scheduleBirthdayCheck = () => {
  cron.schedule("0 8 * * *", () => {
    console.log("⏰ Scheduled birthday check triggered at 8:00 AM");
    checkBirthdays();
  });
  console.log("✅ Birthday scheduler initialized - checks daily at 8:00 AM");
};

// Manual birthday check endpoint (for testing)
const triggerBirthdayCheck = async (req, res) => {
  try {
    console.log("🔔 Manual birthday check triggered");
    await checkBirthdays();
    res.status(200).json({
      success: true,
      message: "Birthday check completed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking birthdays",
      error: error.message,
    });
  }
};

// =====================
// EXPORTS
// =====================

module.exports = {
  // Announcement CRUD
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  bulkDeleteAnnouncements,

  // Birthday Automation
  checkBirthdays,
  scheduleBirthdayCheck,
  createBirthdayAnnouncement,
  sendBirthdayEmail,
  triggerBirthdayCheck,
};
