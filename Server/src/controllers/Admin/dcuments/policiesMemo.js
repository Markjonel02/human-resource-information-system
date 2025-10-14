const Policy = require("../../../models/document/documentModel");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const uploadsDir = path.join(global.uploadsDir, "policies");

// @desc    Upload policy PDF
// @route   POST /api/policies/upload
// @access  Private (Admin, HR)
const uploadPolicy = async (req, res) => {
  try {
    // Multer may provide req.file (single) or req.files (array) depending on middleware used.
    const file = req.file || (Array.isArray(req.files) && req.files[0]);
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, description } = req.body;
    const uploadedBy = req.user?.id || req.user?._id; // From JWT token

    if (!title) {
      // Delete uploaded file if validation fails
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ error: "Title is required" });
    }

    const policy = new Policy({
      title,
      description: description || "",
      filePath: file.filename,
      uploadedBy,
    });

    await policy.save();

    res.status(201).json({
      success: true,
      message: "Policy uploaded successfully",
      policy: {
        id: policy._id,
        title: policy.title,
        description: policy.description,
        uploadedAt: policy.uploadedAt,
      },
    });
  } catch (error) {
    // Clean up file if database save fails
    const file = req.file || (Array.isArray(req.files) && req.files[0]);
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    console.error("Upload Policy Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all policies
// @route   GET /api/policies
// @access  Private
const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate("uploadedBy", "firstname lastname")
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error("Get All Policies Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single policy by ID
// @route   GET /api/policies/:id
// @access  Private
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).populate(
      "uploadedBy",
      "firstname lastname"
    );

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("Get Policy By ID Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Download policy PDF
// @route   GET /api/policies/download/:id
// @access  Private
const downloadPolicy = async (req, res) => {
  try {
    // support both /:id and /:policyId route params
    const policyId = req.params.policyId || req.params.id || req.params.policy_id;

    if (!policyId || !mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({ error: "Valid policy ID is required" });
    }

    const policy = await Policy.findById(policyId);

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const filePath = path.join(uploadsDir, policy.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    res.setHeader("Content-Type", "application/pdf");
    // sanitize and fallback filename
    const safeTitle = (policy.title || "policy").replace(/["\\\/]/g, "_");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeTitle}.pdf"; filename*=UTF-8''${encodeURIComponent(safeTitle)}.pdf`
    );
    res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Type");

    const fileStream = fs.createReadStream(filePath);
    fileStream.on("error", (error) => {
      console.error("File Stream Error:", error);
      res.status(500).json({ error: "Error streaming file" });
    });
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download Policy Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    View policy PDF in browser
// @route   GET /api/policies/view/:id
// @access  Private
const viewPolicy = async (req, res) => {
  try {
    const policyId = req.params.policyId || req.params.id || req.params.policy_id;
    if (!policyId || !mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({ error: "Valid policy ID is required" });
    }

    const policy = await Policy.findById(policyId);
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    const filePath = path.join(uploadsDir, policy.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Set headers for inline viewing
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${policy.title}.pdf"`
    );

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on("error", (error) => {
      console.error("File Stream Error:", error);
      res.status(500).json({ error: "Error streaming file" });
    });
    fileStream.pipe(res);
  } catch (error) {
    console.error("View Policy Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update policy details
// @route   PUT /api/policies/:id
// @access  Private (Admin, HR)
const updatePolicy = async (req, res) => {
  try {
    const { title, description } = req.body;

    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    if (title) policy.title = title;
    if (description !== undefined) policy.description = description;

    await policy.save();

    res.status(200).json({
      success: true,
      message: "Policy updated successfully",
      policy,
    });
  } catch (error) {
    console.error("Update Policy Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete policy
// @route   DELETE /api/policies/:id
// @access  Private (Admin only)
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const filePath = path.join(uploadsDir, policy.filePath);

    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Policy.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Policy deleted successfully",
    });
  } catch (error) {
    console.error("Delete Policy Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// New: download by filename (fallback when frontend doesn't have ID)
const downloadPolicyByFilename = async (req, res) => {
  try {
    const raw = req.params.filename;
    if (!raw) {
      return res.status(400).json({ success: false, error: "Filename parameter is required" });
    }

    // decode and sanitize
    const filename = decodeURIComponent(raw).trim();
    if (!filename) {
      return res.status(400).json({ success: false, error: "Invalid filename" });
    }

    // first, try to find a policy document by exact filePath
    let policy = await Policy.findOne({ filePath: filename });

    // if not found, try suffix match (filePath may contain directories)
    if (!policy) {
      const escaped = filename.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"); // escape for regex
      policy = await Policy.findOne({ filePath: { $regex: `${escaped}$`, $options: "i" } });
    }

    // If still not found, try direct filesystem check: uploadsDir/filename
    let filePath;
    if (policy && policy.filePath) {
      filePath = path.join(uploadsDir, policy.filePath);
    } else {
      // fallback: direct file path under uploads/policies
      filePath = path.join(uploadsDir, filename);
      if (!fs.existsSync(filePath)) {
        // try to find any file that ends with filename
        const files = fs.readdirSync(uploadsDir);
        const match = files.find((f) => f.endsWith(filename));
        if (match) filePath = path.join(uploadsDir, match);
      }
    }

    if (!fs.existsSync(filePath)) {
      console.warn("Download by filename: file not found", { filename, resolved: filePath });
      return res.status(404).json({ success: false, error: "File not found on server" });
    }

    // set headers (CORS already applied globally in server.js)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Type");

    // safe filename for download
    const safeTitle = (policy?.title || path.basename(filePath)).replace(/["\\\/]/g, "_");
    const downloadName = `${safeTitle.endsWith(".pdf") ? safeTitle : safeTitle + ".pdf"}`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`
    );

    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => {
      console.error("File stream error (downloadPolicyByFilename):", err);
      if (!res.headersSent) res.status(500).json({ success: false, error: "Error streaming file" });
    });
    stream.pipe(res);
  } catch (err) {
    console.error("downloadPolicyByFilename error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

module.exports = {
  uploadPolicy,
  getAllPolicies,
  getPolicyById,
  downloadPolicy,
  viewPolicy,
  updatePolicy,
  deletePolicy,
  downloadPolicyByFilename, // ensure exported
};
