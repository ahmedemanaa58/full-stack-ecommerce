const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

//user schema
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, minlength: 6, maxlength: 6 },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

//pre hook
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

//create custom function on collection
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

//user model
module.exports = model("User", userSchema);
