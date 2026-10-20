const otpGenerator = require("otp-generator");

exports.generateOtp = function () {
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });
};
