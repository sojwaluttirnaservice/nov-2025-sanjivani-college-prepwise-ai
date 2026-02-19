const mongoose = require("mongoose");
const seedBranches = require("./seedBranches");
const seedSubjects = require("./seedSubjects");
const seedTopics = require("./seedTopics");
const seedUnits = require("./seedUnits");
const seedAdmin = require("./seedAdmin");

async function runSeeds() {
  try {
    console.log("🌱 Seeding started...\n");

    // Ensure connection is ready before running
    if (mongoose.connection.readyState !== 1) {
      console.log("Waiting for DB connection...");
      // In a real startup flow, we expect connection to be established by bin/www
    }

    await seedBranches();
    await seedSubjects();
    await seedUnits();
    await seedTopics();
    await seedAdmin();

    console.log("\n✅ All seeds completed");
  } catch (err) {
    console.error("Error while seeding:", err);
    // Do not exit process, just log error
  }
}

module.exports = runSeeds;
