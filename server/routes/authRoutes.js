//req router
const router = require("express").Router();

// exports router
module.exports = router;
//req controller
const authController = require("../controllers/authController.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const { validateMiddleware } = require("../middlewares/validatorMiddleware.js");
const authValidator = require("../validation/authValidationn.js");

// login
router.post(
  "/login",
  validateMiddleware(authValidator.loginSchema),
  authController.login,
);

// register
router.post(
  "/register",
  validateMiddleware(authValidator.registerSchema),
  authController.register,
);

// verifyOTP
router.post(
  "/verify-OTP",
  validateMiddleware(authValidator.verifyOTPSchema),
  authController.verifyOTP,
);

// resendOTP
router.post(
  "/resend-OTP",
  validateMiddleware(authValidator.resendOTPSchema),
  authController.resendOTP,
);
router.get("/me",authMiddleware,authController.getMe)
