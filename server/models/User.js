const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["renter", "owner"], default: "renter" },
});

module.exports = mongoose.model("User", userSchema);
