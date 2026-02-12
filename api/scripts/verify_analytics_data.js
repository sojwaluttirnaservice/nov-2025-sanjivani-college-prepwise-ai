const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { QuizAttempt } = require("../schemas/QuizAttempt");
const { User } = require("../models/users.model"); // Adjust path if needed

const verifyData = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/prepwise"; // Fallback/Update as needed
    console.log("Connecting to MongoDB...", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    // 1. Count Total Attempts
    const totalAttempts = await QuizAttempt.countDocuments({});
    console.log(`Total QuizAttempts: ${totalAttempts}`);

    // 2. Count Submitted Attempts
    const submittedAttempts = await QuizAttempt.countDocuments({
      status: "SUBMITTED",
    });
    console.log(`Submitted QuizAttempts: ${submittedAttempts}`);

    if (submittedAttempts === 0) {
      console.log(
        "WARNING: No submitted attempts found! Dashboard will be empty.",
      );
    } else {
      // 3. Group by User
      const userStats = await QuizAttempt.aggregate([
        { $match: { status: "SUBMITTED" } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]);

      console.log("\nSubmitted Attempts by User:");
      userStats.forEach((stat) => {
        console.log(`User ID: ${stat._id} - Count: ${stat.count}`);
      });

      // 4. Sample Check one attempt
      const sample = await QuizAttempt.findOne({ status: "SUBMITTED" });
      console.log("\nSample Submitted Attempt:");
      console.log(`ID: ${sample._id}`);
      console.log(`User: ${sample.userId}`);
      console.log(`Status: ${sample.status}`);
      console.log(
        `CompletedAt: ${sample.completedAt} (Type: ${typeof sample.completedAt})`,
      );
    }

    console.log("\nDone.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

verifyData();
