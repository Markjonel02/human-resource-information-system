const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const ConnectDB = async () => {
  const URI = process.env.MONGO_URI;

  if (!URI) {
    console.log("MongoDB connection error: MONGO_URI is not defined.");
    process.exit(1);
  }
  mongoose
    .connect(URI)
    .then(() => console.log("MongoDb Is sucessfully connected!"))
    .catch(() => console.log("MongoDb error connection"));
};

module.exports = ConnectDB;
