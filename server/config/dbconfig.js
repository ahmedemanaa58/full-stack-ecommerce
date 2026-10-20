const mongoose = require("mongoose");
exports.connectToDatabase = async function () {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log('debug success>> database connection established')
  } catch (error) {
    console.log(`debug failed>>database connection ${error}`)
  }
};
