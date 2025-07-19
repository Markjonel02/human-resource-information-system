const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jwtwebtoken");
const dotenv =require("dotenv")
dotenv.config();
//generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      //add more claims here e.g, isAdmin:user.isAdmin
      corporaterank: user.corporaterank,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" } // Access token Expires on 15 minutes
  );
};

// generate RefreshToken
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "7d",
  });
};

const authController = {
  //Register User
  register: async (req, res) => {try {
    const existingUser = await.User.findOne
  } catch (error) {
    
  }},
};
