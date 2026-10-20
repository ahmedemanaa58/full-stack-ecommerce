//req nodemailer
const { options } = require("joi");
const nodemailer = require("nodemailer");

// transport
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

// send mail
exports.sendMail = async function (options) {
  try {
    await transporter.sendMail({ from: process.env.MAIL_USER, ...options });
    console.log("debug success >> mail service sent");
  } catch (error) {
    console.log(`debug failed >> mail service : ${error}`);
  }
};
