// seeds/seedSubjects.js
const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
const Branch = require("../schemas/Branch");
const config = require("../config/config");

const SUBJECTS = [
  { name: "Programming in C", branchName: "Computer Engineering", semester: 1 },
  {
    name: "Engineering Mathematics",
    branchName: "Computer Engineering",
    semester: 1,
  },
  { name: "Data Structures", branchName: "Computer Engineering", semester: 2 },
  {
    name: "Digital Electronics",
    branchName: "Computer Engineering",
    semester: 2,
  },
];

async function seedSubjects() {
  await mongoose.connect(config.db.uri);

  let seeded = 0;
  for (const subject of SUBJECTS) {
    const branch = await Branch.findOne({ name: subject.branchName });
    if (!branch) {
      console.warn(
        `⚠️  Branch "${subject.branchName}" not found — skipping subject "${subject.name}"`,
      );
      continue;
    }

    const existing = await Subject.findOne({
      name: subject.name,
      branchId: branch._id,
    });
    if (!existing) {
      await Subject.create({
        name: subject.name,
        branchId: branch._id,
        semester: subject.semester,
      });
      seeded++;
    }
  }

  console.log(
    `✅ Subjects: ${seeded} added, ${SUBJECTS.length - seeded} already existed — skipped.`,
  );
}

module.exports = seedSubjects;
