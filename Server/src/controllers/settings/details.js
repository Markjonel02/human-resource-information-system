const User = require("../../models/user"); // Adjust path as needed

/**
 * Get current user's details (excluding password)
 * @route GET /api/user/me
 * @access Private (requires authentication)
 */
const getCurrentUser = async (req, res) => {
  try {
    // Assuming req.user.id is set by authentication middleware
    const userId = req.user.id;

    // Find user and exclude password field
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentUser,
};
