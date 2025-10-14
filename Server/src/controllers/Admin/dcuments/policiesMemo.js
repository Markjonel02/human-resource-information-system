const Policy = require("../../../models/document/documentModel");
const path = require("path");
const fs = require("fs");
// const uploadsDir = global.uploadsDir; <-- old, incorrect
// Use the same folder multer stores files in (global.uploadsDir + '/policies')
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
    const { policyId } = req.params;

    if (!policyId) {
      return res.status(400).json({ error: "Policy ID is required" });
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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${policy.title}.pdf"`
    );

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
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

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

module.exports = {
  uploadPolicy,
  getAllPolicies,
  getPolicyById,
  downloadPolicy,
  viewPolicy,
  updatePolicy,
  deletePolicy,
};
