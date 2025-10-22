const Policy = require("../../../models/document/documentModel");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const fsPromises = fs.promises;

// Configure multer storage to preserve original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(global.uploadsDir, "policies");

    // Create directory if it doesn't exist (using sync method in callback)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Preserve original filename
    cb(null, file.originalname);
  },
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload PDF
const uploadPolicy = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, description } = req.body;

    if (!title) {
      // Delete uploaded file if validation fails
      await fsPromises.unlink(req.file.path);
      return res.status(400).json({ message: "Title is required" });
    }

    // Create relative path for database storage
    const relativePath = path.join("policies", req.file.originalname);

    const newPolicy = new Policy({
      title,
      description: description || "",
      filePath: relativePath,
      uploadedBy: req.user?.id || req.body.uploadedBy, // Adjust based on your auth setup
    });

    await newPolicy.save();

    res.status(201).json({
      message: "Policy uploaded successfully",
      policy: newPolicy,
    });
  } catch (error) {
    // Clean up file if database save fails
    if (req.file) {
      try {
        await fsPromises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    console.error("Upload error:", error);
    res.status(500).json({
      message: "Failed to upload policy",
      error: error.message,
    });
  }
};

// Get all policies
const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate("uploadedBy", "firstname lastname employeeEmail employeeId")
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error("Get policies error:", error);
    res.status(500).json({
      message: "Failed to retrieve policies",
      error: error.message,
    });
  }
};

// Get single policy by ID
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).populate(
      "uploadedBy",
      "firstname lastname employeeId employeeEmail"
    );

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("Get policy error:", error);
    res.status(500).json({
      message: "Failed to retrieve policy",
      error: error.message,
    });
  }
};

// Download PDF with original filename
const downloadPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const filePath = path.join(global.uploadsDir, policy.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Extract original filename from filePath
    const originalFilename = path.basename(policy.filePath);

    // Set headers for download with original filename
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalFilename}"`
    );

    // Send file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            message: "Error downloading file",
            error: err.message,
          });
        }
      }
    });
  } catch (error) {
    console.error("Download policy error:", error);
    res.status(500).json({
      message: "Failed to download policy",
      error: error.message,
    });
  }
};

// Update policy metadata (not the file)
const updatePolicy = async (req, res) => {
  try {
    const { title, description } = req.body;
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    if (title) policy.title = title;
    if (description !== undefined) policy.description = description;

    await policy.save();

    res.status(200).json({
      message: "Policy updated successfully",
      policy,
    });
  } catch (error) {
    console.error("Update policy error:", error);
    res.status(500).json({
      message: "Failed to update policy",
      error: error.message,
    });
  }
};

// Delete policy and file
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const filePath = path.join(global.uploadsDir, policy.filePath);

    // Delete file from filesystem
    try {
      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath);
      }
    } catch (error) {
      console.error("File deletion error:", error);
      // Continue with database deletion even if file doesn't exist
    }

    // Delete from database
    await Policy.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Policy deleted successfully",
    });
  } catch (error) {
    console.error("Delete policy error:", error);
    res.status(500).json({
      message: "Failed to delete policy",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadPolicy,
  getAllPolicies,
  getPolicyById,
  downloadPolicy,
  updatePolicy,
  deletePolicy,
};
