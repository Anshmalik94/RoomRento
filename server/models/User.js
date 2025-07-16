const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  role: { type: String, enum: ["renter", "owner"], default: "renter" },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  isVerified: { 
    type: Boolean, 
    default: false,
    get: function() {
      return this.emailVerified && this.phoneVerified;
    }
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model("User", userSchema);
