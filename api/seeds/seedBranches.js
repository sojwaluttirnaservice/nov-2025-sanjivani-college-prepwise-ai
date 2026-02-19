// seeds/seedBranches.js
const mongoose = require("mongoose");
const Branch = require("../schemas/Branch");
const config = require("../config/config");

const BRANCHES = [
  { name: "Computer Engineering" },
  { name: "Mechanical Engineering" },
];

async function seedBranches() {
  await mongoose.connect(config.db.uri);

  let seeded = 0;
  for (const branch of BRANCHES) {
    const existing = await Branch.findOne({ name: branch.name });
    if (!existing) {
      await Branch.create(branch);
      seeded++;
    }
  }

  console.log(
    `✅ Branches: ${seeded} added, ${BRANCHES.length - seeded} already existed — skipped.`,
  );
}

module.exports = seedBranches;
