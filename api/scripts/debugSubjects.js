const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const listSubjects = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoURI =
        process.env.MONGODB_URI || "mongodb://localhost:27017/college-pro";
      await mongoose.connect(mongoURI);
    }

    const subjects = await Subject.find({});
    console.log(`\nTotal Subjects: ${subjects.length}`);
    subjects.forEach((s) => {
      console.log(`- [${s._id}] "${s.name}" (Code: ${s.code})`);
      console.log(`  branchId: ${s.branchId}`);
      console.log(`  branches: ${JSON.stringify(s.branches)}`);
      console.log(`  Created: ${s.createdAt}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

listSubjects();
