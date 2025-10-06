const policies = require("../../../models/document/documentModel");
const path = require("path");
const uploadPdf = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const newDoc = new Document({
      title: req.body.title || req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      uploadedBy: req.user?._id || null,
    });

    await newDoc.save();

    return res.status(200).json({
      message: "PDF uploaded successfully",
      document: newDoc,
    });
  } catch (err) {
    console.error("Upload PDF Error:", err);
    res
      .status(500)
      .json({ message: "Failed to upload PDF", error: err.message });
  }
};

// Get all uploaded PDFs
const getAllPdfs = async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.status(200).json(docs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch documents", error: err.message });
  }
};

module.exports = { uploadPdf, getAllPdfs };
