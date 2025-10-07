const Policy = require("../../../models/document/documentModel");
const path = require("path");
const fs = require("fs");
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const title = req.body.title || req.file.originalname;

    // Create new record in MongoDB
    const newDoc = new Policy({
      title,
      description: req.body.description || "",
      filePath,
      uploadedBy: req.user ? req.user._id : null, // if using auth middleware
    });

    await newDoc.save();

    return res.status(200).json({
      message: "Uploaded successfully",
      document: newDoc,
    });
  } catch (err) {
    console.error("Error in uploadPdf:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
// --- Get all uploaded PDFs ---
const getAllPdfs = async (req, res) => {
  try {
    const documents = await Policy.find().sort({ uploadedAt: -1 });
    return res.status(200).json(documents);
  } catch (err) {
    console.error("Error in getAllPdfs:", err);
    return res.status(500).json({ message: "Failed to fetch policies" });
  }
};

const downloadPdf = async (req, res) => {
  try {
    const { filename } = req.params;

    // Construct the file path
    const filePath = path.join(__dirname, "../../../uploads", filename);

    console.log("Download request for:", filename);
    console.log("Full file path:", filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      return res.status(404).json({ message: "File not found" });
    }

    // Get file stats
    const stat = fs.statSync(filePath);

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      message: "Error downloading file",
      error: error.message,
    });
  }
};

module.exports = { uploadPdf, getAllPdfs, downloadPdf };
