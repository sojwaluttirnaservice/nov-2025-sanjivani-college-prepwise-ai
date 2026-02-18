const seedBranches = require("./seedBranches");
const seedSubjects = require("./seedSubjects");
const seedTopics = require("./seedTopics");
const seedUnits = require("./seedUnits");
const seedAdmin = require("./seedAdmin");

async function runSeeds() {
  try {
    console.log("🌱 Seeding started...\n");

    await seedBranches();
    await seedSubjects();
    await seedUnits();
    await seedTopics();
    await seedAdmin();

    console.log("\n✅ All seeds completed");
  } catch (err) {
    console.error("Error while seeding:", err);
  } finally {
    process.exit(0);
  }
}

runSeeds();
