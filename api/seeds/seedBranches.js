// seeds/seedBranches.js
const mongoose = require("mongoose");
const Branch = require("../schemas/Branch");
const config = require("../config/config");

async function seedBranches() {
  await mongoose.connect(config.db.uri);

  await Branch.deleteMany();

  const branches = await Branch.insertMany([
    { name: "Computer Engineering" },
    { name: "Mechanical Engineering" },
  ]);

  console.log("Branches seeded:", branches);
}

module.exports = seedBranches;
