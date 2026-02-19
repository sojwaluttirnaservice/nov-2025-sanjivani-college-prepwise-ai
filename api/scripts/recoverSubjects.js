const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
const Branch = require("../schemas/Branch");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const SUBJECTS_DATA = [
  { name: "Programming in C", branchName: "Computer Engineering" },
  { name: "Engineering Mathematics", branchName: "Computer Engineering" },
  { name: "Data Structures", branchName: "Computer Engineering" },
  { name: "Digital Electronics", branchName: "Computer Engineering" },
];

const recoverSubjects = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoURI = process.env.MONGODB_URI;
      console.log("Connecting to:", mongoURI);
      await mongoose.connect(mongoURI);
    }

    console.log("Starting recovery...");

    for (const data of SUBJECTS_DATA) {
      const branch = await Branch.findOne({ name: data.branchName });
      if (!branch) {
        console.log(`Branch not found: ${data.branchName}`);
        continue;
      }

      const subject = await Subject.findOne({ name: data.name });
      if (!subject) {
        console.log(`Subject not found: ${data.name}`);
        continue;
      }

      if (!subject.branches || subject.branches.length === 0) {
        console.log(`Recovering ${subject.name} -> ${branch.name}`);
        subject.branches = [branch._id];
        await subject.save();
        console.log("Saved.");
      } else {
        console.log(`Subject ${subject.name} already has branches.`);
      }
    }

    console.log("Recovery complete.");
    process.exit(0);
  } catch (error) {
    console.error("Recovery failed:", error);
    process.exit(1);
  }
};

recoverSubjects();
