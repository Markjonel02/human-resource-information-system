const mongoose = require("mongoose");
const bcyrpt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  useername: { type: String, required: true },
  password: { type: String, required: true },
  email: {},
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password is unchanged

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
module.exports = mongoose.model("Users", UserSchema);
