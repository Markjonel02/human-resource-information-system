const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const ConnectDB = async () => {
  const URI = "mongodb://localhost:27017/Hri-system";

  if (!URI) {
    console.log("MongoDB connection error: MONGO_URI is not defined.");
    process.exit(1);
  }

  try {
    await mongoose.connect(URI);
    console.log("MongoDB is successfully connected!");
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = ConnectDB;
