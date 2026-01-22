// seeds/seedSubjects.js
const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
const Branch = require("../schemas/Branch");
const config = require("../config/config");

async function seedSubjects() {
  await mongoose.connect(config.db.uri);

  const computerBranch = await Branch.findOne({ name: "Computer Engineering" });

  await Subject.deleteMany({ branchId: computerBranch._id });

  const subjects = await Subject.insertMany([
    {
      name: "Programming in C",
      branchId: computerBranch._id,
      semester: 1,
    },
    {
      name: "Engineering Mathematics",
      branchId: computerBranch._id,
      semester: 1,
    },
    {
      name: "Data Structures",
      branchId: computerBranch._id,
      semester: 2,
    },
    {
      name: "Digital Electronics",
      branchId: computerBranch._id,
      semester: 2,
    },
  ]);

  console.log("Subjects seeded:", subjects);
}

module.exports = seedSubjects;
