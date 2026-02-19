// seeds/seedSubjects.js
const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
const Branch = require("../schemas/Branch");
const config = require("../config/config");

const SUBJECTS = [
  {
    name: "Programming in C",
    code: "22CS101",
    branchName: "Computer Engineering",
    semester: 1,
    credits: 4,
  },
  {
    name: "Engineering Mathematics",
    code: "22MA101",
    branchName: "Computer Engineering",
    semester: 1,
    credits: 4,
  },
  {
    name: "Data Structures",
    code: "22CS201",
    branchName: "Computer Engineering",
    semester: 2,
    credits: 4,
  },
  {
    name: "Digital Electronics",
    code: "22EC201",
    branchName: "Computer Engineering",
    semester: 2,
    credits: 4,
  },
];

async function seedSubjects() {
  // await mongoose.connect(config.db.uri); // Removed: Use existing connection

  let seeded = 0;
  for (const subject of SUBJECTS) {
    const branch = await Branch.findOne({ name: subject.branchName });
    if (!branch) {
      console.warn(
        `⚠️  Branch "${subject.branchName}" not found — skipping subject "${subject.name}"`,
      );
      continue;
    }

    // Check for existing subject by name and branch (either new 'branches' array or old 'branchId')
    const existing = await Subject.findOne({
      name: subject.name,
      $or: [{ branches: branch._id }, { branchId: branch._id }],
    });
    if (!existing) {
      await Subject.create({
        name: subject.name,
        code: subject.code || subject.name.substring(0, 3).toUpperCase(),
        branches: [branch._id],
        semester: subject.semester,
        credits: subject.credits ?? 0,
      });
      seeded++;
    }
  }

  console.log(
    `✅ Subjects: ${seeded} added, ${SUBJECTS.length - seeded} already existed — skipped.`,
  );
}

module.exports = seedSubjects;
