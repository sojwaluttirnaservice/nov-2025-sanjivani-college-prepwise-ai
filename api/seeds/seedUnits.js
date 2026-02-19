// seeds/seedUnits.js
const mongoose = require("mongoose");
const Subject = require("../schemas/Subject");
const Unit = require("../schemas/Unit");
const config = require("../config/config");

const UNITS = [
  { subjectName: "Programming in C", name: "Introduction to C", unitNumber: 1 },
  {
    subjectName: "Programming in C",
    name: "Control Structures",
    unitNumber: 2,
  },
];

async function seedUnits() {
  await mongoose.connect(config.db.uri);

  let seeded = 0;
  for (const unit of UNITS) {
    const subject = await Subject.findOne({ name: unit.subjectName });
    if (!subject) {
      console.warn(
        `⚠️  Subject "${unit.subjectName}" not found — skipping unit "${unit.name}"`,
      );
      continue;
    }

    const existing = await Unit.findOne({
      name: unit.name,
      subjectId: subject._id,
    });
    if (!existing) {
      await Unit.create({
        name: unit.name,
        subjectId: subject._id,
        unitNumber: unit.unitNumber,
      });
      seeded++;
    }
  }

  console.log(
    `✅ Units: ${seeded} added, ${UNITS.length - seeded} already existed — skipped.`,
  );
}

module.exports = seedUnits;
