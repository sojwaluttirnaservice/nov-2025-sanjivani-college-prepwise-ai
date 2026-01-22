const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
  console.log("connetion started");
  try {
    let res = await mongoose.connect(config.db.uri);
    // console.log(res);
    console.log(`🚀 MongoDB connected (${config.server.env})`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
