const Policy = require("../../../models/document/documentModel");
const path = require("path");
const fs = require("fs");

// Upload PDF
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, description } = req.body;

    if (!title) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Title is required" });
    }

    // Create relative path for storage
    const relativePath = `uploads/${req.file.filename}`;

    const newPolicy = new Policy({
      title,
      description: description || "",
      filePath: relativePath,
      uploadedBy: req.user._id,
    });

    await newPolicy.save();

    res.status(201).json({
      message: "File uploaded successfully",
      policy: newPolicy,
    });
  } catch (error) {
    // Clean up file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Error uploading file",
      error: error.message,
    });
  }
};

// Get all PDFs
const getAllPdfs = async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate("uploadedBy", "name email")
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error("Get all PDFs error:", error);
    res.status(500).json({
      message: "Error fetching files",
      error: error.message,
    });
  }
};

// Download PDF
const downloadPdf = async (req, res) => {
  console.log("\n========================================");
  console.log("=== DOWNLOAD REQUEST RECEIVED ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("Request query:", req.query);
  console.log("Request headers:", req.headers);
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("========================================\n");

  try {
    const { filename } = req.params;

    console.log("1. Extracting filename:", filename);

    // Sanitize filename to prevent path traversal attacks
    const sanitizedFilename = path.basename(filename);
    console.log("2. Sanitized filename:", sanitizedFilename);

    // Construct the file path
    const filePath = path.join(
      __dirname,
      "../../../../uploads",
      sanitizedFilename
    );
    console.log("3. Full file path:", filePath);
    console.log("4. __dirname:", __dirname);

    // Check if file exists
    console.log("5. Checking if file exists...");
    if (!fs.existsSync(filePath)) {
      console.error("❌ FILE NOT FOUND:", filePath);

      // List files in uploads directory
      const uploadsDir = path.join(__dirname, "../../../../uploads");
      console.log("\n=== FILES IN UPLOADS DIRECTORY ===");
      try {
        const files = fs.readdirSync(uploadsDir);
        console.log("Files found:", files);
      } catch (err) {
        console.error("Error reading uploads directory:", err);
      }
      console.log("===================================\n");

      return res.status(404).json({ message: "File not found" });
    }

    console.log("✅ File exists!");

    // Verify it's actually a PDF file
    const fileExt = path.extname(filePath).toLowerCase();
    console.log("6. File extension:", fileExt);

    if (fileExt !== ".pdf") {
      console.error("❌ INVALID FILE TYPE:", fileExt);
      return res.status(400).json({ message: "Invalid file type" });
    }

    console.log("✅ File type is valid (PDF)");

    // Get file stats
    console.log("7. Getting file stats...");
    const stat = fs.statSync(filePath);
    console.log("✅ File size:", stat.size, "bytes");

    // Set CORS headers FIRST
    console.log("8. Setting CORS headers...");
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.CLIENT_ORIGIN || "http://localhost:5173"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Set download headers
    console.log("9. Setting download headers...");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", stat.size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sanitizedFilename}"`
    );
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    console.log("10. Creating file stream...");
    // Stream the file
    const fileStream = fs.createReadStream(filePath);

    // Handle stream errors
    fileStream.on("error", (error) => {
      console.error("❌ STREAM ERROR:", error);
      if (!res.headersSent) {
        res.status(500).json({
          message: "Error streaming file",
          error: error.message,
        });
      }
    });

    fileStream.on("open", () => {
      console.log("✅ File stream opened successfully");
    });

    fileStream.on("end", () => {
      console.log("✅ File stream ended successfully");
      console.log("========================================\n");
    });

    console.log("11. Piping file to response...");
    fileStream.pipe(res);
  } catch (error) {
    console.error("\n========================================");
    console.error("❌ DOWNLOAD ERROR:", error);
    console.error("Error stack:", error.stack);
    console.error("========================================\n");

    if (!res.headersSent) {
      res.status(500).json({
        message: "Error downloading file",
        error: error.message,
      });
    }
  }
};
module.exports = { uploadPdf, getAllPdfs, downloadPdf };
