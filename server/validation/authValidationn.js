const joi = require("joi");

//login
exports.loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
});
//register
exports.registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
});
//verify otp
exports.verifyOTPSchema = joi.object({
  email: joi.string().email().required(),
  otp: joi.string().length(6).required(),
});

// resend otp
exports.resendOTPSchema = joi.object({
  email: joi.string().email().required(),
});
