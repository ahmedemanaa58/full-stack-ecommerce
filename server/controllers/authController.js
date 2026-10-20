const User = require("../models/User");
const Notification = require("../models/Notification");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateOtp } = require("../services/otpGenerator");
const { sendMail } = require("../services/mail");
const { getIo } = require("../services/socket");

exports.register = async function (request, response, next) {
  try {
    const { email, password } = request.value;

    const user = await User.findOne({ email });

    if (user) {
      return response.status(409).json({ message: "Email already exists" });
    }

    const otp = generateOtp();

    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await User.create({
      email,
      password,
      otp,
      otpExpiresAt,
    });

    await sendMail({
      to: email,
      subject: "Verify your account",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    });

    return response.status(201).json({
      message: "User created. Please verify your email.",
      userId: newUser._id,
    });
  } catch (error) {
    console.log(error);

    return response.status(500).json({ message: "Internal Server Error" });
  }
};
exports.login = async function (request, response, next) {
  try {
    const { email, password } = request.value;
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(401).json({ message: "Invalid Credentials" });
    }
    if (!user.isVerified) {
      return response.status(403).json({
        message: "Please verify your email before logging in",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    const notification = await Notification.create({
      user: user._id,
      message: "you have logged in successfully",
      title: "login successfull!",
    });
    getIo().to(user._id).emit("notification", notification);
    return response.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
};
//verifyOTP
exports.verifyOTP = async function (req, res) {
  try {
    //get data
    const { email, otp } = req.value;

    //find by email
    const user = await User.findByEmail(email);

    //check if user dont exists
    if (!user) return res.status(404).json({ message: "user not found" });

    //check if user exists && verified
    if (user.isVerified)
      return res
        .status(403)
        .json({ message: "user already exists and verified" });

    //check otp and expiry time
    if (user.otp !== otp || user.otpExpiresAt < Date.now())
      return res.status(400).json({ message: "invalid otp or expired" });

    //clear otp and expiry date
    user.otp = null;
    user.otpExpiresAt = null;

    //verify user
    user.isVerified = true;

    //save user
    await user.save();

    //send response
    res.status(200).json({ message: "user verified successfully" });
  } catch (error) {
    console.log(`debug error >> inauth/verify-otp:${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};

//resendOTP
exports.resendOTP = async function (req, res) {
  try {
    //get data
    const { email } = req.value;

    //find by email
    const user = await User.findByEmail(email);

    //check if user dont exists
    if (!user) return res.status(404).json({ message: "user not found" });

    //check if user exists && verified
    if (user && user.isVerified)
      return res
        .status(403)
        .json({ message: "user already exists and verified" });

    //generate otp
    const otp = generateOtp();
    const otpExpiresAt = Date.now() + 1000 * 60 * 10;

    //update user
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

    //save user
    await user.save();

    //send otp
    await sendMail({
      to: email,
      subject: "verify your account",
      text: `your otp is:${otp}`,
    });

    //send response
    res.status(200).json({ message: "otp resent sucessfully" });
  } catch (error) {
    console.log(`debug error >> inauth/register:${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};
exports.getMe = async function (req, res) {
  try {
    //get id
    const userId = req.user._id;
    //get user by id
    const user = await User.findById(userId).select(
      "-password -otp -otpExpiresAt",
    );

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    //send respnose
    return res.status(200).json({ user });
  } catch (error) {
    console.log(`debug error >> inauth/get me:${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};
