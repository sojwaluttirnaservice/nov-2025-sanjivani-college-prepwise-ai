const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
require("dotenv").config({ path: "../.env" });

const checkDuplicates = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoURI =
        process.env.MONGODB_URI || "mongodb://localhost:27017/college-pro";
      await mongoose.connect(mongoURI);
    }

    const subjects = await Subject.find({});
    const counts = {};
    const duplicates = [];

    subjects.forEach((s) => {
      if (counts[s.name]) {
        duplicates.push(s.name);
      }
      counts[s.name] = (counts[s.name] || 0) + 1;
    });

    if (duplicates.length > 0) {
      console.log("❌ Duplicates found:", [...new Set(duplicates)]);

      // Log details
      for (const name of [...new Set(duplicates)]) {
        const subs = await Subject.find({ name }).sort({ createdAt: 1 });
        console.log(`\nDuplicate Group: ${name}`);
        subs.forEach((s) => {
          console.log(
            ` - ID: ${s._id}, Created: ${s.createdAt}, BranchId: ${s.branchId}, Branches: ${s.branches}`,
          );
        });
      }
    } else {
      console.log("✅ No duplicates found.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkDuplicates();
