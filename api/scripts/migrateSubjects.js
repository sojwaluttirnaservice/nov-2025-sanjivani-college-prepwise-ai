const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
require("dotenv").config({ path: "../.env" }); // Adjust path as needed to find .env

const migrateSubjects = async () => {
  try {
    // Check if connection exists
    if (mongoose.connection.readyState !== 1) {
      console.log("DB not connected for migration. Skipping.");
      return;
    }

    const subjects = await Subject.find({ branchId: { $exists: true } });

    if (subjects.length === 0) {
      return; // Nothing to migrate
    }

    console.log(`Found ${subjects.length} subjects to migrate.`);

    for (const subject of subjects) {
      if (subject.branchId) {
        await Subject.updateOne(
          { _id: subject._id },
          {
            $set: { branches: [subject.branchId] },
            $unset: { branchId: "" },
          },
        );
        console.log(`Migrated subject: ${subject.name}`);
      }
    }

    console.log("Migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

module.exports = migrateSubjects;
